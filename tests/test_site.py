#!/usr/bin/env python

import os
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

from app import create_app, constants
from app.models import db, Voucher
from tests.test_case import TestCase


class TestSite(TestCase):
    pass

if __name__ == '__main__':
    unittest.main()
