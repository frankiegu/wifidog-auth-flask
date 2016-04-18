#!/usr/bin/env python

import os
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

from app import create_app, constants
from app.models import db, Voucher
from tests.test_case import TestCase


class TestSite(TestCase):
    def test_home_redirects_to_login(self):
        response = self.client.get('/')
        self.assertEquals(302, response.status_code)
        self.assertEquals('http://localhost/login?next=%2F', response.headers['Location'])

    def test_login(self):
        response = self.client.get('/login')
        self.assertEquals(200, response.status_code)

        html = self.get_html(response)
        self.assert_title(html, 'Login')

        response = self.login('main-gateway1@example.com', 'admin')

        self.assertEquals(302, response.status_code)
        self.assertEquals('http://localhost/', response.headers['Location'])

    def test_voucher_new_as_gateway(self):
        self.login('main-gateway1@example.com', 'admin')

        response = self.client.get('/vouchers/new', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        html = self.get_html(response)
        options = html.findall('//select[@id="gateway"]/option')

        self.assertEquals(1, len(options))
        self.assertEquals('main-gateway1', options[0].get('value'))

    def test_voucher_new_as_network(self):
        self.login('main-network@example.com', 'admin')

        response = self.client.get('/vouchers/new', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        html = self.get_html(response)
        options = html.findall('//select[@id="gateway"]//option')

        self.assertEquals(2, len(options))

        self.assertEquals('main-gateway1', options[0].get('value'))
        self.assertEquals('main-gateway2', options[1].get('value'))

    def test_voucher_new_as_super(self):
        self.login('super-admin@example.com', 'admin')

        response = self.client.get('/vouchers/new', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        html = self.get_html(response)
        options = html.findall('//select[@id="gateway"]//option')

        self.assertEquals(4, len(options))

        self.assertEquals('main-gateway1', options[0].get('value'))
        self.assertEquals('main-gateway2', options[1].get('value'))
        self.assertEquals('other-gateway1', options[2].get('value'))
        self.assertEquals('other-gateway2', options[3].get('value'))

if __name__ == '__main__':
    unittest.main()
