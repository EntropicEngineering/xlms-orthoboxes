/// <reference types="react" />
/**
 * Helper utils to know window size and provide user input popup.
 */
import * as React from 'react';
export interface Viewport {
    window_width: number;
    window_height: number;
}
export declare class View_Port<P, S> extends React.Component<P, {
    viewport: Viewport;
} & S> {
    handle_resize(): void;
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
}
export declare class User_Input_State {
    id: number;
    message: string;
    options: {
        [option: string]: () => void;
    };
    readonly display: boolean;
}
export declare class User_Input<P, S> extends View_Port<P & {
    input: User_Input_State;
}, S> {
    render(): JSX.Element | null;
}
export declare const user_input_state: User_Input_State;
export declare function user_input(message: typeof user_input_state.message, options: typeof user_input_state.options): number;
export declare function cancel_user_input(id: number): void;
