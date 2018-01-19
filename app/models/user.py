# -*- coding: utf-8 -*-
import secrets
from datetime import datetime, timedelta
from flask import current_app as app
from flask_login import UserMixin as LoginUserMixin
from core.access import UserMixin as RbacUserMixin
from app import db, rbac

users_roles = db.Table(
    'users_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'))
)

class User(db.Model, LoginUserMixin, RbacUserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(255))
    username = db.Column(db.String(255))
    email = db.Column(db.String(255))
    password = db.Column(db.String(255))
    auth_key = db.Column(db.String(255))
    session_expiry = db.Column(db.DateTime, nullable=True)

    # Other columns
    roles = db.relationship(
        'Role',
        secondary=users_roles,
        backref=db.backref('users', lazy='dynamic')
    )

    def add_role(self, role):
        self.roles.append(role)

    def add_roles(self, roles):
        for role in roles:
            self.add_role(role)

    def get_roles(self):
        for role in self.roles:
            yield role

    def gen_auth_key(self):
        self.auth_key = secrets.token_hex(32)
        self.session_expiry = datetime.now() + timedelta(hours=1) # Set expiration 1 hour from now
        return self.auth_key

    def is_token_expired(self):
        if self.auth_key and self.session_expiry:
            return datetime.now() > self.session_expiry
        return True

    def refresh_token(self):
        if not self.is_token_expired():
            self.session_expiry = datetime.now() + timedelta(hours=1) # Set expiration 1 hour from now
            return self.auth_key
        return None


