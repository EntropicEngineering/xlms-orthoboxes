/**
 * Prepare the session data for the exercise & launch the plugin app.
 */
import { session_data_identifier, redirect_identifier, endpoint_identifier } from "./constants";
async function fetch_session_data(endpoint) {
    // const endpoint = new URLSearchParams(document.location.search.substring(1)).get(endpoint_identifier) || '';
    const REST_data = await fetch(new URL(endpoint).href).then(response => response.json());
    console.log(REST_data);
    return REST_data;
}
function store_session(session_data, redirect, endpoint) {
    sessionStorage.setItem(session_data_identifier, JSON.stringify(session_data));
    sessionStorage.setItem(redirect_identifier, redirect);
    sessionStorage.setItem(endpoint_identifier, endpoint);
}
/**
 * Initialize Plugin: Fetch REST data, store it, then redirect to plugin.
 *
 * @param {string} endpoint REST API endpoint URL
 * @param {string} redirect URL used by plugin to redirect user after exercise.
 * @returns {Promise<void>}
 */
export async function initialize(endpoint, redirect) {
    const REST_data = await fetch_session_data(endpoint);
    store_session(REST_data, redirect, endpoint);
    location.assign(new URL(REST_data.interface).href);
}
//# sourceMappingURL=XLMS_loader.js.map