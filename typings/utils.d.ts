/**
 * Created by riggs on 8/14/16.
 */
export declare const DEVEL: true | false | "test";
export declare function DEBUG(...args: any[]): void;
export declare function WARN(...args: any[]): void;
export declare function ERROR(...args: any[]): void;
export declare function noop(): void;
declare global  {
    interface Window {
        devel: {
            [name: string]: any;
        };
    }
}
