/// <reference types="react" />
import { Viewport, View_Port } from './UI_utils';
import { REST_Data, message_handlers } from './XLMS';
import * as React from 'react';
export declare const HID_handlers: message_handlers;
export declare enum ORTHOBOX_STATE {
    Waiting = 0,
    Ready = 1,
    Exercise = 2,
    Finished = 3,
}
export declare enum TOOL_STATE {
    Out = 0,
    In = 1,
    Unplugged = 2,
}
export interface Session_Data extends REST_Data {
    course_name?: string;
    exercise_name?: string;
    metrics: {
        elapsed_time: {
            maximum: string;
            minimum: string;
        };
        wall_error_count: {
            maximum: string;
        };
        wall_error_length: {
            maximum: string;
        };
        drop_error_count?: {
            maximum: string;
        };
    };
}
export declare class Orthobox {
    timer_interval?: number;
    session_data: Session_Data | {};
    set_up: boolean;
    state: ORTHOBOX_STATE;
    tool_state?: TOOL_STATE;
    recording: boolean;
    start_time?: number;
    end_time?: number;
    timer: number;
    readonly elapsed_time: number | undefined;
    wall_errors: Array<{
        timestamp: number;
        duration: number;
    }>;
    drop_errors: Array<{
        timestamp: number;
    }>;
    readonly error_count: number;
    pokes: Array<{
        poke: {
            timestamp: number;
            location: number;
        };
    }>;
    raw_events: Array<{
        [name: string]: Array<any>;
    }>;
    stop_recording: () => void;
    end_exercise(): Promise<void>;
    start_exercise(): void;
    readonly results: {
        success: number;
        start_time: number;
        elapsed_time: number;
        results: {
            wall_errors: {
                timestamp: number;
                duration: number;
            }[];
            drop_errors: {
                timestamp: number;
            }[];
        };
    };
}
export declare let orthobox: Orthobox;
export declare function save_raw_event(wrapped: (...args: any[]) => void, name: string): (...args: any[]) => void;
export declare class Orthobox_Component<P, S> extends View_Port<P & {
    orthobox: Orthobox;
}, S> {
    componentWillMount(): void;
}
export declare class Status_Bar extends React.Component<{
    orthobox: Orthobox;
}, {}> {
    render(): JSX.Element;
}
/**
 * Mirror video input back to user.
 *
 * Takes set_video_player and add_media_stream callbacks as props to return video node and video stream, respectively.
 */
export declare type Video_Player = HTMLVideoElement;
export declare class Video_Recorder extends React.Component<{
    viewport: Viewport;
    orthobox: Orthobox;
}, {}> {
    constructor(props: any);
    video_player: Video_Player;
    media_streams: Array<MediaStream>;
    set_video_player(video_player: Video_Player): void;
    add_media_stream(media_stream: MediaStream): void;
    record(): number | undefined;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
