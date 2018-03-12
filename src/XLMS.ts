/**
 * Created by riggs on 7/31/16.
 *
 * API for plugins.
 */

import {
    DEVEL,
    DEBUG,
    ERROR
} from "./utils";

import { Device, Report } from "simple-hid";
import { session_data_identifier, endpoint_identifier, redirect_identifier } from "./constants"

export interface REST_Data {
    id: string,
    exercise: string,
    course: string,
    result_id: string,
    trainer_id: string | null,
    session_data: string | null,
    start_time: string | null,
    elapsed_time: string | null,
    success: string,
    closed: string,
    kurento_url: string,
    kurento_video_directory: string,
    name: string | null,
    interface: string,
    hardware: Array<USBDeviceFilter>,
    metrics: any,
    configuration: any,
}

export interface message_handlers {[name: string]: (arg: any) => void}

/**
 * Takes an object with HID message names as keys and function to call for each message as values.
 */
export async function initialize_device(session_data: REST_Data, handlers: message_handlers) {

    let device = await Device.connect(...session_data.hardware);
    if ( DEVEL ) { window.devel.device = device; window.devel.handlers = handlers }

    function handle(report: Report) {
        DEBUG(report);
        let { id, data } = report;
        let func = handlers[device.reports!.input[id].name!];
        switch ( typeof func ) {
            case "function":
                return func(data);
            default:
                ERROR(`No message handler for ${report}.`);
        }
    }

    async function poll() {
        handle(await device.receive());
        setTimeout(poll, 0);
    }

    poll();

    // TODO: Handle hardware disconnect gracefully.

    // Initialize device
    // device.set_feature('config', session_data.configuration);
    // FIXME: Hack because firmware is lazy
    const config = (await device.get_feature('config')).data;
    session_data.configuration.item_order = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
    Object.assign(config, session_data.configuration);
    await device.set_feature('config', config);
    device.send('timestamp', [Date.now()]);
}


export function get_session_data() {
    return JSON.parse(sessionStorage.getItem(session_data_identifier)!) as REST_Data;
}


export interface Results {
    success: number,
    start_time: number,
    elapsed_time: number,
    results: {
        wall_errors: Array<{ timestamp: number, duration: number }>,
        drop_errors: Array<{ timestamp: number }>
    }
}

export async function send_results(results: Results) {
    const endpoint = sessionStorage.getItem(endpoint_identifier)!;
    let response = await fetch(new URL(endpoint).href, {
        method: 'put',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(results)
    });
    // TODO: Error handling, via user_input.
    return response.ok;
}

export function exit() {
    location.replace(new URL(sessionStorage.getItem(redirect_identifier)!).href)
}

if ( DEVEL ) { window.devel.exit = exit; }