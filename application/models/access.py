# -*- coding: utf-8 -*-
from application import db

class Access(db.Model, LoginUserMixin, RbacUserMixin):
    __tablename__ = 'access'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), nullable=False)
    expiry_date = db.Column(db.DateTime, nullable=False)