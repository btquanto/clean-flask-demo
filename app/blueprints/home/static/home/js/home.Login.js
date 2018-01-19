import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { push } from 'react-router-redux'
import axios from 'axios'
import FormData from 'form-data'

import { Form, Field, Validator, SubmitButton } from 'Components/BootstrapForm'

class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: ""
        }
    }

    render() {
        return (
            <div className="login d-flex justify-content-center align-items-center">
                <Form title="Login">
                    <Field
                        fieldId="username"
                        title="Username"
                        inputType="text"
                        onChange={e => {
                            let value = e.target.value
                            this.setState((prev, props) => ({
                                username: value
                            }))
                        }}>
                        <Validator
                            errorMessage="Username is required"
                            validator={'required'} />
                    </Field>
                    <Field
                        fieldId="password"
                        title="Password"
                        inputType="password"
                        onChange={e => {
                            let value = e.target.value
                            this.setState((prev, props) => ({
                                password: value
                            }))
                        }}>
                        <Validator
                            errorMessage="Password is required"
                            validator={'required'} />
                    </Field>
                    <SubmitButton
                        className="btn-primary align-self-end"
                        title="Login"
                        onSubmit={isFormValid => {
                            if (isFormValid) {
                                this.props.submitForm({
                                    username: this.state.username,
                                    password: this.state.password
                                })
                            }
                        }} />
                </Form>
            </div>
        )
    }
}

export default connect((state, props) => ({
}), dispatch => ({
    submitForm: inputs => {
        let form = new FormData()
        form.append("username", inputs.username)
        form.append("password", inputs.password)

        axios.post('/user/login', form)
            .then(response => {
                let data = response.data
                if (data.success) {
                    dispatch({
                        type: 'USER_LOGIN_SUCCESS',
                        auth_key: data.auth_key
                    })
                    dispatch(push('/'))
                } else {
                    dispatch({
                        type: 'USER_LOGIN_FAILED',
                        error: data.error
                    })
                }
            })
    }
}))(Login)