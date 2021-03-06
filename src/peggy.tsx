/**
 * Created by riggs on 8/15/16.
 */

import {
    Status_Bar,
    Video_Recorder,
    HID_handlers,
    orthobox,
    save_raw_event,
    ORTHOBOX_STATE,
    Orthobox_Component
} from "./orthobox_shared_components";

import * as React from 'react';
import { render } from 'react-dom';
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import { Viewport, User_Input } from "./UI_utils";
import {
    DEBUG
} from "./utils";


let pegs = observable(new Array(6));
pegs.fill(false);

function all_left() {
    return pegs.slice(0, 3).every(peg => peg)
}

function all_right() {
    return pegs.slice(3, 6).every(peg => peg)
}

let task = 'ltr';

HID_handlers.peg = action(save_raw_event(({timestamp, location, new_state}) => {
    pegs[location] = Boolean(new_state);
    switch ( orthobox.state ) {
        case ORTHOBOX_STATE.Waiting:
        case ORTHOBOX_STATE.Ready:
            if ( all_left() ) {
                orthobox.set_up = true;
            }
            break;
        case ORTHOBOX_STATE.Exercise:
            if ( task === 'ltr' && all_right() ) {
                task = 'rtl';
            } else if ( task === 'rtl' && all_left() ) {
                orthobox.end_exercise();
            }
    }
}, "peg"));


let wrapped_status_func = HID_handlers.status;
HID_handlers.status = action(({timestamp, status}) => {
    let byte2 = status[2] || status[1];
    for ( let i = 0; i < 6; i++ ) {
        let mask = 2 ** i;
        // Assign initial peg status.
        pegs[i] = Boolean(byte2 & mask)
    }
    // If first 3 pegs are covered.
    if ( all_left() ) {
        orthobox.set_up = true;
    }
    wrapped_status_func({timestamp, status});
});


@observer
class Peg extends React.Component<{ id: number, window_height: number, window_width: number }, {}> {
    render() {
        const covered = pegs[this.props.id];
        const radius = Math.floor(Math.max(this.props.window_height, this.props.window_width) / 50);
        const stroke_width = 1;
        const coordinate = radius + stroke_width;
        return (
            <div className="flex-grow centered">
                <svg height={2 * coordinate} width={2 * coordinate} className="flex-grow centered">
                    <circle cx={coordinate} cy={coordinate} r={covered ? radius : Math.floor(0.9 * radius)}
                            fill={covered ? "lightgrey" : "#AEBFFF"}
                            stroke="black" strokeWidth={stroke_width}/>
                </svg>
            </div>
        )
    }
}


class Peggy_Display extends React.Component<{ viewport: Viewport }, {}> {
    render() {
        return (
            <div id="peggy_display" className="flex-grow flex-container row centered">
                <div className="flex-grow flex-container column">
                    {[0, 1, 2].map(id => <Peg key={id} id={id} {...this.props.viewport}/>)}
                </div>
                <div className="flex-grow flex-container column">
                    {[3, 4, 5].map(id => <Peg key={id} id={id} {...this.props.viewport}/>)}
                </div>
            </div>
        )
    }
}


class Peggy extends Orthobox_Component<{}, {}> {
    render() {
        return (
            <div className="flex-container column">
                <Status_Bar {...this.props}/>
                <div className="flex-container row">
                    <Peggy_Display viewport={this.state.viewport} {...this.props}/>
                    <Video_Recorder viewport={this.state.viewport} {...this.props}/>
                </div>
                <User_Input/>
            </div>
        );
    }
}

render(
    <Peggy orthobox={orthobox}/>,
    document.getElementById('peggy_app')
);
