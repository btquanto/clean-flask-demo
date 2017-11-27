import React, { Component } from 'react';
import { connect } from 'react-redux';
import Popup from 'react-popup';

class LoginScreen extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let username = this.props.username;
        let room_id = this.props.room_id;
        let history = this.props.history;
        let self = this;

        Popup.create({
            title: 'Enter room id:',
            content: (
                <div >
                    <input type="text"
                        className="mm-popup__input"
                        defaultValue={username}
                        onChange={(e) => username = e.target.value} />
                    <input type="text"
                        className="mm-popup__input"
                        defaultValue={room_id}
                        onChange={(e) => room_id = e.target.value} />
                </div>
            ),
            buttons: {
                left: ['cancel'],
                right: [{
                    text: 'Join',
                    className: 'success',
                    action: popup => {
                        let nextLocation = `/r/${room_id}`;
                        if (nextLocation != history.location.pathname) {
                            history.push(nextLocation);
                        }
                        popup.close();
                        self.props.login(username, room_id);
                    }
                }]
            }
        });
    }

    render() {
        return <div />;
    }
}

let mapStateToProps = (state, props) => {
    let loginState = state.login;
    return {
        username: loginState.user.username,
        room_id: loginState.room_id
    };
}

let mapDispatchToProps = (dispatch) => {
    return {
        login: (username, room_id) => dispatch({
            type: 'LOGIN',
            username: username,
            isLoggedIn: true,
            room_id: room_id
        })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);