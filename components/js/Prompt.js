import React, { Component } from 'react';

class Prompt extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.defaultValue
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.value !== this.state.value) {
            this.props.onChange(this.state.value);
        }
    }

    _onChange(e) {
        let value = e.target.value;
        this.setState({ value: value });
        if(this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {
    return (
            <input
                type="text"
                placeholder={this.props.placeholder}
                className="mm-popup__input"
                defaultValue={this.state.value}
                onChange={this._onChange.bind(this)} />
        );
    }
}

export default Prompt;