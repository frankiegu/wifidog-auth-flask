import flask

from app.constants import ROLES
from app.forms import LoginVoucherForm, NewVoucherForm, NetworkForm
from app.models import Auth, Gateway, Network, Ping, Voucher, \
        generate_token, db
from app.payu import get_transaction, set_transaction, capture
from app.resources import VoucherResource, NetworkResource
from app.services import influx_db
from app.signals import voucher_logged_in
from app.utils import has_role, has_a_role

from flask.ext.menu import register_menu
from flask.ext.potion.instances import Condition, COMPARATORS
from flask.ext.security import login_required, roles_required, \
        roles_accepted, current_user

bp = flask.Blueprint('app', __name__)


@bp.route('/networks', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
@register_menu(bp,
               '.networks',
               'Networks',
               visible_when=has_role('super-admin'),
               order=10,
               category='Networks')
def networks_index():
    if flask.request.method == 'GET':
        networks = NetworkResource.manager.instances()
        return flask.render_template('networks/index.html', networks=networks)
    else:
        action = flask.request.form.get('action')
        ids = flask.request.form.getlist('ids')

        if action == 'delete':
            for id in ids:
                NetworkResource.manager.delete_by_id(id)
            flask.flash('Networks deleted', 'success')
        elif action == 'edit':
            return flask.redirect(flask.url_for('.networks_bulk_edit', ids=ids))

        return flask.redirect(flask.url_for('.networks_index'))


@bp.route('/networks/delete')
@login_required
@roles_required('super-admin')
def networks_delete():
    networks = []
    return flask.render_template('networks/delete.html', networks=networks)


@bp.route('/networks/new', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
def networks_new():
    network = Network()
    form = NetworkForm(flask.request.form, network)

    if flask.request.method == 'POST' and form.validate():
        NetworkResource.manager.create(form.data)
        flask.flash('Network created', 'success')
        return flask.redirect(flask.url_for('.networks_index'))

    return flask.render_template('networks/edit.html',
                                 title='New Network',
                                 form=form,
                                 network=network)

@bp.route('/networks/bulk-edit', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
def networks_bulk_edit():
    ids = flask.request.args.getlist('ids')
    where = [Condition('id', COMPARATORS['$in'], ids)]

    networks = NetworkResource.manager.instances(where=where)

    forms = []
    for network in networks:
        network.original_id = network.id
        forms.append(NetworkForm(flask.request.form, network, 'network:%s:' % network.id))

    if flask.request.method == 'POST':
        something_invalid = False

        for form in forms:
            if not form.validate():
                something_invalid = True

        if not something_invalid:
            for form in forms:
                network = NetworkResource.manager.read(form.data['original_id'])
                NetworkResource.manager.update(network, form.data)

            flask.flash('Networks updated', 'success')
            return flask.redirect(flask.url_for('.networks_index'))

    return flask.render_template('networks/bulk_edit.html',
                                 title='Bulk Edit Networks',
                                forms=forms,
                                networks=networks)

@bp.route('/networks/<network_id>', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
def networks_edit(network_id):
    network = NetworkResource.manager.read(network_id)
    form = NetworkForm(flask.request.form, network)

    if flask.request.method == 'POST' and form.validate():
        NetworkResource.manager.update(network, form.data)
        flask.flash('Network updated', 'success')
        return flask.redirect(flask.url_for('.networks_index'))

    return flask.render_template('networks/edit.html',
                                 title='Edit Network',
                                 form=form,
                                 network=network)


@bp.route('/gateways')
@login_required
@roles_accepted('super-admin', 'network-admin')
@register_menu(bp,
               '.gateways',
               'Gateways',
               visible_when=has_a_role('super-admin', 'network-admin'),
               order=20,
               category='Gateways')
def gateways_index():
    return flask.render_template('gateways/index.html')


@bp.route('/users')
@login_required
@roles_accepted('super-admin', 'network-admin')
@register_menu(bp,
               '.users',
               'Users',
               visible_when=has_a_role('super-admin', 'network-admin'),
               order=40,
               category='Security')
def users_index():
    return flask.render_template('users/index.html')


@bp.route('/vouchers')
@login_required
@roles_accepted('super-admin', 'network-admin', 'gateway-admin')
@register_menu(bp,
               '.vouchers',
               'Vouchers',
               visible_when=has_a_role('super-admin',
                                       'network-admin',
                                       'gateway-admin'),
               order=5,
               category='Vouchers')
def vouchers_index():
    vouchers = VoucherResource.manager.instances().all()
    status_icons = {
        'new': 'file',
        'active': 'bolt',
        'ended': 'flag',
        'expired': 'circle-x',
        'archived': 'trash',
        'blocked': 'thumb-down'
    }
    return flask.render_template('vouchers/index.html',
                                 vouchers=vouchers,
                                 status_icons=status_icons)


@bp.route('/categories')
@login_required
@roles_accepted('super-admin', 'network-admin', 'gateway-admin')
@register_menu(bp,
               '.categories',
               'Categories',
               visible_when=has_a_role('super-admin',
                                       'network-admin',
                                       'gateway-admin'),
               order=99,
               category='Sales')
def categories_index():
    return flask.render_template('categories/index.html')


@bp.route('/products')
@login_required
@roles_accepted('super-admin', 'network-admin', 'gateway-admin')
@register_menu(bp,
               '.products',
               'Products',
               visible_when=has_a_role('super-admin',
                                       'network-admin',
                                       'gateway-admin'),
               order=99,
               category='Sales')
def products_index():
    return flask.render_template('products/index.html')


@bp.route('/currencies')
@login_required
@roles_accepted('super-admin')
@register_menu(bp,
               '.currencies',
               'Currencies',
               visible_when=has_a_role('super-admin'),
               order=99,
               category='Sales')
def currencies_index():
    return flask.render_template('currencies/index.html')


@bp.route('/new-voucher', methods=['GET', 'POST'])
@login_required
@roles_accepted('super-admin', 'network-admin', 'gateway-admin')
@register_menu(bp,
               '.new',
               'New Voucher',
               visible_when=has_a_role('super-admin',
                                       'network-admin',
                                       'gateway-admin'),
               order=0,
               category='Vouchers')
def vouchers_new():
    form = NewVoucherForm(flask.request.form)

    choices = []

    if current_user.has_role('gateway-admin'):
        gateway = current_user.gateway
        choices = [
            [
                current_user.gateway_id,
                '%s - %s' % (gateway.network.title, gateway.title)
            ]
        ]
    else:
        if current_user.has_role('network-admin'):
            networks = (Network.query
                               .filter_by(id=current_user.network_id).all())
        else:
            networks = Network.query.all()

        for network in networks:
            for gateway in network.gateways:
                choices.append([
                    gateway.id,
                    '%s - %s' % (network.title, gateway.title)
                ])

    form.gateway_id.choices = choices

    if form.validate_on_submit():
        voucher = Voucher()
        form.populate_obj(voucher)

        if current_user.has_role('gateway-admin'):
            voucher.gateway_id = current_user.gateway_id

        db.session.add(voucher)
        db.session.commit()

        return flask.redirect(flask.url_for('.vouchers_new',
                                            code=voucher.code))

    return flask.render_template('vouchers/new.html', form=form)


@bp.route('/wifidog/login/', methods=['GET', 'POST'])
def wifidog_login():
    form = LoginVoucherForm(flask.request.form)

    if form.validate_on_submit():
        voucher_code = form.voucher_code.data.upper()
        voucher = Voucher.query.filter_by(code=voucher_code).first_or_404()

        form.populate_obj(voucher)
        voucher.token = generate_token()
        db.session.commit()

        voucher_logged_in.send(flask.current_app._get_current_object(),
                               voucher=voucher)

        # flask.flash('Logged in, continue to <a href="%s">%s</a>' %
        #             (form.url.data, form.url.data), 'success')

        url = 'http://%s:%s/wifidog/auth?token=%s' % (voucher.gw_address,
                                                      voucher.gw_port,
                                                      voucher.token)

        return flask.redirect(url)

    if flask.request.method == 'GET':
        gateway_id = flask.request.args.get('gw_id')
    else:
        gateway_id = form.gateway_id.data

    if gateway_id is None:
        flask.abort(404)

    gateway = Gateway.query.filter_by(id=gateway_id).first_or_404()
    return flask.render_template('wifidog/login.html',
                                 form=form,
                                 gateway=gateway)


@bp.route('/wifidog/ping/')
def wifidog_ping():
    ping = Ping(
        user_agent=flask.request.user_agent.string,
        gateway_id=flask.request.args.get('gw_id'),
        sys_uptime=flask.request.args.get('sys_uptime'),
        sys_memfree=flask.request.args.get('sys_memfree'),
        sys_load=flask.request.args.get('sys_load'),
        wifidog_uptime=flask.request.args.get('wifidog_uptime')
    )
    db.session.add(ping)
    db.session.commit()

    def generate_point(measurement):
        return {
            "measurement": measurement,
            "tags": {
                "source": "ping",
                "network_id": ping.gateway.network_id,
                "gateway_id": ping.gateway_id,
                "user_agent": ping.user_agent,
            },
            "time": ping.created_at,
            "fields": {
                "value": getattr(ping, measurement),
            }
        }

    points = [generate_point(m) for m in [
        'sys_uptime',
        'sys_memfree',
        'sys_load',
        'wifidog_uptime'
    ]]
    influx_db.connection.write_points(points)

    return ('Pong', 200)


@bp.route('/wifidog/auth/')
def wifidog_auth():
    auth = Auth(
        user_agent=flask.request.user_agent.string,
        stage=flask.request.args.get('stage'),
        ip=flask.request.args.get('ip'),
        mac=flask.request.args.get('mac'),
        token=flask.request.args.get('token'),
        incoming=flask.request.args.get('incoming'),
        outgoing=flask.request.args.get('outgoing'),
        gateway_id=flask.request.args.get('gw_id')
    )

    (auth.status, auth.messages) = auth.process_request()

    db.session.add(auth)
    db.session.commit()

    def generate_point(measurement):
        return {
            "measurement": 'auth_%s' % measurement,
            "tags": {
                "source": "auth",
                "network_id": auth.gateway.network_id,
                "gateway_id": auth.gateway_id,
                "user_agent": auth.user_agent,
                "stage": auth.stage,
                "ip": auth.ip,
                "mac": auth.mac,
                "token": auth.token,
            },
            "time": auth.created_at,
            "fields": {
                "value": getattr(auth, measurement),
            }
        }

    points = [generate_point(m) for m in ['incoming', 'outgoing']]
    influx_db.connection.write_points(points)

    return ("Auth: %s\nMessages: %s\n" % (auth.status, auth.messages), 200)


@bp.route('/wifidog/portal/')
def wifidog_portal():
    voucher_token = flask.session.get('voucher_token')
    if voucher_token:
        voucher = Voucher.query.filter_by(token=voucher_token).first_or_404()
    else:
        voucher = None
    gateway = (Gateway.query
                      .filter_by(id=flask.request.args.get('gw_id'))
                      .first_or_404())
    return flask.render_template('wifidog/portal.html',
                                 gateway=gateway,
                                 voucher=voucher)


@bp.route('/pay')
def pay():
    return_url = flask.url_for('.pay_return', _external=True)
    cancel_url = flask.url_for('.pay_cancel', _external=True)
    response = set_transaction('ZAR',
                               1000,
                               'Something',
                               return_url, cancel_url)
    return flask.redirect('%s?PayUReference=%s' %
                          (capture, response.payUReference))


@bp.route('/pay/return')
def pay_return():
    response = get_transaction(flask.request.args.get('PayUReference'))
    basketAmount = '{:.2f}'.format(int(response.basket.amountInCents) / 100)
    category = 'success' if response.successful else 'error'
    flask.flash(response.displayMessage, category)
    return flask.render_template('payu/transaction.html',
                                 response=response,
                                 basketAmount=basketAmount)


@bp.route('/pay/cancel')
def pay_cancel():
    response = get_transaction(flask.request.args.get('payUReference'))
    basketAmount = '{:.2f}'.format(int(response.basket.amountInCents) / 100)
    flask.flash(response.displayMessage, 'warning')
    return flask.render_template('payu/transaction.html',
                                 response=response,
                                 basketAmount=basketAmount)


@bp.route('/')
@login_required
def home():
    template = 'user'
    for role in ROLES.keys():
        if current_user.has_role(role):
            template = role
            break

    return flask.render_template('homes/%s.html' % template)


@bp.route('/config')
def config():
    return flask.current_app.config['SQLALCHEMY_DATABASE_URI']


@bp.route('/debug')
def debug():
    return flask.session
