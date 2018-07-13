import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

class ChatBox extends Component {

    constructor(props) {
        super(props);

        this.state = {
            message: ""
        };

        this.messagesEnd = null;
    }
    componentDidMount() {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    render() {
        let self = this;

        return (
            <div
                className={this.props.className + " d-flex flex-column"}
                ref="messages">
                <div className="d-flex flex-column w-100 flex-nowrap overflow-y-auto cb-messages">
                    {
                        this.props.messages.map((message, index) => {
                            if (message.type == "message") {
                                if (message.is_self) {
                                    return (
                                        <div
                                            className="cbm"
                                            key={index}>
                                            <div className="cbm-item cbm-item-right">{message.message}</div>
                                            <div className="cbm-name cbm-name-right">{message.user.username}</div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            className="cbm"
                                            key={index}>
                                            <div className="cbm-item cbm-item-left">{message.message}</div>
                                            <div className="cbm-name cbm-name-left">{message.user.username}</div>
                                        </div>
                                    );
                                }
                            } else if (message.type == "online notification") {
                                return (
                                    <p key={index}>{message.message}</p>
                                );
                            } else if (message.type == "offline notification") {
                                return (
                                    <p key={index}>{message.message}</p>
                                );
                            }
                        })
                    }
                    <div ref={(el) => {this.messagesEnd = el}} />
                </div>
                <div className="d-flex flex-row w-100 cb-input">
                    <input
                        className="form-control"
                        placeholder="Enter text here..."
                        onChange={e => this.setState({ message: e.target.value })}
                        onKeyPress={e => {
                            if (e.key == 'Enter') {
                                this.props.onSendButtonClicked && this.props.onSendButtonClicked(this.state.message);
                                this.setState({ message: "" });
                            }
                        }}
                        value={this.state.message} />
                    <span className="input-group-btn ml-auto">
                        <button
                            className="btn btn-info"
                            onClick={
                                e => {
                                    this.props.onSendButtonClicked && this.props.onSendButtonClicked(this.state.message);
                                    this.setState({ message: "" });
                                }
                            }>Send</button>
                    </span>
                </div>
            </div>
        );
    }
}

export default connect((state, props) => {
    return {
        messages: state.chatBox.messages
    };
}, (dispatch) => {
    return {};
})(ChatBox);