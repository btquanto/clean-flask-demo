# -*- coding: utf-8 -*-
from flask import Flask
from flask_script import Manager, prompt_bool
from flask_migrate import Migrate, MigrateCommand

# from .models import *
from core import db
from .application import app

migrate = Migrate(app, db)
manager = script_manager = Manager(app)
manager.add_command('db', MigrateCommand)