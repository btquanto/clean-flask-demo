import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

function appReducer(state = {
    isLoggedIn: false,
    user: null
}, action) {
    switch (action.type) {
        case 'UPDATE_AUTH_STATUS':
            return Object.assign({}, state, {
                isLoggedIn: action.user != null,
                user: action.user
            })
        case 'LOGOUT':
            return Object.assign({}, state, {
                isLoggedIn: false,
                user: null
            })
        default:
            return state
    }
}

export default combineReducers({
    app: appReducer,
    routing: routerReducer
})