import { combineReducers } from 'redux';

function appReducer(state = {
    user: {
        username: null,
        isLoggedIn: false,
        id: null
    }
}, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: Object.assign({}, state.user, {
                    username: action.username,
                    isLoggedIn: action.isLoggedIn
                })
            };
        default:
            return state;
    }
}

function loginReducer(state = {
    user: {
        username: Math.random().toString(36).substring(7),
        isLoggedIn: false,
        id: null
    },
    room_id: "mdpwgh"
}, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: {
                    username: action.username,
                    id: null,
                    isLoggedIn: action.isLoggedIn
                },
                room_id: action.room_id
            };
        default:
            return state;
    }
}

function chatRoomReducer(state = {
    localUser: {
        id: null
    },
    remoteUser: {
        username: null,
        stream: null
    },
    room: {
        id: null,
        users: [],
        messages: []
    }
}, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                localUser: Object.assign({}, state.localUser, {
                    username: action.username,
                    isLoggedIn: action.isLoggedIn
                }),
                room: Object.assign({}, state.room, {
                    id: action.room_id,
                })
            };
        case 'ADD_LOCAL_STREAM':
            return {
                ...state,
                localUser: Object.assign({}, state.localUser, {
                    stream: action.stream
                })
            };
        case 'ADD_REMOTE_USER':
            return {
                ...state,
                remoteUser: Object.assign({}, state.remoteUser, {
                    username: action.user.username
                })
            };
        case 'ADD_REMOTE_STREAM':
            return {
                ...state,
                remoteUser: Object.assign({}, state.remoteUser, {
                    stream: action.stream
                })
            };
        case 'REMOVE_REMOTE_STREAM':
            return {
                ...state,
                localUser: Object.assign({}, state.localUser, {
                    stream: null
                })
            };
        case 'JOIN_ROOM':
            return {
                ...state,
                localUser: Object.assign({}, state.localUser, {
                    id: action.user.id
                }),
                room: Object.assign({}, state.room, {
                    id: action.room.id,
                    users: action.room.users
                })
            };
        case 'UPDATE_WHEN_USER_GOES_ONLINE':
            return {
                ...state,
                room: Object.assign({}, state.room, {
                    users: action.users,
                    messages: action.user.id == state.localUser.id ? state.room.messages : [...state.room.messages, {
                        type: 'online_notification',
                        message: `${action.user.username} has gone offline`
                    }]
                })
            };
        case 'UPDATE_WHEN_USER_GOES_OFFLINE':
            return {
                ...state,
                room: Object.assign({}, state.room, {
                    users: action.users,
                    messages: [...state.room.messages, {
                        type: 'offline_notification',
                        message: `${action.user.username} has gone offline`
                    }]
                })
            };
        default:
            return state;
    }
}

function chatBoxReducer(state = {
    user: {
        username: null,
        isLoggedIn: false,
        id: null
    },
    messages: []
}, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: Object.assign({}, state.user, {
                    username: action.username,
                    isLoggedIn: action.isLoggedIn
                })
            };
        case 'JOIN_ROOM':
            return {
                ...state,
                user: Object.assign({}, state.user, {
                    id: action.user.id
                })
            };
        case 'RECEIVE_MESSAGE':
            return {
                ...state,
                messages: [
                    ...state.messages,
                    {
                        type: 'message',
                        message: action.message,
                        user: action.user,
                        is_self: action.user.id == state.user.id
                    }
                ]
            }
        default:
            return state;
    }
}

export default combineReducers({
    app: appReducer,
    login: loginReducer,
    chatRoom: chatRoomReducer,
    chatBox: chatBoxReducer
});