import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ValidateEngine {
    constructor(form) {
        this.form = form
        this.fields = []
        this.subscribe = this.subscribe.bind(this)
        this.validate = this.validate.bind(this)
    }

    validate() {
        let isValid = true
        this.fields.forEach(field => {
            let validateResult = field.validate()
            isValid = isValid && validateResult
        })
        this.form.onValidation(isValid)
        return isValid
    }

    subscribe(field) {
        this.fields.push(field)
    }
}

class Form extends Component {

    static defaultProps = {
        className: "",
        title: "Bootstrap Form"
    }

    constructor(props) {
        super(props)
        this.validateEngine = new ValidateEngine(this)
        this.onValidation = this.onValidation.bind(this)
        this.state = {
            isValid: true
        }
    }

    getChildContext() {
        return {
            validateEngine: this.validateEngine
        }
    }

    onValidation(isValid) {
        this.setState((prev, props) => ({
            isValid: isValid
        }))
    }

    render() {
        return (
            <div className={this.props.className + "bootstrap-form form p-3 d-flex flex-column"}>
                <div className="form-head d-flex flex-row justify-content-center">
                    <h3 className="form-title">{this.props.title}</h3>
                </div>
                {this.props.children}
            </div>
        )
    }
}

Form.childContextTypes = {
    validateEngine: PropTypes.object
}

class ValidatorManager {
    constructor(field) {
        this.field = field
        this.validators = []
        this.subscribe = this.subscribe.bind(this)
        this.validate = this.validate.bind(this)
    }

    validate() {
        let isValid = true
        this.validators.forEach(validator => {
            isValid = isValid && validator.validate(this.field.state.value)
        })
        this.field.onValidation(isValid)
        return isValid
    }

    subscribe(validator) {
        this.validators.push(validator)
    }
}

class Field extends React.Component {

    static defaultProps = {

        className: "",
        fieldId: null,
        inputType: "text",
        title: "Bootstrap Field",
        defaultValue: "",
        description: null,
        onChange: e => { }
    }

    constructor(props) {
        super(props)

        this.state = {
            value: "",
            isValid: null
        }
        this.onChange = this.onChange.bind(this)
        this.validatorManager = new ValidatorManager(this)
        this.onValidation = this.onValidation.bind(this)
    }

    getChildContext() {
        return {
            validatorManager: this.validatorManager
        }
    }

    componentDidMount() {
        this.context.validateEngine.subscribe(this)
    }

    validate() {
        return this.validatorManager.validate()
    }

    onValidation(isValid) {
        this.setState((props, prev) => ({
            isValid: isValid
        }))
    }

    onChange(e) {
        let value = e.target.value;
        this.setState((prev, props) => ({
            value: value
        }))
        this.props.onChange && this.props.onChange(e)
    }

    render() {

        let helpId = `${this.props.fieldId}Help`
        let isValid = this.state.isValid
        let value = this.state.value

        return (
            <div className={`${this.props.className} form-group`}>
                <label htmlFor={this.props.fieldId}>{this.props.title}</label>
                <input id={this.props.fieldId}
                    className={`form-control ${isValid === null ? '' : isValid ? 'is-valid' : 'is-invalid'}`}
                    type={this.props.inputType}
                    aria-describedby={helpId}
                    onBlur={e => this.validatorManager.validate()}
                    onChange={this.onChange} />
                {
                    !!this.props.description ? (
                        <small id={helpId} className="form-text text-muted">
                            {this.props.description}
                        </small>
                    ) : ""
                }
                {this.props.children}
            </div>
        )
    }
}

Field.childContextTypes = {
    validatorManager: PropTypes.object
}

Field.contextTypes = {
    validateEngine: PropTypes.object
}

class SubmitButton extends React.Component {

    static defaultProps = {
        title: "Submit"
    }

    render() {
        return (
            <button
                className={`${this.props.className} btn`}
                type="submit"
                onClick={e => this.props.onSubmit && this.props.onSubmit(this.context.validateEngine.validate())} >
                {this.props.title}
            </button>
        )
    }
}

SubmitButton.contextTypes = {
    validateEngine: PropTypes.object
}


class Validator extends React.Component {

    static VALIDATORS = {
        compare: (v, _v) => v === _v(),
        match: (v, regex) => !!regex.exec(v()),
        required: v => !!v,
        min_length: (v, minLength) => v.length >= minLength,
        max_length: (v, maxLength) => v.length <= maxLength
    }

    static defaultProps = {
        errorMessage: "Invalid",
        validator: v => true
    }

    constructor(props) {
        super(props)

        this.state = {
            error: null
        }

        this.validate = this.validate.bind(this)
    }

    componentDidMount() {
        this.context.validatorManager.subscribe(this)
    }

    validate(value) {
        let validator = this.props.validator
        let errorMessage = this.props.errorMessage

        let error = null
        let args = [value]

        if (typeof validator !== "function") {
            let funcName = validator

            if (Array.isArray(validator)) {
                funcName = validator[0]
                args = [value, ...validator.slice(1)]
            }

            let defaultValidator = Validator.VALIDATORS[funcName]

            if (!defaultValidator) {
                console.warn(`Unable to find validator ${funcName}`)
                return true
            }

            validator = defaultValidator
        }

        if (!validator(...args)) {
            error = errorMessage
        }

        this.setState((prev, props) => ({
            error: error
        }))

        return !error
    }

    render() {
        return (
            <div className="invalid-feedback">
                {this.state.error}
            </div>
        )
    }
}


Validator.contextTypes = {
    validatorManager: PropTypes.object
}


export { Form, Field, Validator, SubmitButton }