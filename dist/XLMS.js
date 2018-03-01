/**
 * Created by riggs on 7/31/16.
 *
 * API for plugins.
 */
import { DEVEL, DEBUG, ERROR } from "./utils";
import { Device } from "simple-hid";
import { user_input } from "./UI_utils";
import { module_identifier, endpoint_identifier } from "./constants";
const endpoint = new Promise(((resolve) => {
    function poll() {
        const endpoint = Drupal.settings[module_identifier][endpoint_identifier];
        DEBUG(endpoint);
        if (endpoint !== undefined) {
            resolve(endpoint);
        }
        else {
            setTimeout(poll, 1);
        }
    }
    poll();
}));
/**
 * Takes an object with HID message names as keys and function to call for each message as values.
 */
export async function initialize_device(session_data, handlers) {
    let device = await Device.connect(...session_data.hardware);
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
    // 'configuration' object is an array of objects, with each object having a single key: value pair.
    // This is to ensure the order is consistent.
    device.set_feature('config', ...session_data.configuration.map(Number));
    // Initialize device
    device.send('timestamp', Date.now());
}
export async function fetch_session_data() {
    async function retrieve() {
        try {
            return await fetch(await endpoint).then(response => response.json());
        }
        catch (error) {
            DEBUG(error);
            try {
                return await new Promise(((resolve, reject) => {
                    user_input(`Error: ${error.message}`, {
                        Retry: () => resolve(retrieve()),
                        Exit: reject
                    });
                }));
            }
            catch (_a) {
                exit();
            }
        }
    }
    let REST_data = await retrieve();
    DEBUG(REST_data);
    return REST_data;
}
export async function send_results(results) {
    let response = await fetch(await endpoint, {
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
    // TODO: Forward accordingly
}
if (DEVEL) {
    window.devel.exit = exit;
}
//# sourceMappingURL=XLMS.js.map