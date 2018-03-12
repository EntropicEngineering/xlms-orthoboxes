/**
 * Created by riggs on 8/15/16.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Status_Bar, Video_Recorder, HID_handlers, orthobox, save_raw_event, ORTHOBOX_STATE, Orthobox_Component } from "./orthobox_shared_components";
import * as React from 'react';
import { render } from 'react-dom';
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import { User_Input } from "./UI_utils";
let pegs = observable(new Array(6));
pegs.fill(false);
function all_left() {
    return pegs.slice(0, 3).every(peg => peg);
}
function all_right() {
    return pegs.slice(3, 6).every(peg => peg);
}
let task = 'ltr';
HID_handlers.peg = action(save_raw_event(({ timestamp, location, new_state }) => {
    pegs[location] = Boolean(new_state);
    switch (orthobox.state) {
        case ORTHOBOX_STATE.Waiting:
        case ORTHOBOX_STATE.Ready:
            if (all_left()) {
                orthobox.set_up = true;
            }
            break;
        case ORTHOBOX_STATE.Exercise:
            if (task === 'ltr' && all_right()) {
                task = 'rtl';
            }
            else if (task === 'rtl' && all_left()) {
                orthobox.end_exercise();
            }
    }
}, "peg"));
let wrapped_status_func = HID_handlers.status;
HID_handlers.status = action(({ timestamp, status }) => {
    let byte2 = status[2] || status[1];
    for (let i = 0; i < 6; i++) {
        let mask = 2 ** i;
        // Assign initial peg status.
        pegs[i] = Boolean(byte2 & mask);
    }
    // If first 3 pegs are covered.
    if (all_left()) {
        orthobox.set_up = true;
    }
    wrapped_status_func({ timestamp, status });
});
let Peg = class Peg extends React.Component {
    render() {
        const covered = pegs[this.props.id];
        const radius = Math.floor(Math.max(this.props.window_height, this.props.window_width) / 50);
        const stroke_width = 1;
        const coordinate = radius + stroke_width;
        return (React.createElement("div", { className: "flex-grow centered" },
            React.createElement("svg", { height: 2 * coordinate, width: 2 * coordinate, className: "flex-grow centered" },
                React.createElement("circle", { cx: coordinate, cy: coordinate, r: covered ? radius : Math.floor(0.9 * radius), fill: covered ? "lightgrey" : "#AEBFFF", stroke: "black", strokeWidth: stroke_width }))));
    }
};
Peg = __decorate([
    observer
], Peg);
class Peggy_Display extends React.Component {
    render() {
        return (React.createElement("div", { id: "peggy_display", className: "flex-grow flex-container row centered" },
            React.createElement("div", { className: "flex-grow flex-container column" }, [0, 1, 2].map(id => React.createElement(Peg, Object.assign({ key: id, id: id }, this.props.viewport)))),
            React.createElement("div", { className: "flex-grow flex-container column" }, [3, 4, 5].map(id => React.createElement(Peg, Object.assign({ key: id, id: id }, this.props.viewport))))));
    }
}
class Peggy extends Orthobox_Component {
    render() {
        return (React.createElement("div", { className: "flex-container column" },
            React.createElement(Status_Bar, Object.assign({}, this.props)),
            React.createElement("div", { className: "flex-container row" },
                React.createElement(Peggy_Display, Object.assign({ viewport: this.state.viewport }, this.props)),
                React.createElement(Video_Recorder, Object.assign({ viewport: this.state.viewport }, this.props))),
            React.createElement(User_Input, null)));
    }
}
render(React.createElement(Peggy, { orthobox: orthobox }), document.getElementById('peggy_app'));
//# sourceMappingURL=peggy.js.map