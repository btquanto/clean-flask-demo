import React, { Component } from 'react'
import { connect } from 'react-redux'

class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: ""
        }
    }

    render() {
        return (
            <div>Login</div>
        )
    }
}

export default connect((state, props) => ({}), dispatch => ({}))(Login)