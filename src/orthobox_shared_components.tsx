/**
 */

import {
    DEBUG,
    DEVEL,
    ERROR,
    noop
} from './utils';

import {
    User_Input,
    Viewport,
    View_Port,
    user_input,
} from './UI_utils';
import {
    REST_Data,
    exit,
    initialize_device,
    send_results,
    message_handlers,
    get_session_data,
} from './XLMS';

import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { observer } from 'mobx-react';
import { observable, computed, action, toJS } from 'mobx';
// import { kurentoClient } from "../kurento-client-bower/js/kurento-client.min.js";
declare const kurentoClient: any;
import * as kurento_utils from 'kurento-utils';
// import 'webrtc-adapter';
if ( DEVEL ) { window.devel.kurento_utils = kurento_utils; window.devel.kurento_client = kurentoClient.kurentoClient; }


export const HID_handlers: message_handlers = {};
if ( DEVEL ) { window.devel.HID_handlers = HID_handlers; }

export enum ORTHOBOX_STATE {
    Waiting,
    Ready,
    Exercise,
    Finished,
    Disconnected
}

export enum TOOL_STATE {
    Out = 0,
    In = 1,
    Unplugged = 2
}

function on_error(message: string) {
    if ( message ) {
        ERROR(message);
    }
}

export interface Session_Data extends REST_Data {
    course_name?: string,
    exercise_name?: string,
    metrics: {
        elapsed_time: {
            maximum: string,
            minimum: string
        },
        wall_error_count: {
            maximum: string
        },
        wall_error_length: {
            maximum: string
        },
        drop_error_count?: {
            maximum: string
        }
    }
}

export class Orthobox {
    timer_interval?: number;
    @observable session_data: Session_Data | {} = {};
    @observable set_up: boolean = false;
    @observable state: ORTHOBOX_STATE = ORTHOBOX_STATE.Disconnected;
    @observable tool_state?: TOOL_STATE;
    @observable recording: boolean = false;
    @observable start_time?: number;
    @observable end_time?: number;
    @observable timer: number = 0;

    @computed get elapsed_time() {
        if ( this.start_time !== undefined && this.end_time !== undefined ) {
            return this.end_time! - this.start_time!;
        } else {
            return undefined;
        }
    }

    @observable wall_errors: Array<{ timestamp: number, duration: number }> = [];
    @observable drop_errors: Array<{ timestamp: number }> = [];

    @computed get error_count() {
        return this.wall_errors.length + this.drop_errors.length;
    }

    @observable pokes: Array<{ poke: { timestamp: number, location: number } }> = [];
    raw_events: Array<{ [name: string]: Array<any> }> = [];
    stop_recording = () => DEBUG('stop_recording but nothing to do.');

    async end_exercise() {
        setTimeout(() => this.stop_recording(), 2000);
        this.end_time = Date.now();
        this.state = ORTHOBOX_STATE.Finished;
        if ( this.timer_interval !== undefined ) {
            clearInterval(this.timer_interval);
        }
        Object.assign(this.session_data, this.results);
        // FIXME: Temoprary hack for conference
        // await send_results(this.results);
        user_input(`You took ${Math.floor(this.results.elapsed_time as number / 1000)} seconds and made ${this.error_count} errors.`, { Exit:
            // FIXME: Temoprary hack for conference
            // exit
                () => {
                    this.state = ORTHOBOX_STATE.Disconnected;
                    this.timer = 0;
                    this.wall_errors = [];
                    this.drop_errors = [];
                }
        });
    }

    start_exercise() {
        // FIXME: Temoprary hack for conference
        // if ( !this.recording ) {
        //     user_input('Error: Exercise will not begin unless video is recording.', { OK: noop });
        // } else {
            this.start_time = Date.now();
            this.state = ORTHOBOX_STATE.Exercise;
            this.timer_interval = window.setInterval(() => {
                this.timer += 1;
            }, 1000);
        // }
    }

    @computed get results() {
        const metrics = (this.session_data as Session_Data).metrics;
        const maximum = Number(metrics.elapsed_time.maximum);
        const minimum = Number(metrics.elapsed_time.minimum);
        let success: number;
        if (
            ( this.wall_errors.length > Number(metrics.wall_error_count.maximum) ) ||
            ( metrics.drop_error_count &&
              this.drop_errors.length > Number(metrics.drop_error_count.maximum) )
        ) {
            success = 0;
        } else {
            success = Math.max(0, Math.min(1, 1 - ( 1 - 0.7 ) * ( Math.floor((this.elapsed_time || 0) / 1000) - minimum ) / ( maximum - minimum )));
        }
        return {
            success,
            start_time: this.start_time!,
            elapsed_time: this.elapsed_time!,
            results: { wall_errors: toJS(this.wall_errors), drop_errors: toJS(this.drop_errors) }
        };
    }
}


export let orthobox = new Orthobox();
if ( DEVEL ) { window.devel.orthobox = orthobox; }


export function save_raw_event(wrapped: (args: any) => void, name: string) {
    return function (args: any) {
        // DEBUG(`orthobox.raw_events.push({${name}: [${args}]});`);
        orthobox.raw_events.push({ [name]: args });
        return wrapped(args);
    };
}


HID_handlers.wall_error = action(save_raw_event(({timestamp, duration}) => {
    if ( orthobox.state === ORTHOBOX_STATE.Exercise ) {
        orthobox.wall_errors.push({ timestamp, duration });
    }
}, 'wall_error'));


HID_handlers.drop_error = action(save_raw_event(({timestamp, duration}) => {
    if ( orthobox.state === ORTHOBOX_STATE.Exercise ) {
        orthobox.drop_errors.push({ timestamp });
    }
}, 'drop_error'));


HID_handlers.status = action(save_raw_event(async ({timestamp, status}) => {

    let byte1 = status[3] || status[0];

    // If tool soldered incorrectly.
    if ( byte1 & 1 ) {  // bit-wise and
        user_input('Device Manufactured Incorrectly', { Quit: exit });
    }

    // Set tool state based on bits 2 & 3 in 1st byte.
    orthobox.tool_state = ( byte1 >> 1 ) & 0b11;

    while ( orthobox.tool_state === TOOL_STATE.Unplugged ) {
        const promise = new Promise(((resolve, reject) => {
            user_input('Tool Not Connected', { Retry: resolve, Quit: reject });
        }));
        try {
            await promise;
        } catch {
            exit();
        }
    }

    if ( orthobox.set_up && orthobox.tool_state === TOOL_STATE.In ) {
        orthobox.state = ORTHOBOX_STATE.Ready;
    } else {
        orthobox.state = ORTHOBOX_STATE.Waiting;
    }
}, 'status'));


HID_handlers.tool = action(save_raw_event(({timestamp, new_state}) => {
    orthobox.tool_state = new_state;
    switch ( new_state ) {
        case TOOL_STATE.Out:
            switch ( orthobox.state ) {
                case ORTHOBOX_STATE.Ready:
                    if ( orthobox.set_up ) {
                        orthobox.state = ORTHOBOX_STATE.Waiting;   // Set to Waiting in case video isn't recording.
                        orthobox.start_exercise();  // State set in function.
                    }
                    break;
            }
            break;
        case TOOL_STATE.In:
            switch ( orthobox.state ) {
                case ORTHOBOX_STATE.Waiting:
                    if ( orthobox.set_up ) {
                        orthobox.state = ORTHOBOX_STATE.Ready;
                    }
                    break;
            }
            break;
        case TOOL_STATE.Unplugged:
            switch ( orthobox.state ) {
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

HID_handlers.poke = action(save_raw_event(({timestamp, location}) => {
    if ( orthobox.state === ORTHOBOX_STATE.Exercise ) {
        orthobox.pokes.push({ poke: { timestamp, location } });
        if ( orthobox.pokes.length >= 10 ) {
            orthobox.end_exercise();
        }
    }
}, 'poke'));

export class Orthobox_Component<P, S> extends View_Port<P & { orthobox: Orthobox }, S> {
    componentWillMount() {
        super.componentWillMount();
        const session_data = get_session_data();
        initialize_device(session_data, HID_handlers);
        Object.assign(orthobox.session_data, session_data);
    }
}

@observer
export class Status_Bar extends React.Component<{orthobox: Orthobox}, {}> {
    render() {
        let orthobox = this.props.orthobox;
        let timer = null;
        let error_count = null;
        switch ( orthobox.state ) {
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
            case ORTHOBOX_STATE.Disconnected:
                timer = 'Disconnected';
                break;
        }
        if ( orthobox.session_data !== undefined ) {
           return (
               <div id="status_bar" className="flex-grow flex-container row">
                   {/*<h2 id="student_name"> {orthobox.session_data.user_display_name} </h2>*/}
                   {/*<div className="flex-item">*/}
                   {/*<h2 id="student_name"> user_display_name </h2>*/}
                   {/*</div>*/}
                   <div className="flex-grow flex-container column">
                       <div className="flex-grow">
                           <h3 id="course_name"> {( orthobox.session_data as Session_Data ).course} </h3>
                           {/*<h3 id="course_name"> course_name </h3>*/}
                       </div>
                       <div className="flex-grow">
                           <h3 id="exercise_name"> {( orthobox.session_data as Session_Data ).exercise} </h3>
                           {/*<h3 id="exercise_name"> exercise_name </h3>*/}
                       </div>
                   </div>
                   <div className="flex-grow">
                       <h2 id="timer"> {timer} </h2>
                   </div>
                   <div className="flex-grow">
                       <h3 id="error_count"> {error_count} </h3>
                   </div>
               </div>
           )
        } else {
            return <div className="flex-grow"><h2> Loading </h2></div>
        }
    }
}

/**
 * Mirror video input back to user.
 *
 * Takes set_video_player and add_media_stream callbacks as props to return video node and video stream, respectively.
 */
export type Video_Player = HTMLVideoElement;

class Video_Display extends React.Component<{
    set_video_player: (video_player: Video_Player) => void,
    viewport: Viewport,
    src: string
}, {}> {

    componentDidMount() {
        this.props.set_video_player && this.props.set_video_player(findDOMNode(this) as Video_Player);
    }

    render() {
        if ( this.props.viewport.window_width > this.props.viewport.window_height ) {   // Wide
            return (
                <video src={this.props.src} height={this.props.viewport.window_height * .8} autoPlay/>
            );
        } else {  // Tall
            return (
                <video src={this.props.src} width={this.props.viewport.window_width * .8} autoPlay/>
            );
        }
    }
}

@observer
export class Video_Recorder extends React.Component<{ viewport: Viewport, orthobox: Orthobox },
    { src: string, devices: Array<MediaDeviceInfo> }> {
    constructor(props: any) {
        super(props);
        this.media_streams = [];
        this.constraints = { video: { facingMode: "environment" } };
        this.state = { src: '', devices: [] };
        this.set_video_player = this.set_video_player.bind(this);
        this.record = this.record.bind(this);
        this.switch_source = this.switch_source.bind(this);
    }
    constraints: MediaStreamConstraints | false;
    video_player: Video_Player;
    media_streams: Array<MediaStream>;

    set_video_player(video_player: Video_Player) {
        this.video_player = video_player;
    }

    start_video() {
        if ( this.constraints ) {
            navigator.mediaDevices.getUserMedia(this.constraints)
                     .then(mediaStream => {
                         this.media_streams.push(mediaStream);
                         if ( DEVEL ) { window.devel.video_stream = mediaStream; }
                         this.setState({ src: window.URL.createObjectURL(mediaStream) });
                         this.constraints = false;
                     })
                     .catch(on_error);
        }
    }

    record() {
        let orthobox = this.props.orthobox;
        if ( orthobox.state !== ORTHOBOX_STATE.Ready ) {
            return user_input('Error: Recording will not begin until device is ready.', { OK: noop });
        }
        // FIXME: Nuke the existing media streams so that kurento-client can recreate them because passing them in as an doesn't actually work.
        this.media_streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
        DEBUG(`Stopped media_stream: ${this.media_streams}`);
        this.video_player.src = '';
        let options = {
            localVideo: this.video_player,
            // videoStream: this.video_stream,  // FIXME: You might think this would work, especially if you read the source, but it doesn't, actually.
            // TODO: Additional options
        };
        DEBUG('options:', options);
        kurento_utils.WebRtcPeer.WebRtcPeerSendonly(options, function (this: kurento_utils.WebRtcPeer, error: any) {   // FIXME: remove or fix kurento-utils: Sendonly still manages to receive a lot of data.
            if ( error ) {
                return on_error(error);
            }
            let webRTC_peer = this;  // kurento_utils binds 'this' to the callback, because this function is actually a pile of steaming shit wrapped in an object.
            DEBUG('webRTC_peer:', webRTC_peer);
            webRTC_peer.generateOffer((error: string | undefined, offer: string) => {
                let session_data = orthobox.session_data as Session_Data;
                if ( error ) {
                    return on_error(error);
                }
                kurentoClient.KurentoClient(session_data.kurento_url).then((client: any) => {
                    DEBUG('got kurento_client:', client);
                    client.create('MediaPipeline', (error: string | undefined, pipeline: any) => {
                        DEBUG('pipeline:', pipeline);
                        let elements =
                            [
                                {
                                    type: 'RecorderEndpoint',
                                    params: { uri: `file://${session_data.kurento_video_directory}/${session_data.id}.webm` }
                                },
                                { type: 'WebRtcEndpoint', params: {} }
                            ];
                        pipeline.create(elements, (error: string | undefined, [recorder, webRTC]: [any, any]) => {
                            if ( error ) {
                                return on_error(error);
                            }
                            // Set ice callbacks
                            webRTC_peer.on('icecandidate', (candidate: any) => {
                                DEBUG('Local candidate:', candidate);
                                candidate = kurentoClient.getComplexType('IceCandidate')(candidate);
                                webRTC.addIceCandidate(candidate, on_error);
                            });
                            webRTC.on('OnIceCandidate', (event: any) => {
                                DEBUG('Remote candidate:', event.candidate);
                                webRTC_peer.addIceCandidate(event.candidate, on_error);
                            });
                            webRTC.processOffer(offer, (error: string | undefined, answer: any) => {
                                if ( error ) {
                                    return on_error(error);
                                }
                                DEBUG('gathering candidates');
                                webRTC.gatherCandidates(on_error);
                                DEBUG('processing answer');
                                webRTC_peer.processAnswer(answer);
                            });
                            DEBUG('connecting');
                            client.connect(webRTC, webRTC, recorder, (error: string | undefined) => {
                                if ( error ) {
                                    return on_error(error);
                                }
                                DEBUG('connected');
                                recorder.record(action((error: string) => {
                                    if ( error ) {
                                        return on_error(error);
                                    }
                                    DEBUG('recording');
                                    let recording = true;
                                    orthobox.recording = true;
                                    orthobox.stop_recording = () => {
                                        if ( recording ) {
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

    stop_streams() {
        this.media_streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
        this.media_streams = [];
    }

    async switch_source() {
        // FIXME: Handle more than 2 sources
        const get_deviceId = () => {
            for (const stream of this.media_streams) {
                for (const video_stream of stream.getVideoTracks()) {
                   return video_stream.getSettings().deviceId;
                }
            }
            return '';
        };
        let deviceId = get_deviceId();
        const devices = ( await navigator.mediaDevices.enumerateDevices() ).filter(device => device.kind === "videoinput" && device.deviceId !== deviceId);
        deviceId = devices[0] && devices[0].deviceId;
        this.constraints = { video: { deviceId } } ;
        this.stop_streams();
        this.start_video();
    }

    componentDidMount() {
        this.start_video();
    }

    componentWillUnmount() {
        this.props.orthobox.stop_recording();
        this.stop_streams();
    }

    render() {
        return (
            <div className="column flex-container flex-grow centered">
                <Video_Display set_video_player={this.set_video_player} src={this.state.src!} viewport={this.props.viewport}/>
                {/* FIXME: Bug in either kurento-utils or kurento-client, probably related to https://github.com/onsip/SIP.js/issues/328#issuecomment-223003736 */}
                {/*<button id="record" onClick={this.record} hidden={this.props.orthobox.recording}> Record</button>*/}
                {/* FIXME: Temporary hack for conference */}
                <div className="flex-grow flex-container row centered">
                    <button id="record" onClick={this.connect}> Connect </button>
                    <button id="switch-source" onClick={this.switch_source}> Switch Camera </button>
                </div>
            </div>
        );
    }

    connect() { // FIXME: Temporary hack for conference
        initialize_device(get_session_data(), HID_handlers);
    }
}
