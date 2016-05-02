#!/usr/bin/env python

import os
import unittest

from pyquery import PyQuery

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

from app import constants
from app.models import db, Voucher
from tests.test_case import TestCase


class TestWifidog(TestCase):
    def test_login_404(self):
        response = self.client.get('/wifidog/login/?gw_address=blah')
        self.assertEquals(404, response.status_code)

    def test_login_get(self):
        response = self.client.get('/wifidog/login/?gw_address=192.168.0.1&gw_port=8080&gw_id=main-gateway1&mac=00:00:00:00:00:00&url=http%3A%2F%2Fexample.com')
        self.assertEquals(200, response.status_code)

        doc = PyQuery(response.data)

        self.assertEquals('192.168.0.1', doc('[name=gw_address]').val())
        self.assertEquals('8080', doc('[name=gw_port]').val())
        self.assertEquals('main-gateway1', doc('[name=gateway_id]').val())
        self.assertEquals('00:00:00:00:00:00', doc('[name=mac]').val())
        self.assertEquals('http://example.com', doc('[name=url]').val())

    def wifidog_login(self, voucher_code):
        response = self.client.post('/wifidog/login/', data={
            'gw_address': '192.168.0.1',
            'gw_port': '8080',
            'gateway_id': 'main-gateway1',
            'mac': '00:00:00:00:00:00',
            'url': 'http://example.com',
            'voucher_code': voucher_code,
            'name': 'Name',
        })
        return response

    def test_login_post(self):
        response = self.wifidog_login('main-1-1')

        with self.app.app_context():
            voucher = Voucher.query.filter_by(code='main-1-1').first()

        self.assertEquals('192.168.0.1', voucher.gw_address)
        self.assertEquals('8080', voucher.gw_port)
        self.assertEquals('main-gateway1', voucher.gateway_id)
        self.assertEquals('00:00:00:00:00:00', voucher.mac)
        self.assertEquals('http://example.com', voucher.url)

        self.assertEquals(302, response.status_code)
        self.assertEquals('http://192.168.0.1:8080/wifidog/auth/?token=%s' % voucher.token,
                          response.headers['Location'])

    def test_login_nonexistent_voucher(self):
        response = self.wifidog_login('hackattack')
        doc = PyQuery(response.data)
        self.assertIn('Voucher does not exist', doc('.error').text())

    def test_login_voucher_not_new(self):
        (response, voucher) = self.wifidog_auth(stage='login',
                                                ip='192.168.0.2',
                                                mac='00:00:00:00:00:00',
                                                incoming=0,
                                                outgoing=0)
        response = self.wifidog_login('main-1-1')
        doc = PyQuery(response.data)
        self.assertIn('Voucher is active', doc('.error').text())

    def wifidog_auth(self, status=None, **args):
        response = self.wifidog_login('main-1-1')

        url = response.headers['Location'].replace('http://192.168.0.1:8080', '')

        voucher = None

        if status is not None:
            with self.app.app_context():
                voucher = Voucher.query.filter_by(code='main-1-1').first()
                voucher.status = status

                db.session.add(voucher)
                db.session.commit()

        for key, value in args.iteritems():
            url = url + '&%s=%s' % (key, value)

        response = self.client.get(url)

        with self.app.app_context():
            voucher = Voucher.query.filter_by(code='main-1-1').first()
            return (response, voucher)

    def test_auth_with_login(self):
        (response, voucher) = self.wifidog_auth(stage='login',
                                                ip='192.168.0.2',
                                                mac='00:00:00:00:00:00',
                                                incoming=0,
                                                outgoing=0)

        self.assertEquals('Auth: %d\nMessages: None\n' % constants.AUTH_ALLOWED, response.data)
        self.assertIsNotNone(voucher.started_at)
        self.assertEquals('active', voucher.status)

    def test_auth_with_ended(self):
        (response, voucher) = self.wifidog_auth(status='ended',
                                                stage='login',
                                                ip='192.168.0.2',
                                                mac='00:00:00:00:00:00',
                                                incoming=0,
                                                outgoing=0)

        self.assertEquals('Auth: %d\nMessages: Requested token is the wrong status: %s\n' %
                          (constants.AUTH_DENIED, voucher.token), response.data)

    def test_auth_with_expired(self):
        (response, voucher) = self.wifidog_auth(status='expired',
                                                stage='login',
                                                ip='192.168.0.2',
                                                mac='00:00:00:00:00:00',
                                                incoming=0,
                                                outgoing=0)

        self.assertEquals('Auth: %d\nMessages: Requested token is the wrong status: %s\n' %
                          (constants.AUTH_DENIED, voucher.token), response.data)

    def test_ping(self):
        response = self.client.get('/wifidog/ping/?gw_id=main-gateway1&sys_uptime=0&sys_memfree=0&sys_load=1&wifidog_uptime=0')
        self.assertEquals(200, response.status_code)
        self.assertEquals('Pong', response.data)

    def test_portal(self):
        response = self.client.get('/wifidog/portal/?gw_id=main-gateway1')
        self.assertEquals(200, response.status_code)

if __name__ == '__main__':
    unittest.main()
