/**
 * Helper util to know window size.
 */

import * as React from 'react';

export interface Viewport {
    window_width: number,
    window_height: number
}

export class View_Port extends React.Component<any, { viewport: Viewport }> {
    constructor(props: any) {
        super(props);
        this.state = { viewport: { window_width: window.innerWidth, window_height: window.innerHeight } };
        this.handle_resize = this.handle_resize.bind(this);
    }

    handle_resize() {
        this.setState({ viewport: { window_width: window.innerWidth, window_height: window.innerHeight } });
    }

    componentDidMount() {
        window.addEventListener('resize', this.handle_resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handle_resize);
    }
}
