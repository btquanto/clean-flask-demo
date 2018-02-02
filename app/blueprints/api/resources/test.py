from flask import request, current_app as app

from core.response import json_response
from app import db, jwtm

@jwtm.jwt_required
def get():
    user = jwtm.user
    return json_response({
        "success" : True,
        "user": {
            "fullname": user.fullname,
            "username": user.username,
            "email": user.email,
            "auth_key": user.auth_key
        }
    })