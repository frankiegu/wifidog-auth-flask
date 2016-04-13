from flask import url_for

MENU_CATEGORY_ORDER = (
        'Vouchers',
        'Sales',
        'Gateways',
        'Networks',
        'System',
)

RESOURCES = {
    'networks': {
        'category': 'Networks',
        'title': 'Networks',
        'roles': (
            'super-admin',
        ),
        'columns': (
            { 'name': 'id', 'title': 'ID', 'link': True },
            { 'name': 'title', 'title': 'Title', 'link': True },
            { 'name': 'gateways',
              'title': 'Gateways',
              'format': lambda network: network.gateways.count(),
              'link': lambda network: url_for('resource.index', resource_name='gateways', network_id=network.id) },
            { 'name': 'created_at', 'title': 'Created', 'format': lambda network: network.created_at.strftime('%c') },
        ),
    },
    'gateways': {
        'category': 'Gateways',
        'title': 'Gateways',
        'roles': (
            'super-admin',
            'network-admin',
        ),
        'filters': {
        },
        'columns': (
            { 'name': 'id', 'title': 'ID', 'link': True },
            { 'name': 'title', 'title': 'Title', 'link': True },
            { 'name': 'created_at',
              'title': 'Created',
              'format': lambda gateway: gateway.created_at.strftime('%c') },
        ),
    },
    'currencies': {
        'category': 'System',
        'title': 'Currencies',
        'roles': (
            'super-admin',
        ),
        'columns': (
            { 'name': 'id', 'title': 'ID', 'link': True },
            { 'name': 'title', 'title': 'Title', 'link': True },
            { 'name': 'prefix', 'title': 'Prefix' },
            { 'name': 'suffix', 'title': 'Suffix' },
        ),
    },
    'users': {
        'category': 'System',
        'title': 'Currencies',
        'title': 'Users',
        'roles': (
            'super-admin',
            'network-admin',
        ),
        'columns': (
            { 'name': 'name', 'title': 'Name', 'link': True },
            { 'name': 'email', 'title': 'Email', 'link': True },
            { 'name': 'active', 'title': 'Active' },
        ),
    },
    'categories': {
        'category': 'Sales',
        'title': 'Currencies',
        'title': 'Categories',
        'roles': (
            'super-admin',
            'network-admin',
            'gateway-admin',
        ),
        'columns': (
            { 'name': 'id', 'title': 'ID', 'link': True },
            { 'name': 'title', 'title': 'Title', 'link': True },
            { 'name': 'description', 'title': 'Description' },
        ),
    },
    'products': {
        'category': 'Sales',
        'title': 'Products',
        'roles': (
            'super-admin',
            'network-admin',
            'gateway-admin',
        ),
        'columns': (
            { 'name': 'id', 'title': 'ID', 'link': True },
            { 'name': 'title', 'title': 'Title', 'link': True },
            { 'name': 'description', 'title': 'Description' },
            { 'name': 'price',
              'title': 'Price',
              'format': lambda product: product.currency.render(product.price) },
        ),
    },
    'vouchers': {
        'category': 'Vouchers',
        'title': 'Vouchers',
        'search': (
            'code',
            'name',
        ),
        'filter': (
            'gateway',
        ),
        'roles': (
            'super-admin',
            'network-admin',
            'gateway-admin',
        ),
        'columns': (
            { 'name': 'code', 'title': 'Code', 'link': True },
            { 'name': 'name',
              'title': 'Name',
              'link': True,
              'format': lambda voucher: voucher.name or '-' },
        ),
    },
}
