import React, { Component } from 'react';
import classNames from 'classnames';


class UserList extends Component {
    static get defaultProps() {
        return {
            users: []
        };
    }

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    onCallButtonClicked(user) {
        if(this.props.onCallButtonClicked) {
            this.props.onCallButtonClicked(user);
        }
    }

    render() {
        let users = [];
        let self = this;
        this.props.users.map(user => {
            if (user.id == this.props.user.id) {
                users.splice(0, 0, user);
            } else {
                users.push(user);
            }
        });
        return (
            <div className={this.props.className}>
                <div className="cbul-head text-center">
                    ONLINE USERS
                </div>
                <div className="cbul-body">
                    {
                        users.map(user => {
                            return (
                                <div key={user.id}>
                                    <div className="d-flex align-items-start">
                                        <span>@{user.username}{user.id == self.props.user.id ? " (you)" : ""}</span>
                                        {
                                            user.id == self.props.user.id ? "" :
                                            (
                                                <button
                                                    className="ml-auto btn btn-sm btn-success"
                                                    onClick={e => self.onCallButtonClicked.bind(self)(user)}>Call</button>
                                            )
                                        }
                                    </div>
                                    <span>{user.id.substr(0, 8)}</span>
                                    <hr/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

export default UserList;