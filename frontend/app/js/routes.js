import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { auth } from "./Api";
import { checkAuthStatus, logout, updateAuthStatus } from './components/authen/actions';
const appHistory = createBrowserHistory();

class Router extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {

    // run some initialization processes.
    const isAuthenticated = this.props.isAuthenticated;
    console.log('isAuthen', isAuthenticated);


    // unauthenticated:  show login/signup form
    if (isAuthenticated == false || isAuthenticated == 'false') {
      return (
        <ConnectedRouter history={appHistory}>
          <Switch>
            <Route exact path="/app/auth/login" component={Login} />
            <Route exact path="/app/auth/signup" component={SignUp} />
            <Route exact path="/app/auth/logout" component={Logout} />
            <Route path="/app/" component={RedirectToLogin} />
          </Switch>
        </ConnectedRouter>
      );
    }

    // Project Route
    return (
      <ConnectedRouter history={appHistory}>
        <div>
          <Header />
          <Switch>
            { /* redirect to home after login */}
            <Route path="/app/auth/login" component={RedirectToHome} />
            <Route path="/app/auth/signup" component={RedirectToHome} />
            <Route path="/app/auth/logout" component={Logout} />
            { /* Project content */}
            <Route exact path="/app/projects" component={Page2} />
            <Route path="/app/projects/detail" component={Page4} />
            <Route path="/app/projects/model" component={Page6} />
            <Route path="/app/projects/modelr" component={Page7} />
            <Route path="/app/projects/mockup" component={Page8} />
            <Route exact path="/app/" component={RedirectToHome} />
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </ConnectedRouter>
    )
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.app.isLoggedIn,
  user: state.app.user
})

const mapDispatchToProps = (dispatch) => ({
  init: () => dispatch(checkAuthStatus())
})

export default connect(mapStateToProps, mapDispatchToProps)(Router);
