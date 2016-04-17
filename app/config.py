from flask import url_for


def format_bytes(bytes):
    return bytes / 1024

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
            { 'name': 'created_at',
              'title': 'Created',
              'format': lambda network: network.created_at.strftime('%c') },
        ),
    },
    'gateways': {
        'category': 'Gateways',
        'title': 'Gateways',
        'roles': (
            'super-admin',
            'network-admin',
        ),
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
        'search': [
            'code',
            'title',
            'description',
        ],
        'filters': [
            'network',
            'gateway',
        ],
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
            { 'name': 'categories',
              'title': 'Categories',
              'format': lambda product: '<br />'.join([c.title for c in product.categories]) },
            { 'name': 'code', 'title': 'Code', 'link': True },
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
            { 'name': 'status',
              'title': 'Status',
              'format': lambda voucher: '<span class="oi" data-glyph="%s" title="%s" aria-hidden="true"></span' % (RESOURCES['vouchers']['states'][voucher.status]['icon'], voucher.status) },
            { 'name': 'times',
              'title': 'Times',
              'format': lambda voucher: '%s%s' % ('%s /' % voucher.time_left if voucher.time_left else '', voucher.minutes) },
            { 'name': 'traffic',
              'title': 'Traffic',
              'format': lambda voucher: '%s in; %s out; %s both' % (format_bytes(voucher.incoming),
                                                                    format_bytes(voucher.outgoing),
                                                                    format_bytes(voucher.incoming + voucher.outgoing)) },
        ),
        'states': {
            'new': {
                'icon': 'file',
                'actions': (
                    'archive',
                    'expire',
                    'extend',
                    'login',
                ),
            },
            'active': {
                'icon': 'bolt',
                'actions': (
                    'archive',
                    'block',
                    'end',
                    'extend',
                ),
            },
            'ended': {
                'icon': 'flag',
                'actions': (
                    'archive',
                ),
            },
            'expired': {
                'icon': 'circle-x',
                'actions': (
                    'archive',
                ),
            },
            'archived': {
                'icon': 'trash',
            },
            'blocked': {
                'icon': 'thumb-down',
                'actions': (
                    'archive',
                    'unblock',
                ),
            },
        },
        'actions': {
            'admin': (
                {
                    'name': 'extend',
                    'title': 'Extend',
                    'icon': 'timer'
                },
                {
                    'name': 'block',
                    'title': 'Block',
                    'icon': 'thumb-down',
                },
                {
                    'name': 'unblock',
                    'title': 'Unblock',
                    'icon': 'thumb-up',
                },
                {
                    'name': 'archive',
                    'title': 'Archive',
                    'icon': 'x',
                },
            ),
            'user': (
                {
                    'name': 'login',
                    'title': 'Login',
                    'icon': 'enter',
                },
            ),
            'system': (
                {
                    'name': 'expire',
                    'title': 'Expire',
                },
                {
                    'name': 'end',
                    'title': 'End',
                },
            ),
        },
    },
}
