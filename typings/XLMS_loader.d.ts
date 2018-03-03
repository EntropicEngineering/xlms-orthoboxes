/**
 * Initialize Plugin: Fetch REST data, store it, then redirect to plugin.
 *
 * @param {string} endpoint REST API endpoint URL
 * @param {string} redirect URL used by plugin to redirect user after exercise.
 * @returns {Promise<void>}
 */
export declare function initialize(endpoint: string, redirect: string): Promise<void>;
