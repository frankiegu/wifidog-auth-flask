import datetime
import flask
import uuid

from app.admin import VoucherAdmin
from app.models import User, Role, db, users
from app.resources import api, GatewayResource, NetworkResource, UserResource, VoucherResource, logos
from flask.ext.assets import Environment, Bundle
from flask.ext.dotenv import DotEnv
from flask.ext.login import current_user, LoginManager
from flask.ext.uploads import configure_uploads
from flask.ext.potion.contrib.principals.needs import HybridRelationshipNeed
from flask.ext.principal import Identity, UserNeed, AnonymousIdentity, identity_loaded, RoleNeed, Principal
from flask.ext.security import Security

def create_app():
    app = flask.Flask(__name__)

    env = DotEnv()
    env.init_app(app)

    app.config.from_object('config')

    init_db(app)

    api.init_app(app)

    security = Security()
    security.init_app(app, users)

    principals = Principal()
    principals.init_app(app)

    assets = Environment()
    assets.init_app(app)

    js = Bundle('../assets/bower_components/es5-shim/es5-shim.js',
                '../assets/bower_components/html5shiv/dist/html5shiv.js',
                filters='rjsmin', output='scripts/ie.js')
    assets.register('ie_scripts', js)

    js = Bundle('../assets/bower_components/zepto/dist/zepto.js',
                '../assets/bower_components/riot/riot.js',
                '../assets/bower_components/riotcontrol/riotcontrol.js',
                '../assets/bower_components/marked/lib/marked.js',
                '../assets/scripts/notifications.js',
                '../assets/scripts/stores.js',
                '../assets/scripts/ui.js',
                '../assets/mixins/crud.js',
                '../assets/mixins/currentuser.js',
                '../assets/mixins/events.js',
                '../assets/mixins/networks.js',
                '../assets/mixins/render.js',
                filters='rjsmin', output='scripts/site.js')
    assets.register('site_scripts', js)

    configure_uploads(app, logos)

    from app.views import menu, bp

    from app.signals import init_signals
    init_signals(app)

    menu.init_app(app)
    app.register_blueprint(bp)

    if False:
        login_manager = LoginManager(app)

        @login_manager.request_loader
        def load_user_from_request(request):
            if request.authorization:
                email, password = request.authorization.username, request.authorization.password
                user = User.query.filter_by(email=unicode(email)).first()

                if user is not None:
                    if verify_password(password, user.password):
                        return user

    @identity_loaded.connect_via(app)
    def on_identity_loaded(sender, identity):
        if not isinstance(identity, AnonymousIdentity):
            identity.provides.add(UserNeed(identity.id))

            for role in current_user.roles:
                identity.provides.add(RoleNeed(role.name))

    @principals.identity_loader
    def read_identity_from_flask_login():
        if current_user.is_authenticated():
            return Identity(current_user.id)
        return AnonymousIdentity()

    @app.after_request
    def somefunc(response):
        if 'cid' not in flask.request.cookies:
            cid = str(uuid.uuid4())
            expires = datetime.datetime.now() + datetime.timedelta(days=365*2)
            response.set_cookie('cid', cid, expires=expires)
        return response

    return app

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
