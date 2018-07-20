# -*- coding: utf-8 -*-
import secrets
from datetime import datetime, timedelta
from flask import current_app as app
from flask_login import UserMixin as LoginUserMixin
from app import db

class User(db.Model, LoginUserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(255))
    username = db.Column(db.String(255))
    email = db.Column(db.String(255))
    password = db.Column(db.String(255))

    def as_dict(self):
        return {
            "id": self.id,
            "fullname": self.fullname,
            "username": self.username,
            "email": self.email
        }
