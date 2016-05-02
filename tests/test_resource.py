#!/usr/bin/env python

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.sys.path.insert(0, BASE_DIR)

import unittest

from pyquery import PyQuery
from test_case import TestCase


class TestResource(TestCase):
    pass

if __name__ == '__main__':
    unittest.main()
