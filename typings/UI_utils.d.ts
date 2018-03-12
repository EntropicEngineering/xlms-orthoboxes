/// <reference types="react" />
/**
 * Helper utils to know window size and provide user input popup.
 */
import * as React from 'react';
import { IAction } from 'mobx';
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
export declare class User_Input extends View_Port<{}, {}> {
    render(): JSX.Element | null;
}
export declare const user_input: ((message: string, options: {
    [option: string]: () => void;
}) => number) & IAction;
export declare function cancel_user_input(id: number): void;
