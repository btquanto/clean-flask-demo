import React, { Component } from 'react'

import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Router, Route, NavLink } from 'react-router-dom'
import axios from 'axios'

import Api from 'Global/Api'
import Login from './login'

class App extends Component {

    componentWillMount() {
        this.props.checkAuthStatus()
    }

    render() {
        return (
            <Router basename="/" hashType="slash" history={this.props.history}>
                <div id="content">
                    {this.props.isLoggedIn && "You are logged in"}
                    {!this.props.isLoggedIn && <Route path="/login" component={Login} />}
                </div>
            </Router>
        )
    }
}

export default connect((state, props) => ({
    isLoggedIn: state.app.isLoggedIn,
    user: state.app.user
}), dispatch => ({
    checkAuthStatus: () => axios.get(Api.authStatus)
        .then(response => {
            dispatch({
                type: 'UPDATE_AUTH_STATUS',
                success: true,
                user: response.data
            })
        })
        .catch(error => {
            dispatch({ type: 'LOGOUT' })
            dispatch(push("/login"))
        }),
    logout: () => axios.post('/user/logout')
        .then(response => dispatch({ type: 'LOGOUT' }))
}))(App)