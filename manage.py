#!/usr/bin/env python
# encoding: utf-8

from app import create_app
from app.models import db
from app.ext import manager
from flask.ext.migrate import Migrate, MigrateCommand
    
from app import commands

if __name__ == '__main__':
    app = create_app()
    db.init_app(app)

    manager.app = app
    migrate = Migrate(app, db)

    manager.add_command('db', MigrateCommand)

    manager.run()
