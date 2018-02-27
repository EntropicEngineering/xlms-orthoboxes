/**
 * Created by riggs on 8/14/16.
 */
'use strict';

// TODO: Set based on ENV
export const DEVEL: true | false | "test" = false; // Set to something truthy for development, something falsey for deployment, or "test" for test deployment with test app.

export function DEBUG(...args: any[]) {
    if ( DEVEL ) {
        console.log(...args);
    }
}

export function WARN(...args: any[]) {
    console.warn(...args);
}

export function ERROR(...args: any[]) {
    console.error(...args);
}

export function noop() {
}

export function exit() {
    // TODO: Implementation
}

declare global {
    interface Window {
        devel: { [name: string]: any };
    }
}
if ( DEVEL ) {
    window.devel = { exit };
}

