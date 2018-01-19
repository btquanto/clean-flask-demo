import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Router, Route, NavLink } from 'react-router-dom'

import axios from 'axios'

import Popup from 'react-popup'

import { NavBar, NavItems } from 'Components/BootstrapNavBar'

import Register from './home.Register'
import Login from './home.Login'

class HomeApp extends Component {

    componentWillMount() {
        this.props.refreshToken()
    }

    render() {
        return (
            <Router basename="/" hashType="slash" history={this.props.history}>
                <div id="home-app">
                    <Popup />
                    <NavBar
                        icon="/static/images/bootstrap-solid.svg"
                        title="Bootstrap">
                        <NavItems>
                            <NavLink to="/"
                                exact
                                className="nav-item nav-link"
                                activeClassName="active"
                                replace>Index</NavLink>
                            {!this.props.isLoggedIn && (
                                <NavLink to="/login"
                                    className="nav-item nav-link"
                                    activeClassName="active"
                                    replace>Login</NavLink>
                            )}
                            {!this.props.isLoggedIn && (
                                <NavLink to="/register"
                                    className="nav-item nav-link"
                                    activeClassName="active"
                                    replace>Register</NavLink>
                            )}
                        </NavItems>
                        <form className="form-inline my-2 my-lg-0">
                            <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                        </form>
                    </NavBar>
                    <Route exact path="/" render={() => (
                        <div>
                            Home
                        </div>
                    )} />
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                </div>
            </Router>
        )
    }
}

export default connect((state, props) => ({
    isLoggedIn: state.app.isLoggedIn
}), dispatch => ({
    refreshToken: () => {
        axios.post('/user/api/refresh_token')
            .then(response => {
                let data = response.data
                if (data.success) {
                    dispatch({
                        type: 'REFRESH_TOKEN',
                        auth_key: data.auth_key
                    })
                } else {
                    dispatch({ type: 'LOGOUT' })
                }
            })
    }
}))(HomeApp)