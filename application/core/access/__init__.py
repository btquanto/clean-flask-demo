# -*- coding: utf-8 -*-
from .rbac import RBAC, RoleMixin, UserMixin
def load_user(user_id):
    from models import User
    return User.get(user_id)
