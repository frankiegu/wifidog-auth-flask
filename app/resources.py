import errno
import flask
import logging
import os

from app.models import Network, User, Gateway, Voucher, Category, Product, Currency, db
from flask.ext.login import current_user, login_required
from flask.ext.potion import Api, fields, signals
from flask.ext.potion.backends import Pagination
from flask.ext.potion.routes import Relation, Route, ItemRoute
from flask.ext.potion.contrib.principals import PrincipalResource, PrincipalManager
from flask.ext.security import current_user
from flask.ext.uploads import UploadSet, IMAGES
from PIL import Image
from sqlalchemy.orm.collections import InstrumentedList


logger = logging.getLogger(__name__)

super_admin_only = 'super-admin'
network_or_above = ['super-admin', 'network-admin']
gateway_or_above = ['super-admin', 'network-admin', 'gateway-admin']

api = Api(prefix='/api')
logos = UploadSet('logos', IMAGES)

def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise

class Manager(PrincipalManager):
    def instances(self, where=None, sort=None):
        query = super(Manager, self).instances(where, sort)
        return self.filter_query(query, self.resource)

    def relation_instances(self, item, attribute, target_resource, page=None, per_page=None):
        query = getattr(item, attribute)
        query = self.filter_query(query, target_resource)

        if isinstance(query, InstrumentedList):
            if page and per_page:
                return Pagination.from_list(query, page, per_page)
            return query

        if page and per_page:
            return query.paginate(page=page, per_page=per_page)

        return query.all()

    def filter_query(self, query, resource):
        if current_user.has_role('network-admin') or current_user.has_role('gateway-admin'):
            if resource == NetworkResource:
                query = query.filter_by(id=current_user.network_id)
            elif resource in (GatewayResource, UserResource):
                query = query.filter_by(network_id=current_user.network_id)

        if current_user.has_role('network-admin'):
            if resource == VoucherResource:
                query = query.join(Voucher.gateway).join(Gateway.network).filter(Network.id == current_user.network_id)

        if current_user.has_role('gateway-admin'):
            if resource == GatewayResource:
                query = query.filter_by(id=current_user.gateway_id)
            elif resource in (UserResource, VoucherResource):
                query = query.filter_by(gateway_id=current_user.gateway_id)

        return query


class VoucherManager(Manager):
    def instances(self, where=None, sort=None):
        sort = (('status', False), ('created_at', True))
        query = super(VoucherManager, self).instances(where, sort)
        query = query.filter(Voucher.status != 'archived')
        return query

    def extend(self, voucher):
        voucher.extend()
        db.session.commit()

    def block(self, voucher):
        voucher.block()
        db.session.commit()

    def unblock(self, voucher):
        voucher.unblock()
        db.session.commit()

    def archive(self, voucher):
        voucher.archive()
        db.session.commit()

class UserResource(PrincipalResource):
    class Meta:
        manager = Manager

        model = User
        include_id = True
        permissions = {
            'read': gateway_or_above,
            'create': gateway_or_above,
            'update': gateway_or_above,
            'delete': gateway_or_above,
        }
        read_only_fields = ('created_at', 'updated_at')
        write_only_fields = ('password',)

    class Schema:
        network = fields.ToOne('networks')
        gateway = fields.ToOne('gateways')

        email = fields.Email()
        password = fields.String(min_length=6, max_length=20)

    @Route.GET
    def current(self):
        if current_user.is_authenticated:
            return {
                'id': current_user.id,
                'email': current_user.email,
                'roles': [ r.name for r in current_user.roles ],
                'network': current_user.network_id,
                'gateway': current_user.gateway_id,
            }
        else:
            return {
                'id': None,
                'email': None,
                'roles': [],
                'network': None,
                'gateway': None
            }

class GatewayResource(PrincipalResource):
    users = Relation('users')
    vouchers = Relation('vouchers')

    class Meta:
        manager = Manager

        model = Gateway
        include_id = True
        id_converter = 'string'
        id_field_class = fields.String
        permissions = {
            'read': 'yes',
            'create': network_or_above,
            'update': network_or_above,
            'delete': network_or_above,
        }
        read_only_fields = ('created_at', 'updated_at')

    class Schema:
        id = fields.String(min_length=3, max_length=20)
        network = fields.ToOne('networks')
        title = fields.String(min_length=3)
        login_ask_name = fields.Boolean(default=False)

    @ItemRoute.POST
    def logo(self, gateway):
        if 'file' in flask.request.files:
            filename = logos.save(flask.request.files['file'])

            self.manager.update(gateway, {
                'logo': filename
            })

            im = Image.open(logos.path(filename))

            static_folder = os.path.abspath(os.path.dirname(__file__) + '/static/logos')
            mkdir_p(static_folder)

            im.thumbnail((300, 300), Image.ANTIALIAS)
            im.save(static_folder + '/' + filename)

class NetworkResource(PrincipalResource):
    gateways = Relation('gateways')
    users = Relation('users')

    class Meta:
        manager = Manager

        model = Network
        include_id = True
        id_converter = 'string'
        id_field_class = fields.String
        permissions = {
            'read': gateway_or_above,
            'create': super_admin_only,
            'update': super_admin_only,
            'delete': super_admin_only,
        }
        read_only_fields = ('created_at', 'updated_at')

    class Schema:
        id = fields.String(min_length=3, max_length=20)
        title = fields.String(min_length=3)

class VoucherResource(PrincipalResource):
    class Meta:
        manager = VoucherManager

        model = Voucher
        include_id = True
        id_converter = 'string'
        id_field_class = fields.String
        permissions = {
            'read': gateway_or_above,
            'create': gateway_or_above,
            'update': gateway_or_above,
            'delete': 'no',
        }
        read_only_fields = ('created_at', 'updated_at', 'available_actions', 'time_left')

    class Schema:
        network = fields.ToOne('networks')
        gateway = fields.ToOne('gateways')
        available_actions = fields.String()
        time_left = fields.Integer()

    @ItemRoute.POST
    def extend(self, voucher):
        self.manager.extend(voucher)

    @ItemRoute.POST
    def block(self, voucher):
        self.manager.block(voucher)

    @ItemRoute.POST
    def unblock(self, voucher):
        self.manager.unblock(voucher)

    @ItemRoute.POST
    def archive(self, voucher):
        self.manager.archive(voucher)

class CategoryResource(PrincipalResource):
    class Meta:
        manager = Manager

        model = Category
        include_id = True
        id_converter = 'string'
        id_field_class = fields.String
        permissions = {
            'read': gateway_or_above,
            'create': gateway_or_above,
            'update': gateway_or_above,
            'delete': 'no',
        }
        read_only_fields = ('created_at', 'updated_at')

    class Schema:
        network = fields.ToOne('networks')
        gateway = fields.ToOne('gateways')

class ProductResource(PrincipalResource):
    class Meta:
        manager = Manager

        model = Product
        include_id = True
        id_converter = 'string'
        id_field_class = fields.String
        permissions = {
            'read': gateway_or_above,
            'create': gateway_or_above,
            'update': gateway_or_above,
            'delete': 'no',
        }
        read_only_fields = ('created_at', 'updated_at')

    class Schema:
        network = fields.ToOne('networks')
        gateway = fields.ToOne('gateways')
        currency = fields.ToOne('currencies')

class CurrencyResource(PrincipalResource):
    class Meta:
        manager = Manager

        model = Currency
        include_id = True
        id_converter = 'string'
        id_field_class = fields.String
        permissions = {
            'read': gateway_or_above,
            'create': super_admin_only,
            'update': super_admin_only,
            'delete': super_admin_only,
        }

    class Schema:
        id = fields.String(min_length=3, max_length=3)

@signals.before_create.connect_via(GatewayResource)
@signals.before_create.connect_via(UserResource)
@signals.before_create.connect_via(VoucherResource)
@signals.before_create.connect_via(CategoryResource)
@signals.before_create.connect_via(ProductResource)
def set_scope(sender, item):
    if current_user.has_role('network-admin') or current_user.has_role('gateway-admin'):
        item.network_id = current_user.network_id

    if current_user.has_role('gateway-admin'):
        item.gateway_id = current_user.gateway_id

api.add_resource(UserResource)
api.add_resource(VoucherResource)
api.add_resource(GatewayResource)
api.add_resource(NetworkResource)
api.add_resource(CategoryResource)
api.add_resource(ProductResource)
api.add_resource(CurrencyResource)
