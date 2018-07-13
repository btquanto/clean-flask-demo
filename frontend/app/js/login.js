import React, { Component } from 'react'
import { connect } from 'react-redux'

import { push } from 'react-router-redux'
import axios from 'axios'
import FormData from 'form-data'

import Api from 'Global/Api'

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
            <div className="body-login">
                <h1 className="h1-logo"><a href="./index.html"><img src="/assets/global/images/lg-logo.png" alt="" /></a></h1>
                <div className="content-login">
                    <div className="form-signin">
                        <div className="lg-header">
                            <h2 className="title1">AIデータ分析自動化</h2>
                            <h3 className="title2">AI Data Analytics Automated</h3>
                        </div>
                        <input
                            id="inputEmail" className="form-control mb-4"
                            type="email" placeholder="Email address" required="" autoFocus=""
                            value={this.state.email}
                            onChange={e => this.setState({ email: e.target.value })} />
                        <input
                            id="inputPassword" className="form-control"
                            type="password" placeholder="Password" required=""
                            value={this.state.password}
                            onChange={e => this.setState({ password: e.target.value })} />
                        <div className="forgot">
                            <a href="#"> forgot password?</a>
                        </div>
                        <button className="btn btn-lg btn-primary btn-block" type="submit"
                            onClick={e => this.props.submitForm({ email: this.state.email, password: this.state.password })}>Login</button>
                    </div>
                </div>
                <div className="footer-contact">
                    <div className="contact-title">
                        <img src="/assets/global/images/support.png" alt="Contact" />
                        <p className="ml-3 mb-0">Support</p>
                    </div>
                    <ul className="contact-list">
                        <li>support@aiforce.solutions.com</li>
                        <li>+8801829193637</li>
                        <li><a href="https://dhrubokinfotech.com">www.dhrubokinfotech.com</a></li>
                    </ul>
                </div>
            </div>
        )
    }
}

export default connect((state, props) => ({
}), dispatch => ({
    submitForm: inputs => {
        let form = new FormData()
        form.append("email", inputs.email)
        form.append("password", inputs.password)
        axios.post(Api.login, form)
            .then(response => {
                console.log("Login Success")
                console.log(response.data)
                dispatch({
                    type: 'UPDATE_AUTH_STATUS',
                    user: response.data
                })
                // dispatch(push('/'))
            })
            .catch(error => dispatch({ type: 'LOGOUT' }))
    }
}))(Login)