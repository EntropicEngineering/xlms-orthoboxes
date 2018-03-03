/**
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import { DEBUG, DEVEL, ERROR, noop } from './utils';
import { User_Input, View_Port, user_input, user_input_state, } from './UI_utils';
import { exit, initialize_device, send_results, get_session_data, } from './XLMS';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { observer } from 'mobx-react';
import { observable, computed, action, toJS } from 'mobx';
import * as kurento_utils from 'kurento-utils';
// import 'webrtc-adapter';
if (DEVEL) {
    window.devel.kurento_utils = kurento_utils;
    window.devel.kurento_client = kurentoClient.kurentoClient;
    window.devel.user_input_state = user_input_state;
}
export const HID_handlers = {};
if (DEVEL) {
    window.devel.HID_handlers = HID_handlers;
}
export var ORTHOBOX_STATE;
(function (ORTHOBOX_STATE) {
    ORTHOBOX_STATE[ORTHOBOX_STATE["Waiting"] = 0] = "Waiting";
    ORTHOBOX_STATE[ORTHOBOX_STATE["Ready"] = 1] = "Ready";
    ORTHOBOX_STATE[ORTHOBOX_STATE["Exercise"] = 2] = "Exercise";
    ORTHOBOX_STATE[ORTHOBOX_STATE["Finished"] = 3] = "Finished";
})(ORTHOBOX_STATE || (ORTHOBOX_STATE = {}));
export var TOOL_STATE;
(function (TOOL_STATE) {
    TOOL_STATE[TOOL_STATE["Out"] = 0] = "Out";
    TOOL_STATE[TOOL_STATE["In"] = 1] = "In";
    TOOL_STATE[TOOL_STATE["Unplugged"] = 2] = "Unplugged";
})(TOOL_STATE || (TOOL_STATE = {}));
function on_error(message) {
    if (message) {
        ERROR(message);
    }
}
export class Orthobox {
    constructor() {
        this.session_data = {};
        this.set_up = false;
        this.state = ORTHOBOX_STATE.Waiting;
        this.recording = false;
        this.timer = 0;
        this.wall_errors = [];
        this.drop_errors = [];
        this.pokes = [];
        this.raw_events = [];
        this.stop_recording = () => DEBUG('stop_recording but nothing to do.');
    }
    get elapsed_time() {
        if (this.start_time !== undefined && this.end_time !== undefined) {
            return this.end_time - this.start_time;
        }
        else {
            return undefined;
        }
    }
    get error_count() {
        return this.wall_errors.length + this.drop_errors.length;
    }
    async end_exercise() {
        this.stop_recording();
        this.end_time = Date.now();
        this.state = ORTHOBOX_STATE.Finished;
        if (this.timer_interval !== undefined) {
            clearInterval(this.timer_interval);
        }
        Object.assign(this.session_data, this.results);
        // send_results(this.session_data);
        await send_results(this.results);
        user_input(`You took ${Math.floor(this.results.elapsed_time / 1000)} seconds and made ${this.error_count} errors.`, { Exit: exit });
    }
    start_exercise() {
        if (!this.recording) {
            user_input('Error: Exercise will not begin unless video is recording.', { OK: noop });
        }
        else {
            this.start_time = Date.now();
            this.state = ORTHOBOX_STATE.Exercise;
            this.timer_interval = window.setInterval(() => {
                this.timer += 1;
            }, 1000);
        }
    }
    get results() {
        const metrics = this.session_data.metrics;
        const maximum = Number(metrics.elapsed_time.maximum);
        const minimum = Number(metrics.elapsed_time.minimum);
        let success;
        if ((this.wall_errors.length > Number(metrics.wall_error_count.maximum)) ||
            (metrics.drop_error_count &&
                this.drop_errors.length > Number(metrics.drop_error_count.maximum))) {
            success = 0;
        }
        else {
            success = Math.max(0, Math.min(1, 1 - (1 - 0.7) * (Math.floor((this.elapsed_time || 0) / 1000) - minimum) / (maximum - minimum)));
        }
        return {
            success,
            start_time: this.start_time,
            elapsed_time: this.elapsed_time,
            results: { wall_errors: toJS(this.wall_errors), drop_errors: toJS(this.drop_errors) }
        };
    }
}
__decorate([
    observable
], Orthobox.prototype, "session_data", void 0);
__decorate([
    observable
], Orthobox.prototype, "set_up", void 0);
__decorate([
    observable
], Orthobox.prototype, "state", void 0);
__decorate([
    observable
], Orthobox.prototype, "tool_state", void 0);
__decorate([
    observable
], Orthobox.prototype, "recording", void 0);
__decorate([
    observable
], Orthobox.prototype, "start_time", void 0);
__decorate([
    observable
], Orthobox.prototype, "end_time", void 0);
__decorate([
    observable
], Orthobox.prototype, "timer", void 0);
__decorate([
    computed
], Orthobox.prototype, "elapsed_time", null);
__decorate([
    observable
], Orthobox.prototype, "wall_errors", void 0);
__decorate([
    observable
], Orthobox.prototype, "drop_errors", void 0);
__decorate([
    computed
], Orthobox.prototype, "error_count", null);
__decorate([
    observable
], Orthobox.prototype, "pokes", void 0);
__decorate([
    computed
], Orthobox.prototype, "results", null);
export let orthobox = new Orthobox();
if (DEVEL) {
    window.devel.orthobox = orthobox;
}
export function save_raw_event(wrapped, name) {
    return function (...args) {
        DEBUG(`orthobox.raw_events.push({${name}: [${args}]});`);
        orthobox.raw_events.push({ [name]: Object.assign({}, args) });
        return wrapped(...args);
    };
}
HID_handlers.wall_error = action(save_raw_event(({ timestamp, duration }) => {
    if (orthobox.state === ORTHOBOX_STATE.Exercise) {
        orthobox.wall_errors.push({ timestamp, duration });
    }
}, 'wall_error'));
HID_handlers.drop_error = action(save_raw_event(({ timestamp, duration }) => {
    if (orthobox.state === ORTHOBOX_STATE.Exercise) {
        orthobox.drop_errors.push({ timestamp });
    }
}, 'drop_error'));
HID_handlers.status = action(save_raw_event(async (_a) => {
    var { timestamp } = _a, status = __rest(_a, ["timestamp"]);
    let byte1 = status[0];
    // If tool soldered incorrectly.
    if (byte1 & 1) {
        user_input('Device Manufactured Incorrectly', { Quit: exit });
    }
    // Set tool state based on bits 2 & 3 in 1st byte.
    orthobox.tool_state = (byte1 >> 1) & 0b11;
    while (orthobox.tool_state === TOOL_STATE.Unplugged) {
        const promise = new Promise(((resolve, reject) => {
            user_input('Tool Not Connected', { Retry: resolve, Quit: reject });
        }));
        try {
            await promise;
        }
        catch (_b) {
            exit();
        }
    }
    if (orthobox.set_up && orthobox.tool_state === TOOL_STATE.In) {
        orthobox.state = ORTHOBOX_STATE.Ready;
    }
}, 'status'));
HID_handlers.tool = action(save_raw_event(({ timestamp, state }) => {
    orthobox.tool_state = state;
    switch (state) {
        case 0:// Out
            switch (orthobox.state) {
                case ORTHOBOX_STATE.Ready:
                    if (orthobox.set_up) {
                        orthobox.state = ORTHOBOX_STATE.Waiting; // Set to Waiting in case video isn't recording.
                        orthobox.start_exercise(); // State set in function.
                    }
                    break;
            }
            break;
        case 1:// In
            switch (orthobox.state) {
                case ORTHOBOX_STATE.Waiting:
                    if (orthobox.set_up) {
                        orthobox.state = ORTHOBOX_STATE.Ready;
                    }
                    break;
            }
            break;
        case 2:
            switch (orthobox.state) {
                case ORTHOBOX_STATE.Ready:
                    orthobox.state = ORTHOBOX_STATE.Waiting;
                    break;
                case ORTHOBOX_STATE.Exercise:
                    user_input('Error: Tool Disconnected. Aborting Exercise', { Quit: exit });
                    break;
            }
            break;
    }
}, 'tool'));
HID_handlers.poke = action(save_raw_event(({ timestamp, location }) => {
    if (orthobox.state === ORTHOBOX_STATE.Exercise) {
        orthobox.pokes.push({ poke: { timestamp, location } });
        if (orthobox.pokes.length >= 10) {
            orthobox.end_exercise();
        }
    }
}, 'poke'));
export class Orthobox_Component extends View_Port {
    componentWillMount() {
        super.componentWillMount();
        const session_data = get_session_data();
        initialize_device(session_data, HID_handlers);
        Object.assign(orthobox.session_data, session_data);
    }
}
let Status_Bar = class Status_Bar extends React.Component {
    render() {
        let orthobox = this.props.orthobox;
        let timer = null;
        let error_count = null;
        switch (orthobox.state) {
            case ORTHOBOX_STATE.Exercise:
            case ORTHOBOX_STATE.Finished:
                timer = `Elapsed Time: ${orthobox.timer}`;
                error_count = `Errors: ${orthobox.error_count}`;
                break;
            case ORTHOBOX_STATE.Ready:
                timer = 'Ready';
                break;
            case ORTHOBOX_STATE.Waiting:
                timer = 'Waiting';
                break;
        }
        return (React.createElement("div", { id: "user_input_modal" },
            (orthobox.session_data.hasOwnProperty('course_name')) ?
                React.createElement("div", { id: "status_bar", className: "flex-grow flex-container row" },
                    React.createElement("div", { className: "flex-grow flex-container column" },
                        React.createElement("div", { className: "flex-grow" },
                            React.createElement("h3", { id: "course_name" },
                                " ",
                                orthobox.session_data.course_name,
                                " ")),
                        React.createElement("div", { className: "flex-grow" },
                            React.createElement("h3", { id: "exercise_name" },
                                " ",
                                orthobox.session_data.exercise_name,
                                " "))),
                    React.createElement("div", { className: "flex-grow" },
                        React.createElement("h2", { id: "timer" },
                            " ",
                            timer,
                            " ")),
                    React.createElement("div", { className: "flex-grow" },
                        React.createElement("h3", { id: "error_count" },
                            " ",
                            error_count,
                            " ")))
                :
                    React.createElement("div", { className: "flex-grow" },
                        React.createElement("h2", null, " Loading ")),
            React.createElement(User_Input, { input: user_input_state })));
    }
};
Status_Bar = __decorate([
    observer
], Status_Bar);
export { Status_Bar };
class Video_Display extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.streams = [];
    }
    componentDidMount() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(mediaStream => {
            this.props.add_media_stream && this.props.add_media_stream(mediaStream);
            if (DEVEL) {
                window.devel.video_stream = mediaStream;
            }
            this.streams.push(mediaStream);
            this.setState({ src: window.URL.createObjectURL(mediaStream) });
        })
            .catch(on_error);
        this.props.set_video_player && this.props.set_video_player(findDOMNode(this));
    }
    componentWillUnmount() {
        this.streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
    }
    render() {
        DEBUG(this.props);
        if (this.props.viewport.window_width > this.props.viewport.window_height) {
            return (React.createElement("video", { src: this.state.src, height: this.props.viewport.window_height * .8, autoPlay: true }));
        }
        else {
            return (React.createElement("video", { src: this.state.src, width: this.props.viewport.window_width * .8, autoPlay: true }));
        }
    }
}
let Video_Recorder = class Video_Recorder extends React.Component {
    constructor(props) {
        super(props);
        this.media_streams = [];
        this.set_video_player = this.set_video_player.bind(this);
        this.add_media_stream = this.add_media_stream.bind(this);
        this.record = this.record.bind(this);
    }
    set_video_player(video_player) {
        this.video_player = video_player;
    }
    add_media_stream(media_stream) {
        DEBUG(`added media_stream: ${media_stream}`);
        this.media_streams.push(media_stream);
    }
    record() {
        let orthobox = this.props.orthobox;
        if (orthobox.state != ORTHOBOX_STATE.Ready) {
            return user_input('Error: Recording will not begin until device is ready.', { OK: noop });
        }
        // Nuke the existing media streams so that kurento-client can recreate them because passing them in as an doesn't actually work.
        this.media_streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
        DEBUG(`Stopped media_stream: ${this.media_streams}`);
        this.video_player.src = '';
        let options = {
            localVideo: this.video_player,
        };
        DEBUG('options:', options);
        kurento_utils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
            if (error) {
                return on_error(error);
            }
            let webRTC_peer = this; // kurento_utils binds 'this' to the callback, because this function is actually a pile of steaming shit wrapped in an object.
            DEBUG('webRTC_peer:', webRTC_peer);
            webRTC_peer.generateOffer((error, offer) => {
                let session_data = orthobox.session_data;
                if (error) {
                    return on_error(error);
                }
                kurentoClient.KurentoClient(session_data.kurento_url).then((client) => {
                    DEBUG('got kurento_client:', client);
                    client.create('MediaPipeline', (error, pipeline) => {
                        DEBUG('pipeline:', pipeline);
                        let elements = [
                            {
                                type: 'RecorderEndpoint',
                                params: { uri: `file://${session_data.kurento_video_directory}/${session_data.id}.webm` }
                            },
                            { type: 'WebRtcEndpoint', params: {} }
                        ];
                        pipeline.create(elements, (error, [recorder, webRTC]) => {
                            if (error) {
                                return on_error(error);
                            }
                            // Set ice callbacks
                            webRTC_peer.on('icecandidate', (candidate) => {
                                DEBUG('Local candidate:', candidate);
                                candidate = kurentoClient.getComplexType('IceCandidate')(candidate);
                                webRTC.addIceCandidate(candidate, on_error);
                            });
                            webRTC.on('OnIceCandidate', (event) => {
                                DEBUG('Remote candidate:', event.candidate);
                                webRTC_peer.addIceCandidate(event.candidate, on_error);
                            });
                            webRTC.processOffer(offer, (error, answer) => {
                                if (error) {
                                    return on_error(error);
                                }
                                DEBUG('gathering candidates');
                                webRTC.gatherCandidates(on_error);
                                DEBUG('processing answer');
                                webRTC_peer.processAnswer(answer);
                            });
                            DEBUG('connecting');
                            client.connect(webRTC, webRTC, recorder, (error) => {
                                if (error) {
                                    return on_error(error);
                                }
                                DEBUG('connected');
                                recorder.record(action((error) => {
                                    if (error) {
                                        return on_error(error);
                                    }
                                    DEBUG('recording');
                                    let recording = true;
                                    orthobox.recording = true;
                                    orthobox.stop_recording = () => {
                                        if (recording) {
                                            recording = false;
                                            recorder.stop();
                                            pipeline.release();
                                            webRTC_peer.dispose();
                                            options.localVideo.src = '';
                                            // options.videoStream.getTracks().forEach(track => track.stop())
                                        }
                                    };
                                }));
                            });
                        });
                    });
                });
            });
        });
        return;
    }
    componentWillUnmount() {
        this.props.orthobox.stop_recording();
    }
    render() {
        return (React.createElement("div", { className: "column flex-grow" },
            React.createElement(Video_Display, { set_video_player: this.set_video_player, add_media_stream: this.add_media_stream, viewport: this.props.viewport }),
            React.createElement("button", { id: "record", onClick: this.record, hidden: this.props.orthobox.recording }, " Record")));
    }
};
Video_Recorder = __decorate([
    observer
], Video_Recorder);
export { Video_Recorder };
//# sourceMappingURL=orthobox_shared_components.js.map