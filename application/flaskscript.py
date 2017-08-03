# -*- coding: utf-8 -*-
from flask import Flask
from flask_script import Manager, prompt_bool
from flask_migrate import Migrate, MigrateCommand
from flask_alchemydumps import AlchemyDumps, AlchemyDumpsCommand

from .models import *
from .core import db
from .application import app

migrate = Migrate(app, db)
alchemy_dumps = AlchemyDumps(app, db)

manager = script_manager = Manager(app)

manager.add_command('db', MigrateCommand)
manager.add_command('alchemy', AlchemyDumpsCommand)

