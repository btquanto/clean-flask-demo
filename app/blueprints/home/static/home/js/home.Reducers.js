import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

function appReducer(state = {
    isLoggedIn: false,
    authKey: null
}, action) {
    switch (action.type) {
        case 'USER_REGISTERED':
            return Object.assign({}, state, {
            })
        case 'USER_LOGIN_SUCCESS':
            return Object.assign({}, state, {
                isLoggedIn: true,
                authKey: action.auth_key
            })
        case 'REFRESH_TOKEN':
            return Object.assign({}, state, {
                isLoggedIn: true,
                authKey: action.auth_key
            })
        case 'USER_LOGIN_FAILED':
            return Object.assign({}, state, {
                isLoggedIn: false
            })
        case 'LOGOUT':
            return Object.assign({}, state, {
                isLoggedIn: false
            })
        default:
            return state
    }
}

export default combineReducers({
    app: appReducer,
    routing: routerReducer
})