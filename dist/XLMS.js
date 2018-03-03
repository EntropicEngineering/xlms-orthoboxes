/**
 * Created by riggs on 7/31/16.
 *
 * API for plugins.
 */
import { DEVEL, DEBUG, ERROR } from "./utils";
import { Device } from "simple-hid";
import { session_data_identifier, endpoint_identifier, redirect_identifier } from "./constants";
/**
 * Takes an object with HID message names as keys and function to call for each message as values.
 */
export async function initialize_device(session_data, handlers) {
    let device = await Device.connect(...session_data.hardware);
    if (DEVEL) {
        window.devel.device = device;
    }
    function handle(report) {
        DEBUG(report);
        let { id, data } = report;
        let func = handlers[device.reports.input[id].name];
        switch (typeof func) {
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
    // Initialize device
    // device.set_feature('config', session_data.configuration);
    // FIXME: Hack because firmware is lazy
    const config = (await device.get_feature('config')).data;
    Object.assign(config, session_data.configuration);
    await device.set_feature('config', config);
    device.send('timestamp', [Date.now()]);
}
export function get_session_data() {
    return JSON.parse(sessionStorage.getItem(session_data_identifier));
}
export async function send_results(results) {
    const endpoint = sessionStorage.getItem(endpoint_identifier);
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
    location.replace(new URL(sessionStorage.getItem(redirect_identifier)).href);
}
if (DEVEL) {
    window.devel.exit = exit;
}
//# sourceMappingURL=XLMS.js.map