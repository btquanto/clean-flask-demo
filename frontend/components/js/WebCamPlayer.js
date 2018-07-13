import React, { Component } from 'react';
import classNames from 'classnames';
import VideoPlayer from 'Components/VideoPlayer';

class WebCamPlayer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stream: null
        }
    }

    componentDidMount() {
        requestUserMedia({
            audio: true,
            video: {
                mandatory: {},
                optional: []
            }
        }).then(this.onGetUserMediaSuccess.bind(this), console.log);
    }

    onGetUserMediaSuccess(stream) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioContext = new AudioContext();
        let mediaStreamSource = audioContext.createMediaStreamSource(stream);
        mediaStreamSource.connect(audioContext.destination);

        if (window.URL) {
            this.setState({
                stream: window.URL.createObjectURL(stream)
            });
        } else {
            this.setState({
                stream: stream
            });
        }

        if (this.props.onGetStream) {
            this.props.onGetStream(stream);
        }
    }

    render() {
        return (
            <VideoPlayer
                className={this.props.className}
                autoPlay={true}
                src={this.state.stream} />
        );
    }
}

export default WebCamPlayer;