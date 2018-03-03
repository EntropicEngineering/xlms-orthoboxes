/**
 * Helper utils to know window size and provide user input popup.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';
export class View_Port extends React.Component {
    handle_resize() {
        this.setState({ viewport: { window_width: window.innerWidth, window_height: window.innerHeight } });
    }
    componentWillMount() {
        this.handle_resize();
    }
    componentDidMount() {
        window.addEventListener('resize', this.handle_resize.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handle_resize.bind(this));
    }
}
export class User_Input_State {
    constructor() {
        this.id = 0;
        this.message = '';
    }
    get display() {
        return Boolean(this.message.length);
    }
}
__decorate([
    observable
], User_Input_State.prototype, "message", void 0);
__decorate([
    observable
], User_Input_State.prototype, "options", void 0);
__decorate([
    computed
], User_Input_State.prototype, "display", null);
let User_Input = class User_Input extends View_Port {
    render() {
        if (!this.props.input.display) {
            return null;
        }
        // The gray background
        const backdrop_style = {
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
        const top = floor((this.state.viewport.window_height - height) / 2);
        const left = floor((this.state.viewport.window_width - width) / 2);
        const modal_style = {
            backgroundColor: '#fff',
            borderRadius: 5,
            maxWidth: 500,
            minHeight: 300,
            margin: '0 auto',
            padding: 30
        };
        console.log(this.props.input);
        return (React.createElement("div", { className: "backdrop", style: backdrop_style },
            React.createElement("div", { className: "flex-container column", style: modal_style },
                React.createElement("div", { className: "flex-grow flex-container centered" },
                    React.createElement("h3", { className: "flex-grow centered" },
                        " ",
                        this.props.input.message)),
                React.createElement("div", { className: "flex-grow flex-container row spread" }, Object.entries(this.props.input.options).map(([option, callback]) => React.createElement("button", { key: option, className: "", onClick: () => {
                        setTimeout(callback, 0);
                        this.props.input.message = '';
                    } },
                    " ",
                    option,
                    " "))))));
    }
};
User_Input = __decorate([
    observer
], User_Input);
export { User_Input };
export const user_input_state = new User_Input_State();
export function user_input(message, options) {
    user_input_state.options = options;
    user_input_state.message = message;
    user_input_state.id++;
    return user_input_state.id;
}
export function cancel_user_input(id) {
    if (user_input_state.id === id) {
        user_input_state.message = '';
    }
}
//# sourceMappingURL=UI_utils.js.map