import React, { Component } from 'react';
import classNames from 'classnames';

class VideoPlayer extends Component {

    static get defaultProps() {
        return {
            autoPlay: true,
            src: null
        }
    }

    constructor(props) {
        super(props);

        this.state = {
        };

        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
    }

    render() {
        return (
            <video
                className={this.props.className}
                ref="video"
                autoPlay={this.props.autoPlay}
                src={this.props.src} />
        );
    }

    play() {
        this.refs.video.play();
    }

    pause() {
        this.refs.video.pause();
    }
}

export default VideoPlayer;