import inflect

from app import resources
from app.models import Network, Currency, Gateway, Voucher, Product, Category, User, db
from app.resources import GatewayResource, NetworkResource
from app.utils import args_get
from flask import current_app, request
from flask.ext.wtf import Form
from wtforms import compat, fields, HiddenField, StringField, \
        IntegerField, validators, widgets
from wtforms.ext.sqlalchemy.orm import model_form, ModelConverterBase, \
        QuerySelectField, QuerySelectMultipleField
from wtforms_components import SelectField

p = inflect.engine()

class ResourceSelectField(QuerySelectField):
    def __init__(self, *args, **kwargs):
        super(ResourceSelectField, self).__init__(*args, **kwargs)
        singular = kwargs['_name']
        resource_class = singular[0].upper() + singular[1:] + 'Resource'
        self.resource = getattr(resources, resource_class)

    def _get_object_list(self):
        if self._object_list is None:
            get_pk = self.get_pk
            self._object_list = list((compat.text_type(get_pk(obj)), obj) for obj in self.resource.manager.instances())
        return self._object_list


class GatewaySelectField(SelectField):
    def __init__(self, allow_blank=False, *args, **kwargs):
        networks = NetworkResource.manager.instances()
        super(GatewaySelectField, self).__init__(*args, **kwargs)
        self.choices =  [[n.title, [[g.id, g.title] for g in n.gateways]] for n in networks]
        if allow_blank:
            self.choices = [['All Networks', [['', 'All Gateways']]]] + self.choices

def converts(*args):
    def _inner(func):
        func._converter_for = frozenset(args)
        return func
    return _inner


class Converter(ModelConverterBase):
    def __init__(self, extra_converters=None, use_mro=True):
        super(Converter, self).__init__(extra_converters, use_mro=use_mro)

    @classmethod
    def _string_common(cls, column, field_args, **extra):
        if column.type.length:
            field_args['validators'].append(validators.Length(max=column.type.length))

    @converts('String', 'Unicode')
    def conv_String(self, field_args, **extra):
        if extra['column'].key == 'password':
            field_args['render_kw'] = { 'type': 'password' }
            field_args['validators'] = []
        self._string_common(field_args=field_args, **extra)
        return fields.TextField(**field_args)

    @converts('types.Text', 'UnicodeText', 'types.LargeBinary', 'types.Binary', 'sql.sqltypes.Text')
    def conv_Text(self, field_args, **extra):
        self._string_common(field_args=field_args, **extra)
        return fields.TextAreaField(**field_args)

    @converts('Boolean')
    def conv_Boolean(self, field_args, **extra):
        return fields.BooleanField(**field_args)

    @converts('Date')
    def conv_Date(self, field_args, **extra):
        return fields.DateField(**field_args)

    @converts('DateTime')
    def conv_DateTime(self, field_args, **extra):
        return fields.DateTimeField(**field_args)

    @converts('Enum')
    def conv_Enum(self, column, field_args, **extra):
        field_args['choices'] = [(e, e) for e in column.type.enums]
        return fields.SelectField(**field_args)

    @converts('Integer', 'SmallInteger')
    def handle_integer_types(self, column, field_args, **extra):
        unsigned = getattr(column.type, 'unsigned', False)
        if unsigned:
            field_args['validators'].append(validators.NumberRange(min=0))
        return fields.IntegerField(**field_args)

    @converts('Numeric', 'Float')
    def handle_decimal_types(self, column, field_args, **extra):
        places = getattr(column.type, 'scale', 2)
        if places is not None:
            field_args['places'] = places
        return fields.DecimalField(**field_args)

    @converts('databases.mysql.MSYear', 'dialects.mysql.base.YEAR')
    def conv_MSYear(self, field_args, **extra):
        field_args['validators'].append(validators.NumberRange(min=1901, max=2155))
        return fields.TextField(**field_args)

    @converts('databases.postgres.PGInet', 'dialects.postgresql.base.INET')
    def conv_PGInet(self, field_args, **extra):
        field_args.setdefault('label', 'IP Address')
        field_args['validators'].append(validators.IPAddress())
        return fields.TextField(**field_args)

    @converts('dialects.postgresql.base.MACADDR')
    def conv_PGMacaddr(self, field_args, **extra):
        field_args.setdefault('label', 'MAC Address')
        field_args['validators'].append(validators.MacAddress())
        return fields.TextField(**field_args)

    @converts('dialects.postgresql.base.UUID')
    def conv_PGUuid(self, field_args, **extra):
        field_args.setdefault('label', 'UUID')
        field_args['validators'].append(validators.UUID())
        return fields.TextField(**field_args)

    @converts('MANYTOONE')
    def conv_ManyToOne(self, field_args, **extra):
        return ResourceSelectField(**field_args)

    @converts('MANYTOMANY', 'ONETOMANY')
    def conv_ManyToMany(self, field_args, **extra):
        return QuerySelectMultipleField(**field_args)


def default_minutes():
    return current_app.config.get('VOUCHER_DEFAULT_MINUTES')


class BroadcastForm(Form):
    message = StringField('Message', [validators.InputRequired()])


class LoginVoucherForm(Form):
    voucher_code = StringField('* Voucher Code',
                               [validators.InputRequired()],
                               default=args_get('voucher'),
                               description='The voucher code given to you')
    name = StringField('Your Name',
                       description='Optional, so we know what to call you')

    gw_address = HiddenField('Gateway Address', default=args_get('gw_address'))
    gw_port = HiddenField('Gateway Port', default=args_get('gw_port'))
    gateway_id = HiddenField('Gateway ID', default=args_get('gw_id'))
    mac = HiddenField('MAC', default=args_get('mac'))
    url = HiddenField('URL', default=args_get('url'))

    def validate_voucher(form, field):
        voucher_code = field.data.upper()
        voucher = Voucher.query.filter_by(code=voucher_code).first()

        if voucher is None:
            raise validators.ValidationError('Voucher does not exist')

        if voucher.status != 'new':
            raise validators.ValidationError('Voucher is %s' % voucher.status)

NetworkForm = None
GatewayForm = None
CurrencyForm = None
VoucherForm = None
ProductForm = None
CategoryForm = None
UserForm = None

class VoucherIndex(Form):
    gateway_id = GatewaySelectField('Gateway', default=lambda: request.args.get('gateway_id'))
    action = StringField(widget=widgets.SubmitInput())

class ProductIndex(Form):
    gateway_id = GatewaySelectField('Gateway', default=lambda: request.args.get('gateway_id'))
    action = StringField(widget=widgets.SubmitInput())

class CategoryIndex(Form):
    gateway_id = GatewaySelectField('Gateway', default=lambda: request.args.get('gateway_id'))
    action = StringField(widget=widgets.SubmitInput())

def init_forms():
    global NetworkForm, GatewayForm, CurrencyForm, VoucherForm, ProductForm, CategoryForm, UserForm

    converter = Converter()

    NetworkForm = model_form(Network,
                             db.session,
                             field_args={
                                 'id': {'label': 'ID'},
                             },
                             converter=converter,
                             exclude_pk=False)
    NetworkForm.original_id = HiddenField()

    GatewayForm = model_form(Gateway,
                             db.session,
                             field_args={
                                 'id': {'label': 'ID'},
                             },
                             converter=converter,
                             exclude_pk=False)
    GatewayForm.original_id = HiddenField()

    CurrencyForm = model_form(Currency,
                              db.session,
                              field_args={
                                  'id': {'label': 'ID'},
                              },
                             converter=converter,
                              exclude_pk=False)
    CurrencyForm.original_id = HiddenField()

    VoucherForm = model_form(Voucher,
                             db.session,
                             field_args={
                                 'id': {'label': 'ID'},
                             },
                             converter=converter,
                             exclude=['code', 'created_at', 'updated_at', 'status'])
    # VoucherForm.gateway_id = GatewaySelectField(allow_blank=False)
    VoucherForm.original_id = HiddenField()

    ProductForm = model_form(Product,
                             db.session,
                             field_args={
                                 'id': {'label': 'ID'},
                             },
                             converter=converter,
                             exclude=['order_items'])
    # ProductForm.gateway = GatewaySelectField()
    ProductForm.original_id = HiddenField()

    CategoryForm = model_form(Category,
                              db.session,
                              field_args={
                                  'id': {'label': 'ID'},
                              },
                              exclude=['status', 'sub_categories'],
                              converter=converter)
    CategoryForm.original_id = HiddenField()

    UserForm = model_form(User,
                          db.session,
                          converter=converter)
