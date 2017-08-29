# -*- coding: utf-8 -*-
from . import db
from ..core.access import RoleMixin as RbacRoleMixin

roles_parents = db.Table(
    'roles_parents',
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id')),
    db.Column('parent_id', db.Integer, db.ForeignKey('roles.id'))
)

class Role(db.Model, RbacRoleMixin):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20))

    parents = db.relationship(
        'Role',
        secondary=roles_parents,
        primaryjoin=(id == roles_parents.c.role_id),
        secondaryjoin=(id == roles_parents.c.parent_id),
        backref=db.backref('children', lazy='dynamic')
    )

    def __init__(self, name):
        RbacRoleMixin.__init__(self)
        self.name = name

    def add_parent(self, parent):
        # You don't need to add this role to parent's children set,
        # relationship between roles would do this work automatically
        self.parents.append(parent)

    def add_parents(self, *parents):
        for parent in parents:
            self.add_parent(parent)

    @staticmethod
    def get_by_name(cls, name):
        return cls.query.filter_by(name=name).first()

    @staticmethod
    def get_parent_roles(cls):
        return cls.query.filter_by(~cls.id._in(db.session.query(roles_parents.id).all()))

