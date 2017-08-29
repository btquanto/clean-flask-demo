# -*- coding: utf-8 -*-
from flask_login import UserMixin as LoginUserMixin
from ..core.access import UserMixin as RbacUserMixin
from . import db, rbac

users_roles = db.Table(
    'users_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'))
)

class User(db.Model, LoginUserMixin, RbacUserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30))
    password = db.Column(db.String(255))

    # Other columns
    roles = db.relationship(
        'Role', 
        secondary=users_roles,
        backref=db.backref('users', lazy='dynamic')
    )
    auth_keys = db.relationship('AuthKey', backref='user', lazy=True)

    def add_role(self, role):
        self.roles.append(role)

    def add_roles(self, roles):
        for role in roles:
            self.add_role(role)

    def get_roles(self):
        for role in self.roles:
            yield role
