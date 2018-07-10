import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import createHistory from "history/createHashHistory"
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'

import reducers from './admin.Reducers'
import AdminApp from './admin.App'

const hashHistory = createHistory()
const middleware = routerMiddleware(hashHistory)
const store = createStore(reducers, applyMiddleware(middleware))

ReactDOM.render(
    <Provider store={store}>
        <AdminApp
            title="Admin"
            history={hashHistory} />
    </Provider>,
    document.getElementById('root')
)