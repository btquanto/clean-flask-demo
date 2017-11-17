import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Input from 'Components/Input';

class RegisterForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            name: "",
            password_confirm: "",
            password: ""
        }
    }
    render() {
        let formClasses = classNames({
            'form': true,
            'go-bottom': true,
            'registerForm': true,
        });

        return (
            <div className={formClasses}>
                <Input
                    label="Name"
                    type="text"
                    value={this.state.name}
                />
                <Input
                    label="Email Address"
                    type="email"
                    value={this.state.email}
                />
                <Input
                    label="Password"
                    type="password"
                    value={this.state.password}
                />
                <Input
                    label="Confirm password"
                    type="password"
                    value={this.state.password_confirm}
                />
                <Input
                    label="Submit"
                    type="button"
                    value="Submit"
                />
            </div>
        )
    }
}

ReactDOM.render(
    <RegisterForm />,
    document.getElementById('root')
);