/**
 * Created by riggs on 8/14/16.
 */
// TODO: Set based on ENV
export const DEVEL = true; // Set to something truthy for development, something falsey for deployment, or "test" for test deployment with test app.
export function DEBUG(...args) {
    if (DEVEL) {
        console.log(...args);
    }
}
export function WARN(...args) {
    console.warn(...args);
}
export function ERROR(...args) {
    console.error(...args);
}
export function noop() {
}
if (DEVEL) {
    window.devel = {};
}
//# sourceMappingURL=utils.js.map