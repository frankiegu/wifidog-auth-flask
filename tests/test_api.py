#!/usr/bin/env python

import json
import os
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

from app import constants
from app.models import db, Voucher
from tests.test_case import TestCase


class TestApi(TestCase):
    def test_networks_index_as_gateway(self):
        self.login('main-gateway1@example.com', 'admin')

        response = self.client.get('/api/networks')
        self.assertEquals(200, response.status_code)

        networks = json.loads(response.data)
        self.assertEquals(1, len(networks))

        self.assertEquals('main-network', networks[0]['id'])

    def test_networks_index_as_network(self):
        self.login('main-network@example.com', 'admin')

        response = self.client.get('/api/networks')
        self.assertEquals(200, response.status_code)

        networks = json.loads(response.data)
        self.assertEquals(1, len(networks))

        self.assertEquals('main-network', networks[0]['id'])

    def test_networks_index_as_super(self):
        self.login('super-admin@example.com', 'admin')

        response = self.client.get('/api/networks')
        self.assertEquals(200, response.status_code)

        networks = json.loads(response.data)
        self.assertEquals(2, len(networks))

        self.assertEquals('main-network', networks[0]['id'])
        self.assertEquals('other-network', networks[1]['id'])

    def test_gateways_index_as_gateway(self):
        self.login('main-gateway1@example.com', 'admin')

        response = self.client.get('/api/gateways', follow_redirects=True)
        self.assertEquals(200, response.status_code)

        gateways = json.loads(response.data)
        self.assertEquals(1, len(gateways))

        self.assertEquals('main-gateway1', gateways[0]['id'])

    def test_gateways_index_as_network(self):
        self.login('main-network@example.com', 'admin')

        response = self.client.get('/api/gateways')
        self.assertEquals(200, response.status_code)

        gateways = json.loads(response.data)
        self.assertEquals(2, len(gateways))

        self.assertEquals('main-gateway1', gateways[0]['id'])
        self.assertEquals('main-gateway2', gateways[1]['id'])

    def test_gateways_index_as_super(self):
        self.login('super-admin@example.com', 'admin')

        response = self.client.get('/api/gateways')
        self.assertEquals(200, response.status_code)

        gateways = json.loads(response.data)
        self.assertEquals(4, len(gateways))

        self.assertEquals('main-gateway1', gateways[0]['id'])
        self.assertEquals('main-gateway2', gateways[1]['id'])
        self.assertEquals('other-gateway1', gateways[2]['id'])
        self.assertEquals('other-gateway2', gateways[3]['id'])

    def test_users_index_as_gateway(self):
        self.login('main-gateway1@example.com', 'admin')

        response = self.client.get('/api/users')
        self.assertEquals(200, response.status_code)

        users = json.loads(response.data)
        self.assertEquals(2, len(users))

        self.assertEquals('main-gateway1@example.com', users[0]['email'])
        self.assertEquals('user@example.com', users[1]['email'])

    def test_users_index_as_network(self):
        self.login('main-network@example.com', 'admin')

        response = self.client.get('/api/users?sort={"email":false}')
        self.assertEquals(200, response.status_code)

        users = json.loads(response.data)
        self.assertEquals(4, len(users))

        self.assertEquals('main-gateway1@example.com', users[0]['email'])
        self.assertEquals('main-gateway2@example.com', users[1]['email'])
        self.assertEquals('main-network@example.com', users[2]['email'])
        self.assertEquals('user@example.com', users[3]['email'])

    def test_users_index_as_super(self):
        self.login('super-admin@example.com', 'admin')

        response = self.client.get('/api/users')
        self.assertEquals(200, response.status_code)

        users = json.loads(response.data)
        self.assertEquals(7, len(users))

    def test_vouchers_index_as_gateway(self):
        self.login('main-gateway1@example.com', 'admin')

        response = self.client.get('/api/vouchers')
        self.assertEquals(200, response.status_code)

        vouchers = json.loads(response.data)
        self.assertEquals(2, len(vouchers))

        self.assertEquals('main-1-2', vouchers[0]['code'])
        self.assertEquals('main-1-1', vouchers[1]['code'])

    def test_vouchers_index_as_network(self):
        self.login('main-network@example.com', 'admin')

        response = self.client.get('/api/vouchers?sort={"code":false}')
        self.assertEquals(200, response.status_code)

        vouchers = json.loads(response.data)
        self.assertEquals(4, len(vouchers))

if __name__ == '__main__':
    unittest.main()
