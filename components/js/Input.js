import React, { Component } from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import Icon from './Icon'

class Input extends Component {

    constructor(props) {
        super(props);

        var valid = (this.props.isValid && this.props.isValid()) || true;

        this.state = {
            active: false,
            type: "text",
            value: ""
        };
    }

    onTextChanged(event) {
        let value = event.target.value;
        this.setState({
            value: value,
            active: value ? true : false
        });
    }

    render() {
        let inputGroupClasses = classNames({
            'field':     true,
            'field-not-empty': this.state.active
        });

        if (this.state.validator) {
            // Add Validator
        }

        return (
            <div className={inputGroupClasses}>
                <label className="field-label" htmlFor={this.props.label}>
                    {this.props.label}
                </label>
                <input
                    className="field-input"
                    defaultValue={this.state.value}
                    id={this.props.label}
                    onChange={this.onTextChanged.bind(this)}
                    placeholder={this.props.label}
                    type={this.props.type}
                />
            </div>
        );
    }
}

export default Input;