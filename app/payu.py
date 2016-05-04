from flask import Blueprint, current_app

from suds.client import Client
from suds.plugin import MessagePlugin
from suds.wsse import *

bp = Blueprint('payu', __name__)

api = 'ONE_ZERO'
wsdl = 'https://staging.payu.co.za/service/PayUAPI?wsdl'
capture = 'https://staging.payu.co.za/rpp.do'

additional_information = {
    'merchantReference': '123456',
    'supportedPaymentMethods': 'CREDITCARD',
    'redirectChannel': 'responsive',
}

safekey = '{CE62CE80-0EFD-4035-87C1-8824C5C46E7F}'
username = '100032'
password = 'PypWWegU'

def init_app(app):
    client = Client(wsdl, plugins=[PayUPlugin()])
    security = Security()
    token = UsernameToken(username, password)
    security.tokens.append(token)
    client.set_options(wsse=security)

# Add the required attributes and namespaces for PayU to recognize the request
class PayUPlugin(MessagePlugin):
    def marshalled(self, context):
        username_token = context.envelope.childAtPath('Header/wsse:Security/wsse:UsernameToken')
        username_token.getChild('wsse:Password').set('Type', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText')

def set_transaction(currency_code, amount_in_cents, description, return_url, cancel_url):
    additional_information['returnUrl'] = return_url
    additional_information['cancelUrl'] = cancel_url
    response = client.service.setTransaction(
        Api=api,
        Safekey=safekey,
        TransactionType='PAYMENT',
        AdditionalInformation=additional_information,
        Basket=dict(
            amountInCents=amount_in_cents,
            currencyCode=currency_code,
            description=description,
        )
    )
    return response

def get_transaction(payUReference):
    response = client.service.getTransaction(
        Api=api,
        Safekey=safekey,
        AdditionalInformation={
            'payUReference': payUReference
        }
    )
    return response

@bp.route('/')
def pay():
    return_url = url_for('.pay_return', _external=True)
    cancel_url = url_for('.pay_cancel', _external=True)
    response = set_transaction('ZAR',
                               1000,
                               'Something',
                               return_url, cancel_url)
    return redirect('%s?PayUReference=%s' %
                          (capture, response.payUReference))


@bp.route('/return')
def pay_return():
    response = get_transaction(request.args.get('PayUReference'))
    basketAmount = '{:.2f}'.format(int(response.basket.amountInCents) / 100)
    category = 'success' if response.successful else 'error'
    flash(response.displayMessage, category)
    return render_template('payu/transaction.html',
                                 response=response,
                                 basketAmount=basketAmount)


@bp.route('/cancel')
def pay_cancel():
    response = get_transaction(request.args.get('payUReference'))
    basketAmount = '{:.2f}'.format(int(response.basket.amountInCents) / 100)
    flash(response.displayMessage, 'warning')
    return render_template('payu/transaction.html',
                                 response=response,
                                 basketAmount=basketAmount)
