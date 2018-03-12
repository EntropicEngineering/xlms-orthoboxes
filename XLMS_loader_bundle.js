/**
 * 'Magic' constant strings collected in one place.
 */
const session_data_identifier = "session_data";
const redirect_identifier = "redirect_URL";
const endpoint_identifier = "endpoint";

/**
 * Prepare the session data for the exercise & launch the plugin app.
 */
async function fetch_session_data(endpoint) {
    // const endpoint = new URLSearchParams(document.location.search.substring(1)).get(endpoint_identifier) || '';
    return fetch(new URL(endpoint).href).then(response => response.json());
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
async function initialize(endpoint, redirect) {
    const REST_data = await fetch_session_data(endpoint);
    store_session(REST_data, redirect, endpoint);
    location.assign(new URL(REST_data.interface).href);
}
const endpoint = new URLSearchParams(document.location.search.substring(1)).get(endpoint_identifier) || '';
const redirect = document.referrer.replace('/take', '');
window.onload = () => initialize(endpoint, redirect);
//# sourceMappingURL=XLMS_loader_bundle.js.map
