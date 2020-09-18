from importlib import import_module

blueprints = [
    (import_module("application.blueprints.home").blueprint, '/home')
]

default_route = '/home/index'