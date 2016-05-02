#!/usr/bin/env python

import os
import unittest

from pyquery import PyQuery

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

from app import create_app, constants
from app.models import db, Voucher
from tests.test_case import TestCase


class TestAuth(TestCase):
    def test_home_redirects_to_login(self):
        response = self.client.get('/')
        self.assertEquals(302, response.status_code)
        self.assertEquals('http://localhost/login?next=%2F', response.headers['Location'])

    def test_login_redirects_to_next(self):
        response = self.client.get('/vouchers')
        self.assertEquals(302, response.status_code)
        self.assertEquals('http://localhost/login?next=%2Fvouchers', response.headers['Location'])

    def test_login(self):
        response = self.client.get('/login')
        self.assertEquals(200, response.status_code)

        html = self.get_html(response)
        self.assert_title(html, 'Login')

        response = self.login('main-gateway1@example.com', 'admin')

        self.assertEquals(302, response.status_code)
        self.assertEquals('http://localhost/', response.headers['Location'])

    def test_logout(self):
        self.login('main-gateway1@example.com', 'admin')

        response = self.client.get('/logout')

        self.assertEquals(302, response.status_code)
        self.assertEquals('http://localhost/login', response.headers['Location'])

    def test_home_as_super_admin(self):
        response = self.login('super-admin@example.com', 'admin', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        doc = PyQuery(response.data)

        self.assertEquals(4, len(doc('.flakes-key-metrics > *')))

        self.assertEquals('0 / 8 Active Vouchers', doc('.metric-vouchers').text())
        self.assertEquals('7 Users', doc('.metric-users').text())
        self.assertEquals('4 Gateways', doc('.metric-gateways').text())
        self.assertEquals('2 Networks', doc('.metric-networks').text())

    def test_home_as_network_admin(self):
        response = self.login('main-network@example.com', 'admin', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        doc = PyQuery(response.data)

        self.assertEquals(3, len(doc('.flakes-key-metrics > *')))

        self.assertEquals('0 / 4 Active Vouchers', doc('.metric-vouchers').text())
        self.assertEquals('4 Users', doc('.metric-users').text())
        self.assertEquals('2 Gateways', doc('.metric-gateways').text())

    def test_home_as_gateway_admin(self):
        response = self.login('main-gateway1@example.com', 'admin', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        doc = PyQuery(response.data)

        self.assertEquals(2, len(doc('.flakes-key-metrics > *')))

        self.assertEquals('0 / 2 Active Vouchers', doc('.metric-vouchers').text())
        self.assertEquals('2 Users', doc('.metric-users').text())

    def test_home_as_user(self):
        response = self.login('user@example.com', 'password', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        self.assertNotIn('flakes-key-metrics', response.data)

if __name__ == '__main__':
    unittest.main()
