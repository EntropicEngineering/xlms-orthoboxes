/**
 * Created by riggs on 8/15/16.
 */

'use strict';

import { Status_Bar, Video_Recorder, orthobox, Orthobox_Component } from "./orthobox_shared_components";

import * as React from 'react';
import {render} from 'react-dom';
import { User_Input } from "./UI_utils";

orthobox.set_up = true;

class Pokey extends Orthobox_Component<{}, {}> {
  render() {
    return (
      <div className="flex-container column">
        <Status_Bar {...this.props}/>
        <Video_Recorder viewport={this.state.viewport} {...this.props}/>
        <User_Input/>
      </div>
    );
  }
}


render(
  <Pokey orthobox={orthobox}/>,
  document.getElementById('pokey_app')
);


