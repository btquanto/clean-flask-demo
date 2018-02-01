import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

function appReducer(state = {
    isLoggedIn: false,
}, action) {
    switch (action.type) {
        case '':
            return Object.assign({}, state, {
            })
        default:
            return state
    }
}

export default combineReducers({
    app: appReducer,
    routing: routerReducer
})