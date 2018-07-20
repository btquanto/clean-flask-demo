import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import {authen} from './components/authen/authenReducer';
import {LOGOUT, UPDATE_AUTH_STATUS, UPDATE_USER} from "./components/authen/actions";

function appReducer(state = {
    isLoggedIn: localStorage.getItem("isLoggedIn") ? localStorage.getItem("isLoggedIn") : false,
    user: null
}, action) {
    switch (action.type) {
        case UPDATE_AUTH_STATUS:
            localStorage.setItem("isLoggedIn", action.isAuthen)
            console.log(`Update: ${action.isAuthen}`)
            return {
                ...state,
                isLoggedIn: action.isAuthen,
                user: action.user,
            }
        case LOGOUT:
            localStorage.setItem("isLoggedIn", false)
            return {
                ...state,
                isLoggedIn: false,
                user: null
            }
        default:
            return state
    }
}

export default combineReducers({
    app: appReducer,
    // authen: authen
})