import json
import os
import tempfile
import unittest
from lxml import etree
from StringIO import StringIO

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

from app import create_app, constants
from app.models import db, Voucher

with open(BASE_DIR + '/data/tests.db', 'r') as tests_db:
    CONTENT = tests_db.read()

class TestCase(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestCase, self).__init__(*args, **kwargs)

    def setUp(self):
        self.file_descriptor, self.filename = tempfile.mkstemp()
        os.write(self.file_descriptor, CONTENT)

        config = {
            'DEBUG': False,
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///' + self.filename,
            'WTF_CSRF_ENABLED': False,
        }

        self.app = create_app(config)

        db.init_app(self.app)

        with self.app.app_context():
            db.create_all()

        self.client = self.app.test_client()

    def tearDown(self):
        self.logout()

        os.close(self.file_descriptor)
        os.unlink(self.filename)

    def get_html(self, response):
        parser = etree.HTMLParser()
        return etree.parse(StringIO(response.get_data()), parser)

    def assert_title(self, html, title):
        self.assertRegexpMatches(html.find('//title').text, r'^%s -' % title)

    def login(self, email, password, follow_redirects=False):
        return self.client.post('/login',
                                data=dict(email=email, password=password),
                                follow_redirects=follow_redirects)

    def logout(self):
        return self.client.get('/logout', follow_redirects=True)
