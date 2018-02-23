/**
 * Manages creation & communication with user input view.
 */

// TODO: Figure out what's replacing Chrome APIs
/// <reference types="chrome/chrome-app" />
declare global {
    interface Window {
        message: string
        option_strings: Array<string>
        result: (result: string) => void
        creator: chrome.app.window.AppWindow
    }
}

import { DEBUG } from './utils';

export class Window_Closed_Error extends Error {
}


// TODO: Figure out what's replacing Chrome APIs
export function get_input(message: string, options: Array<string>) {
    let pending = true;
    return new Promise<string>((resolve, reject) => {
        let floor = Math.floor;
        let width = floor(window.innerWidth / 5);
        let height = floor(window.innerHeight / 5);
        let top = floor(( window.innerHeight - height ) / 2);
        let left = floor(( window.innerWidth - width ) / 2);
        DEBUG({ width, height, top, left });
        chrome.app.window.create('user_input.html', {
            id: 'user_input',
            frame: { type: 'none' },
            innerBounds: { width, height, top, left }
        }, (created_window) => {
            created_window.contentWindow.message = message;
            created_window.contentWindow.option_strings = options;
            created_window.contentWindow.result = (result: string) => {
                if ( pending ) {
                    pending = false;
                    DEBUG(`resolving with ${result}`);
                    resolve(result);
                }
            };
            created_window.contentWindow.creator = chrome.app.window.current();
            created_window.onClosed.addListener(() => {
                if ( pending ) {
                    pending = false;
                    reject(new Window_Closed_Error('Window closed by user.'));
                }
            });
        });
    });
}


// FIXME: Fix type signature of options, or merge these two functions
export async function user_input(message: string, options: { [key: string]: any }) {
    return options[await get_input(message, Object.keys(options))];
}

