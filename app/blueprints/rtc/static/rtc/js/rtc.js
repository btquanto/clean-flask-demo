import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import ChatRoomScreen from './ChatRoomScreen';
import reducer from './reducers';
import Popup from 'react-popup';
import io from 'socket.io-client';

let protocol = location.protocol == 'https:' ? 'wss:' : 'ws:';
let domain = document.domain;
let port = location.port;
var socket = io(`${protocol}//${domain}:${port}/webrtc`);

class ReduxRTC extends Component {
    constructor(props) {
        super(props);
        this.socket = socket;
    }

    render() {
        return (
            <Router basename="/" hashType="slash">
                <div>
                    <Popup />
                    <Route exact={true} path="/" component={LoginScreen} />
                    {
                        this.props.user.isLoggedIn
                        ? <Route path="/r/:room_id" component={props => (
                                <ChatRoomScreen
                                    {...props}
                                    socket={this.socket}
                                    room_id={props.match.params.room_id}/>
                            )} />
                            : <Route path="/r/:room_id" component={LoginScreen} />
                    }
                </div>
            </Router>
        );
    }
}

let RTCApp = connect((state, props) => {
        return {
            user: state.app.user
        };
    }, dispatch => {
        return {};
    })(ReduxRTC);

ReactDOM.render(
    <Provider store={createStore(reducer, {})}>
        <RTCApp />
    </Provider>,
    document.getElementById('root')
);