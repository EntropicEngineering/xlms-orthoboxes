/**
 * Created by riggs on 7/31/16.
 *
 * API for plugins.
 */
"use strict";


import { DEVEL, DEBUG, WARN, ERROR } from "./utils";
import { User_Input_State } from "./UI_utils";


export class Window_Closed_Error extends Error {}


let HID_handler = { func: (event) => HID_handler.cache.push(event.data), cache: [] };   // By default, cache messsages for later.


function send(request) {
    return new Promise((resolve, reject) => {
        user_input_port.postMessage(request);
        respond = resolve;
    });
}


function handle_user_input_response(event) {
    if ( respond !== null ) {
        let { result } = event.data;
        DEBUG(`respond(${result})`);
        respond(result);
        respond = null;
    } else {
        WARN("unhandled event:", event);
    }
}

export const user_input_state = new User_Input_State();
if (DEVEL) {
    window.devel.user_input_state = user_input_state;
}

export function user_input(message: typeof user_input_state.message, options: typeof user_input_state.options) {
    user_input_state.id++;
    user_input_state.options = options;
    user_input_state.message = message;
}

export function cancel_user_input(id: number) {
    if (user_input_state.id === id) {
        user_input_state.message = '';
    }
}


/**
 * Takes an object with HID message names as keys and function to call for each message as values.
 */
export function register_USB_message_handlers(handlers) {
    function handle(message) {
        DEBUG(message);
        let { name, data } = message;
        let func = handlers[name];
        switch ( typeof func ) {
            case "function":
                return func(...data);
            case "undefined":
                DEBUG(name, ...data);
                break;
            default:
                ERROR(`Bad message handler for ${name}.`);
        }
    }

    if ( HID_message_port !== null ) {
        // Call the handler with all the cached messages.
        while ( HID_handler.cache.length ) {
            handle(HID_handler.cache.shift());
        }
        // Once caught up, replace caching message handler.
        HID_message_port.onmessage = (event) => handle(event.data);
    } else {
        // If this function is called before the message port is received, use this handler from the start.
        HID_handler.func = handle;
    }
}


export let session_data_promise = new Promise((resolve, reject) => {
    window.addEventListener('message', (event) => {
        if ( event.data.type === "initialization" ) {
            source_window = event.source;
            [user_input_port, HID_message_port, admin_message_port] = event.ports;
            user_input_port.onmessage = handle_user_input_response;
            HID_message_port.onmessage = (event) => HID_handler.func(event.data);
            admin_message_port.onmessage = admin_message_handler;

            resolve(event.data.session_data);
        } else {
            reject(`Unknown message: ${event}`);
        }
    });
});


export function send_results(results) {
    DEBUG(`admin_message_port.postMessage({type: "results", ${results}});`);
    admin_message_port.postMessage({ type: "results", results });
}


export function exit() {
    admin_message_port.postMessage({ type: "exit" })
}