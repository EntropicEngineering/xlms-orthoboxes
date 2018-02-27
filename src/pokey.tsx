/**
 * Created by riggs on 8/15/16.
 */

'use strict';

import { Status_Bar, Video_Recorder, orthobox, Orthobox_Component, Orthobox } from "./orthobox_shared_components";
import { Viewport } from "./UI_utils";

import * as React from 'react';
import {render} from 'react-dom';


orthobox.set_up = true;

class Pokey extends Orthobox_Component<{orthobox: Orthobox}, {viewport: Viewport}> {
  render() {
    return (
      <div className="flex-container column">
        <Status_Bar {...this.props}/>
        <Video_Recorder viewport={this.state.viewport} {...this.props}/>
      </div>
    );
  }
}


render(
  <Pokey orthobox={orthobox}/>,
  document.getElementById('content')
);


