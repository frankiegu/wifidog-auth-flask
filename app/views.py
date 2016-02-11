import flask
import inflect
import jinja2

from app.forms import LoginVoucherForm, NewVoucherForm
from app.models import Auth, Gateway, Network, Ping, Voucher, \
        generate_token, db
from app.payu import get_transaction, set_transaction, capture
from app.resources import GatewayResource, NetworkResource, VoucherResource, UserResource
from app.ext import influx_db
from app.signals import voucher_logged_in
from app.utils import has_a_role

from flask.ext.menu import register_menu
from flask.ext.potion.instances import Condition, COMPARATORS
from flask.ext.security import login_required, roles_accepted, current_user

p = inflect.engine()
bp = flask.Blueprint('app', __name__)


@jinja2.contextfilter
@bp.app_template_filter()
def bytes(context, value):
    return value / 1024


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


def _show_gateway(gw_id):
    voucher_token = flask.session.get('voucher_token')
    if voucher_token:
        voucher = Voucher.query.filter_by(token=voucher_token).first_or_404()
    else:
        voucher = None

    gateway = Gateway.query.filter_by(id=gw_id).first_or_404()

    return flask.render_template('wifidog/portal.html',
                                 gateway=gateway,
                                 voucher=voucher)


@bp.route('/gateways/<gw_id>')
def gateways_show(gw_id):
    return _show_gateway(gw_id)


@bp.route('/wifidog/portal/')
def wifidog_portal():
    return _show_gateway(flask.request.args.get('gw_id'))


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
    metrics = []

    if has_a_role('super-admin', 'network-admin', 'gateway-admin'):
        where = [Condition('status', COMPARATORS['$eq'], 'active')]
        active_count = VoucherResource.manager.instances(where=where).count()
        all_count = VoucherResource.manager.instances().count()
        count = '%s / %s' % (active_count, all_count)
        metrics.append({
            'title': 'Active Vouchers',
            'value': count,
            'label': 'Active %s' % p.plural('Voucher', count),
        })

        count = UserResource.manager.instances().count()
        metrics.append({
            'title': 'User Accounts',
            'value': count,
            'label': p.plural('User', count),
        })

        template = 'home/admin.html'
    else:
        template = 'home/user.html'

    if has_a_role('super-admin', 'network-admin'):
        count = GatewayResource.manager.instances().count()
        metrics.append({
            'title': 'Gateways',
            'value': count,
            'label': p.plural('Gateway', count),
        })

    if has_a_role('super-admin'):
        count = NetworkResource.manager.instances().count()
        metrics.append({
            'title': 'Networks',
            'value': count,
            'label': p.plural('Network', count),
        })

    return flask.render_template(template, metrics=metrics)


@bp.route('/config')
def config():
    return flask.current_app.config['SQLALCHEMY_DATABASE_URI']


@bp.route('/debug')
def debug():
    return flask.session
