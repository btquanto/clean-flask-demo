# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, jsonify, request, current_app as app, redirect
from jinja2 import TemplateNotFound
from app import socketio
from flask_socketio import join_room, leave_room, emit, close_room

node = Blueprint("rtc", __name__, template_folder="templates")

SOCKET_NAMESPACE='/webrtc'
users = {}
rooms = {}

@node.route("/")
def index():
    return render_template("rtc/index.html")

@node.route("/hello")
def hello():
    return "Hello World"

@socketio.on('connect', namespace=SOCKET_NAMESPACE)
def socketio_handle_connect():
    user_id = request.sid
    user = users.get(user_id, {})
    user['id'] = user_id
    users[user_id] = user

@socketio.on('join_room', namespace=SOCKET_NAMESPACE)
def socketio_handle_join_room(data):
    user_id = request.sid
    room_id = data['room_id']
    user = users[user_id]

    room = rooms.get(room_id, {
        'id': room_id,
        'users' : []
    })
    room['users'].append({
        'id': request.sid,
        'username': data['username']
    })
    rooms[room_id] = room
    user['room'] = room
    user['username'] = data['username']

    join_room(room_id)

    emit('room_joined', {
        'room' : room,
        'user' : user
    })

    emit('user_online', {
        'user' : user,
        'users': room['users']
    }, room=room_id, include_self=False)

@socketio.on('message', namespace=SOCKET_NAMESPACE)
def socketio_handle_message(message):
    user_id = request.sid
    user = users[user_id]
    emit("message", {
        'message' : message,
        'user'  : user
    }, broadcast=True)

@socketio.on('webrtc message', namespace=SOCKET_NAMESPACE)
def socketio_handle_webrtc_message(message):
    emit("webrtc message", {
            'type'  : message['type'],
            'from'  : users[request.sid],
            'extras': message.get('extras', {})
        }, room=message['target'])


@socketio.on('disconnect', namespace=SOCKET_NAMESPACE)
def socketio_handle_disconnect():
    user_id = request.sid
    user = users[user_id]

    room = user.get('room', None)

    if room is not None:
        room_users = room['users']
        room_users = list(filter(lambda user: user['id'] is not user_id, room_users))
        room['users'] = room_users

        emit("user_offline", {
            'user': {
                'id' : user['id'],
                'username'  : user['username']
            },
            'users': room_users
        }, room=room['id'], broadcast=True)

        if len(room_users) == 0:
            close_room(room['id'])
            del rooms[room['id']]

    del users[user_id]



