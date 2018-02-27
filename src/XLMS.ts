/**
 * Created by riggs on 7/31/16.
 *
 * API for plugins.
 */

import { DEVEL, DEBUG, ERROR } from "./utils";


/**
 * Takes an object with HID message names as keys and function to call for each message as values.
 */
export interface message_handlers {[name: string]: (...args: any[]) => void}
export function register_USB_message_handlers(handlers: message_handlers) {
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
    // TODO: Forward accordingly
}
if (DEVEL) { window.devel.exit = exit; }