import React, { Component } from 'react';
import { createStore } from 'redux';
import { connect } from 'react-redux';
import { HashRouter as Router, Route, Link } from 'react-router-dom';

import Popup from 'react-popup';

import LoginScreen from './rtc.LoginScreen';
import ChatRoomScreen from './rtc.ChatRoomScreen';

class ReduxRTC extends Component {
    constructor(props) {
        super(props);
        this.socket = props.socket;
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
                                    room_id={props.match.params.room_id} />
                            )} />
                            : <Route path="/r/:room_id" component={LoginScreen} />
                    }
                </div>
            </Router>
        );
    }
}

export default connect((state, props) => {
    return {
        user: state.app.user
    };
}, dispatch => {
    return {};
})(ReduxRTC);