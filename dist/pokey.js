/**
 * Created by riggs on 8/15/16.
 */
'use strict';
import { Status_Bar, Video_Recorder, orthobox, Orthobox_Component } from "./orthobox_shared_components";
import * as React from 'react';
import { render } from 'react-dom';
orthobox.set_up = true;
class Pokey extends Orthobox_Component {
    render() {
        return (React.createElement("div", { className: "flex-container column" },
            React.createElement(Status_Bar, Object.assign({}, this.props)),
            React.createElement(Video_Recorder, Object.assign({ viewport: this.state.viewport }, this.props))));
    }
}
render(React.createElement(Pokey, { orthobox: orthobox }), document.getElementById('pokey_app'));
//# sourceMappingURL=pokey.js.map