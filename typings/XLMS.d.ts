/// <reference types="w3c-web-usb" />
export interface REST_Data {
    id: string;
    exercise: string;
    course: string;
    result_id: string;
    trainer_id: string | null;
    session_data: string | null;
    start_time: string | null;
    elapsed_time: string | null;
    success: string;
    closed: string;
    kurento_url: string;
    kurento_video_directory: string;
    name: string | null;
    interface: string;
    hardware: Array<USBDeviceFilter>;
    metrics: any;
    configuration: any;
}
export interface message_handlers {
    [name: string]: (arg: any) => void;
}
/**
 * Takes an object with HID message names as keys and function to call for each message as values.
 */
export declare function initialize_device(session_data: REST_Data, handlers: message_handlers): Promise<void>;
export declare function get_session_data(): REST_Data;
export interface Results {
    success: number;
    start_time: number;
    elapsed_time: number;
    results: {
        wall_errors: Array<{
            timestamp: number;
            duration: number;
        }>;
        drop_errors: Array<{
            timestamp: number;
        }>;
    };
}
export declare function send_results(results: Results): Promise<boolean>;
export declare function exit(): void;
