import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import axios from 'axios'
import FormData from 'form-data'

import { Form, Field, Validator, SubmitButton } from 'Components/BootstrapForm'

class Register extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullname: "",
            username: "",
            email: "",
            password: ""
        }
    }
    render() {
        return (
            <div className="register d-flex justify-content-center align-items-center">
                <Form title="Register">
                    <Field
                        fieldId="fullname"
                        title="Full name"
                        inputType="text"
                        onChange={e => {
                            let value = e.target.value
                            this.setState((prev, props) => ({
                                fullname: value
                            }))
                        }}>
                        <Validator
                            errorMessage="Fullname is required"
                            validator={'required'} />
                    </Field>
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
                        fieldId="email"
                        title="Email"
                        inputType="email"
                        onChange={e => {
                            let value = e.target.value
                            this.setState((prev, props) => ({
                                email: value
                            }))
                        }}>
                        <Validator
                            errorMessage="Email is required"
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
                            errorMessage="Password length must be at least 6 characters"
                            validator={['min_length', 6]} />
                    </Field>
                    <Field
                        fieldId="confirmPassword"
                        title="Confirm password"
                        inputType="password">
                        <Validator
                            errorMessage="Password confirmation does not match"
                            validator={['compare', () => this.state.password]} />
                    </Field>
                    <SubmitButton
                        className="btn-primary align-self-end"
                        onSubmit={isFormValid => {
                            if (isFormValid) {
                                this.props.submitForm({
                                    fullname: this.state.fullname,
                                    username: this.state.username,
                                    email: this.state.email,
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
        form.append("fullname", inputs.fullname)
        form.append("username", inputs.username)
        form.append("email", inputs.email)
        form.append("password", inputs.password)

        axios.post('/user/api/register', form)
            .then(response => dispatch({
                type: 'USER_REGISTERED',
                response: response.data
            }))
    }
}))(Register)