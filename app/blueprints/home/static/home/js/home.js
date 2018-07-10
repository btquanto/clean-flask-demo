import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import createHistory from "history/createHashHistory"
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'

import reducers from './home.Reducers'
import HomeApp from './home.App'

const hashHistory = createHistory()
const middleware = routerMiddleware(hashHistory)
const store = createStore(reducers, applyMiddleware(middleware))

ReactDOM.render(
    <Provider store={store}>
        <HomeApp history={hashHistory} />
    </Provider>,
    document.getElementById('root')
)