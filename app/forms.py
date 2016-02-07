from app.models import Network, Currency, Gateway, Voucher, db
from app.utils import args_get
from flask import current_app
from flask.ext.wtf import Form
from wtforms import HiddenField, StringField, \
        IntegerField, SelectField, validators
from wtforms.ext.sqlalchemy.orm import model_form


def default_minutes():
    return current_app.config.get('VOUCHER_DEFAULT_MINUTES')


class NewVoucherForm(Form):
    gateway_id = SelectField('Gateway')
    minutes = IntegerField('Minutes',
                           [
                               validators.InputRequired(),
                               validators.NumberRange(min=0),
                           ],
                           default=default_minutes)


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


def init_forms():
    global NetworkForm, GatewayForm, CurrencyForm, VoucherForm

    NetworkForm = model_form(Network,
                             db.session,
                             field_args={
                                 'id': {'label': 'ID'},
                             },
                             exclude_pk=False)
    NetworkForm.original_id = HiddenField()

    GatewayForm = model_form(Gateway,
                             db.session,
                             field_args={
                                 'id': {'label': 'ID'},
                             },
                             exclude_pk=False)
    GatewayForm.original_id = HiddenField()

    CurrencyForm = model_form(Currency,
                              db.session,
                              field_args={
                                  'id': {'label': 'ID'},
                              },
                              exclude_pk=False)
    CurrencyForm.original_id = HiddenField()

    VoucherForm = model_form(Voucher,
                             db.session,
                             field_args={
                                 'id': {'label': 'ID'},
                             },
                             exclude=['code', 'created_at', 'updated_at', 'status'])
    VoucherForm.original_id = HiddenField()
