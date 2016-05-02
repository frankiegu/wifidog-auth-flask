import datetime
import inflect
import jinja2

from app.forms import LoginVoucherForm
from app.models import Auth, Gateway, Ping, Voucher, generate_token, db
from app.payu import get_transaction, set_transaction, capture
from app.resources import GatewayResource, NetworkResource, VoucherResource, UserResource
from app.ext import influx_db
from app.signals import voucher_logged_in
from app.utils import has_a_role

from flask import request, current_app, redirect, render_template, url_for, Blueprint
from flask import flash, session, abort

from flask_potion.instances import Condition, COMPARATORS
from flask_security import login_required

from sqlalchemy import func

p = inflect.engine()
bp = Blueprint('app', __name__)


@jinja2.contextfilter
@bp.app_template_filter()
def kb(context, value):
    return value / 1024


@bp.route('/wifidog/login/', methods=['GET', 'POST'])
def wifidog_login():
    form = LoginVoucherForm(request.form)

    if form.validate_on_submit():
        voucher = Voucher.query.filter(func.upper(Voucher.code) == func.upper(form.voucher_code.data)).first_or_404()

        form.populate_obj(voucher)
        voucher.token = generate_token()
        db.session.commit()

        voucher_logged_in.send(current_app._get_current_object(),
                               voucher=voucher)

        # flash('Logged in, continue to <a href="%s">%s</a>' %
        #             (form.url.data, form.url.data), 'success')

        url = 'http://%s:%s/wifidog/auth/?token=%s' % (voucher.gw_address,
                                                       voucher.gw_port,
                                                       voucher.token)

        return redirect(url)

    if request.method == 'GET':
        gateway_id = request.args.get('gw_id')
    else:
        gateway_id = form.gateway_id.data

    if gateway_id is None:
        abort(404)

    gateway = Gateway.query.filter_by(id=gateway_id).first_or_404()

    return render_template('wifidog/login.html',
                                 form=form,
                                 gateway=gateway)


@bp.route('/wifidog/ping/')
def wifidog_ping():
    ping = Ping(
        user_agent=request.user_agent.string,
        gateway_id=request.args.get('gw_id'),
        sys_uptime=request.args.get('sys_uptime'),
        sys_memfree=request.args.get('sys_memfree'),
        sys_load=request.args.get('sys_load'),
        wifidog_uptime=request.args.get('wifidog_uptime')
    )
    db.session.add(ping)
    db.session.commit()

    fields = dict((attr, getattr(ping, attr)) for attr in ['sys_uptime', 'sys_memfree', 'sys_load', 'wifidog_uptime'])

    points = [
        {
            "measurement": "ping",
            "tags": {
                "network_id": ping.gateway.network_id,
                "gateway_id": ping.gateway_id,
                "user_agent": ping.user_agent,
            },
            "time": ping.created_at,
            "fields": fields
        }
    ]

    try:
        influx_db.connection.write_points(points)
    except:
        pass

    return ('Pong', 200)


@bp.route('/wifidog/auth/')
def wifidog_auth():
    token = request.args.get('token')
    voucher = Voucher.query.filter_by(token=token).first_or_404()

    auth = Auth(
        user_agent=request.user_agent.string,
        stage=request.args.get('stage'),
        ip=request.args.get('ip'),
        mac=request.args.get('mac'),
        token=token,
        incoming=request.args.get('incoming'),
        outgoing=request.args.get('outgoing'),
    )

    (auth.status, auth.messages) = auth.process_request()

    db.session.add(auth)
    db.session.commit()

    points = [
        {
            "measurement": "auth",
            "tags": {
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
                "incoming": auth.incoming,
                "outgoing": auth.outgoing,
                "both": None if auth.incoming is None or auth.outgoing is None else auth.incoming + auth.outgoing
            }
        }
    ]

    try:
        influx_db.connection.write_points(points)
    except:
        pass

    return ("Auth: %s\nMessages: %s\n" % (auth.status, auth.messages), 200)


def _show_gateway(gw_id):
    voucher_token = session.get('voucher_token')
    if voucher_token:
        voucher = Voucher.query.filter_by(token=voucher_token).first()
    else:
        voucher = None

    # voucher = Voucher.query.first()
    # voucher.started_at = datetime.datetime.now()

    gateway = Gateway.query.filter_by(id=gw_id).first_or_404()

    return render_template('wifidog/portal.html',
                                 gateway=gateway,
                                 voucher=voucher)


@bp.route('/wifidog/portal/')
def wifidog_portal():
    return _show_gateway(request.args.get('gw_id'))


@bp.route('/pay')
def pay():
    return_url = url_for('.pay_return', _external=True)
    cancel_url = url_for('.pay_cancel', _external=True)
    response = set_transaction('ZAR',
                               1000,
                               'Something',
                               return_url, cancel_url)
    return redirect('%s?PayUReference=%s' %
                          (capture, response.payUReference))


@bp.route('/pay/return')
def pay_return():
    response = get_transaction(request.args.get('PayUReference'))
    basketAmount = '{:.2f}'.format(int(response.basket.amountInCents) / 100)
    category = 'success' if response.successful else 'error'
    flash(response.displayMessage, category)
    return render_template('payu/transaction.html',
                                 response=response,
                                 basketAmount=basketAmount)


@bp.route('/pay/cancel')
def pay_cancel():
    response = get_transaction(request.args.get('payUReference'))
    basketAmount = '{:.2f}'.format(int(response.basket.amountInCents) / 100)
    flash(response.displayMessage, 'warning')
    return render_template('payu/transaction.html',
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
            'id': 'vouchers',
            'title': 'Active Vouchers',
            'value': count,
            'label': 'Active %s' % p.plural('Voucher', count),
        })

        count = UserResource.manager.instances().count()
        metrics.append({
            'id': 'users',
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
            'id': 'gateways',
            'title': 'Gateways',
            'value': count,
            'label': p.plural('Gateway', count),
        })

    if has_a_role('super-admin'):
        count = NetworkResource.manager.instances().count()
        metrics.append({
            'id': 'networks',
            'title': 'Networks',
            'value': count,
            'label': p.plural('Network', count),
        })

    return render_template(template, metrics=metrics)
