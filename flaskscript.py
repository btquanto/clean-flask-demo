from application import app
from flask_script import Manager, prompt_bool
from flask_migrate import Migrate, MigrateCommand
from flask_alchemydumps import AlchemyDumps, AlchemyDumpsCommand

from initialization import app, db
from application.models import *

migrate = Migrate(app, db)
alchemy_dumps = AlchemyDumps(app, db)

script_manager = Manager(app)

script_manager.add_command('db', MigrateCommand)
script_manager.add_command('alchemy', AlchemyDumpsCommand)

@script_manager.option("-l", "--list", dest="topic", default="parents")
def rbac(topic):
    print("Topic:", topic)
    if topic == "parents":
        print(Role.get_parent_roles().all())

if __name__ == '__main__':
    script_manager.run()