/**
 * Helper utils to know window size and provide user input popup.
 */

import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';

export interface Viewport {
    window_width: number,
    window_height: number
}

export class View_Port<P, S> extends React.Component<P, S & { viewport: Viewport }> {
    constructor(props: any) {
        super(props);
        this.handle_resize();
    }

    handle_resize() {
        this.setState({ viewport: { window_width: window.innerWidth, window_height: window.innerHeight } });
    }

    componentDidMount() {
        window.addEventListener('resize', this.handle_resize.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handle_resize.bind(this));
    }
}

export class User_Input_State {
    id: number = 0;
    @observable message: string = '';
    @observable options: { [option: string]: () => void };

    @computed get display() {
        return Boolean(this.message.length);
    }
}

@observer
export class User_Input<P, S> extends View_Port<P & { input: User_Input_State }, S> {
    render() {
        if ( !this.props.input.display ) {
            return null;
        }

        // The gray background
        const backdrop_style: React.CSSProperties = {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: 50
        };

        const floor = Math.floor;
        const width = floor(this.state.viewport.window_width / 5);
        const height = floor(this.state.viewport.window_height / 5);
        const top = floor(( this.state.viewport.window_height - height ) / 2);
        const left = floor(( this.state.viewport.window_width - width ) / 2);


        const modal_style: React.CSSProperties = {
            backgroundColor: '#fff',
            borderRadius: 5,
            maxWidth: 500,
            minHeight: 300,
            margin: '0 auto',
            padding: 30
        };

        console.log(this.props.input);
        return (
            <div className="backdrop" style={backdrop_style}>
                <div className="flex-container column" style={modal_style}>
                    <div className="flex-grow flex-container centered">
                        <h3 className="flex-grow centered"> {this.props.input.message}</h3>
                    </div>
                    <div className="flex-grow flex-container row spread">
                        {Object.entries(this.props.input.options).map(([option, callback]: [string, () => void]) =>
                            <button key={option} className="" onClick={() => {
                                setTimeout(callback, 0);
                                this.props.input.message = '';
                            }}> {option} </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export const user_input_state = new User_Input_State();

export function user_input(message: typeof user_input_state.message, options: typeof user_input_state.options) {
    user_input_state.options = options;
    user_input_state.message = message;
    user_input_state.id++;
    return user_input_state.id;
}

export function cancel_user_input(id: number) {
    if (user_input_state.id === id) {
        user_input_state.message = '';
    }
}
