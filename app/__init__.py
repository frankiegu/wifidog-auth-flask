import datetime
import flask
import json
import uuid

from app.context_processors import init_context_processors
from app.forms import init_forms
from app.models import db, users
from app.resource import resource_blueprint, init_resources
from app.resources import api, logos
from app.ext import influx_db, menu, principal, security
from app.signals import init_signals

from flask.ext import menu as menu_module
from flask.ext.login import current_user
from flask.ext.uploads import configure_uploads
from flask.ext.principal import Identity, UserNeed, AnonymousIdentity, \
        identity_loaded, RoleNeed


def create_app(config=None):
    app = flask.Flask(__name__)

    app.config.from_object('config')

    if config is not None:
        app.config.update(**config)

    db.init_app(app)
    init_forms()

    configure_uploads(app, logos)

    api.init_app(app)
    influx_db.init_app(app)
    menu.init_app(app)
    security.init_app(app, users)
    principal.init_app(app)

    init_signals(app)
    init_context_processors(app)

    def func(self):
        return flask.request.path == self.url

    menu_module.MenuEntryMixin._active_when = func


    app.register_blueprint(resource_blueprint)

    with app.app_context():
        init_resources()

    from app.views import bp
    app.register_blueprint(bp)

    from app.payu import bp
    app.register_blueprint(bp, url_prefix='/pay')

    @identity_loaded.connect_via(app)
    def on_identity_loaded(sender, identity):
        if not isinstance(identity, AnonymousIdentity):
            identity.provides.add(UserNeed(identity.id))

            for role in current_user.roles:
                identity.provides.add(RoleNeed(role.name))

    @principal.identity_loader
    def read_identity_from_flask_login():
        if current_user.is_authenticated:
            return Identity(current_user.id)
        return AnonymousIdentity()

    @app.after_request
    def set_cid_cookie(response):
        if 'cid' not in flask.request.cookies:
            cid = str(uuid.uuid4())
            expires = datetime.datetime.now() + datetime.timedelta(days=365*2)
            response.set_cookie('cid', cid, expires=expires)
        return response

    def json_filter(value):
        return json.dumps(value)

    app.jinja_env.filters['json'] = json_filter

    return app
