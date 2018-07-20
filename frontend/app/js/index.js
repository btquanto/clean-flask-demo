import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { logger } from 'redux-logger';
import reducers from './reducers'
import thunk from 'redux-thunk';
import Router from './Router';
const appHistory = createBrowserHistory();

const store = createStore(
    connectRouter(appHistory)(reducers),
    applyMiddleware(thunk, routerMiddleware(appHistory), logger)
);

render(
    <Provider store={store}>
        <Router />
    </Provider>,
    document.getElementById('root')
)