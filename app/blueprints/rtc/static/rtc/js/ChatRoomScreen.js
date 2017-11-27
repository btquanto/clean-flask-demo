import React, { Component } from 'react';
import { combineReducers, createStore } from 'redux';
import { connect } from 'react-redux';
import LoginScreen from './LoginScreen';
import WebCamPlayer from 'Components/WebCamPlayer';
import VideoPlayer from 'Components/VideoPlayer';
import ChatBox from 'Components/ChatBox';
import UserList from 'Components/UserList';
import PeerManager from 'Components/PeerManager';
import Popup from 'react-popup';

class ChatRoomScreen extends Component {
    constructor(props) {
        super(props);
        this.socket = null;

        this.signalRTCMessage = this.signalRTCMessage.bind(this);

        this.peerManager = new PeerManager({
            onIceCandidate: this.onIceCandidate.bind(this),
            onAddStream: this.onAddStream.bind(this),
            onRemoveStream: this.onRemoveStream.bind(this),
            onIceConnectionStateChange: this.onIceConnectionStateChange.bind(this),
            signalRTCMessage: this.signalRTCMessage
        });

        let self = this;
        let socket = this.socket = props.socket;

        socket.on('room_joined', data => {
            let user = data.user;
            let room = data.room;
            let onlineUsers = data.room.users;

            self.props.joinRoom(user, room);

            for (let i = 0; i < onlineUsers.length; i++) {
                let user = onlineUsers[i];
                self.peerManager.addPeer(user.id);
            }
        });

        socket.on('user_online', data => {
            let user = data.user;
            let users = data.users;
            self.props.updateWhenUserGoesOnline(user, users);
            self.peerManager.addPeer(user.id);
        });

        socket.on('user_offline', data => {
            let user = data.user;
            let users = data.users;
            self.props.updateWhenUserGoesOffline(user, users);
            self.peerManager.removePeer(user.id);
        });

        socket.on('message', data => {
            let user = data.user;
            let message = data.message;
            self.props.receiveMessage(user, message);
        });

        socket.on('webrtc message', message => {
            let type = message.type;
            let user = message.from;
            let extras = message.extras;

            let peerConnection = this.peerManager.getPeer(user.id).peerConnection;
            let peerManager = this.peerManager;

            switch (type) {
                case 'init':
                    Popup.create({
                        content: <div>{`${user.username} is calling`}</div>,
                        buttons: {
                            left: ['cancel'],
                            right: [{
                                text: 'Answer',
                                className: 'success',
                                action: popup => {
                                    peerManager.toggleLocalStream(user.id);
                                    peerManager.offer(user.id);
                                    popup.close();
                                }
                            }]
                        }
                    });
                    break;
                case 'offer':
                    peerConnection.setRemoteDescription(new RTCSessionDescription(extras))
                        .then(() => {
                            self.props.addRemoteUser(user);
                            peerManager.answer(user.id)
                        })
                        .catch(console.log);
                    break;
                case 'answer':
                    peerConnection.setRemoteDescription(new RTCSessionDescription(extras))
                        .then(() => self.props.addRemoteUser(user))
                        .catch(console.log);
                    break;
                case 'candidate':
                    if (peerConnection.remoteDescription) {
                        peerConnection.addIceCandidate(new RTCIceCandidate({
                            sdpMLineIndex: message.extras.label,
                            sdpMid: message.extras.id,
                            candidate: message.extras.candidate
                        }), () => { }, console.log);
                    }
                    break;
            }
        });
    }

    componentDidMount() {
        this.socket.emit('join_room', {
            room_id: this.props.room_id,
            username: this.props.localUser.username
        });
    }

    onIceCandidate(event, peerId) {
        if (event.candidate) {
            this.signalRTCMessage(peerId, 'candidate', {
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        }
    }

    onAddStream(event, peerId) {
        this.props.addRemoteStream(event.stream);
    }

    onRemoveStream(event, peerId) {
        this.props.removeRemoteStream();
    }

    onIceConnectionStateChange(event, peerId) {
        switch ((event.srcElement || event.target).iceConnectionState) {
            case 'disconnected':
                this.props.removeRemoteStream();
                break;
        }
    }

    render() {
        let localUser = this.props.localUser;
        let remoteUser = this.props.remoteUser;
        let room = this.props.room;

        return (
            <div className="container flex-d align-items-stretch">
                <div className="row">
                    <div className="col-9 chat-area">
                        <div className="row">
                            <div className="col flex-d no-padding wc-container">
                                <div className="text-center wc-head">{localUser.username}</div>
                                <WebCamPlayer
                                    className="w-100"
                                    onGetStream={
                                        stream => {
                                            this.peerManager.setLocalStream(stream);
                                            this.props.addLocalStream(stream);
                                        }
                                    } />
                            </div>
                            <div className="col flex-d no-padding wc-container">
                                <div className="text-center wc-head">{remoteUser.username || ""}</div>
                                {
                                    !!remoteUser.stream && (
                                        <VideoPlayer
                                            className="w-100"
                                            src={
                                                window.URL && remoteUser.stream ?
                                                    window.URL.createObjectURL(remoteUser.stream) :
                                                    remoteUser.stream
                                            } />
                                    )
                                }
                            </div>
                        </div>
                        <div className="row">
                            <ChatBox
                                className="chatbox w-100"
                                onSendButtonClicked={
                                    message => {
                                        this.socket.emit('message', message);
                                    }
                                } />
                        </div>
                    </div>
                    <div className="online-users col-3 no-padding">
                        <UserList
                            user={localUser}
                            users={room.users}
                            className=""
                            onCallButtonClicked={
                                user => {
                                    this.peerManager.toggleLocalStream(user.id);
                                    this.signalRTCMessage(user.id, 'init', null);
                                }
                            } />
                    </div>
                </div>
            </div>
        );
    }

    signalRTCMessage(target, type, extras) {
        this.socket.emit('webrtc message', {
            type: type,
            target: target,
            extras: extras
        })
    }
}

export default connect((state, props) => {
    return {
        localUser: state.chatRoom.localUser,
        remoteUser: state.chatRoom.remoteUser,
        room: state.chatRoom.room
    };
}, (dispatch) => {
    return {
        addLocalStream: stream => dispatch({
            type: 'ADD_LOCAL_STREAM',
            stream: stream
        }),
        addRemoteUser: user => dispatch({
            type: 'ADD_REMOTE_USER',
            user: user
        }),
        addRemoteStream: stream => dispatch({
            type: 'ADD_REMOTE_STREAM',
            stream: stream
        }),
        removeRemoteStream: () => dispatch({
            type: 'REMOVE_REMOTE_STREAM'
        }),
        joinRoom: (user, room) => dispatch({
            type: 'JOIN_ROOM',
            user: user,
            room: room
        }),
        updateWhenUserGoesOnline: (user, users) => dispatch({
            type: 'UPDATE_WHEN_USER_GOES_ONLINE',
            user: user,
            users: users
        }),
        updateWhenUserGoesOffline: (user, users) => dispatch({
            type: 'UPDATE_WHEN_USER_GOES_OFFLINE',
            user: user,
            users: users
        }),
        receiveMessage: (user, message) => dispatch({
            type: 'RECEIVE_MESSAGE',
            user: user,
            message: message
        })
    };
})(ChatRoomScreen);