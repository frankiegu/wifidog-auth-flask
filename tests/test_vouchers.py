#!/usr/bin/env python

import os
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

from app import create_app, constants
from app.models import db, Voucher
from tests.test_case import TestCase


class TestVouchers(TestCase):
    def test_new_as_gateway(self):
        self.login('main-gateway1@example.com', 'admin')

        response = self.client.get('/vouchers/new', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        html = self.get_html(response)
        options = html.findall('//select[@id="gateway"]//option')

        self.assertEquals(1, len(options))
        self.assertEquals('main-gateway1', options[0].get('value'))

    def test_new_as_network(self):
        self.login('main-network@example.com', 'admin')

        response = self.client.get('/vouchers/new', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        html = self.get_html(response)
        options = html.findall('//select[@id="gateway"]//option')

        self.assertEquals(2, len(options))

        self.assertEquals('main-gateway1', options[0].get('value'))
        self.assertEquals('main-gateway2', options[1].get('value'))

    def test_new_as_super(self):
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
