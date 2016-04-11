import flask
import inflect

from app import forms, resources
from app.utils import has_a_role

from flask import Blueprint, current_app, request, redirect, url_for, flash, render_template

from flask.ext.menu import current_menu
from flask.ext.potion.instances import Condition, COMPARATORS
from flask.ext.security import login_required

from wtforms.meta import DefaultMeta


resource_blueprint = Blueprint('resource', __name__)
p = inflect.engine()

roles_by_resource = {
    'networks': ('super-admin',),
    'currencies': ('super-admin',),
    'gateways': ('super-admin', 'network-admin'),
    'users': ('super-admin', 'network-admin'),
    'categories': ('super-admin', 'network-admin', 'gateway-admin'),
    'products': ('super-admin', 'network-admin', 'gateway-admin'),
    'vouchers': ('super-admin', 'network-admin', 'gateway-admin'),
}

resource_name = '<any(networks, gateways, vouchers, users, categories, products, currencies):resource_name>'


def resource_by_name(name):
    singular = p.singular_noun(name)
    resource_class = singular[0].upper() + singular[1:] + 'Resource'
    return getattr(resources, resource_class)


def form_by_name(name):
    singular = p.singular_noun(name)
    form_class = singular[0].upper() + singular[1:] + 'Form'
    return getattr(forms, form_class)


def index_by_name(name):
    singular = p.singular_noun(name)
    form_class = singular[0].upper() + singular[1:] + 'Index'
    return getattr(forms, form_class)


@resource_blueprint.route('/%s' % resource_name, methods=['GET'])
@login_required
def index(resource_name):
    title = resource_name[0].upper() + resource_name[1:]
    resource = resource_by_name(resource_name)

    action = request.args.get('action')

    if action in ['delete', 'edit']:
        ids = request.args.getlist('ids')
        return redirect(url_for('.bulk_%s' % action,
                                            resource_name=resource_name,
                                            ids=ids))

    where = []
    for key, value in request.args.iteritems():
        if key in ['action', 'page', 'ids']:
            continue
        if value != '':
            where.append(Condition(key, COMPARATORS['$eq'], value))

    pagination = resource.manager.paginated_instances(int(request.args.get('page', 1)),
                                                      current_app.config['POTION_DEFAULT_PER_PAGE'],
                                                      where=where)

    return render_template('%s/index.html' % resource_name,
                                 resource_name=resource_name,
                                 pagination=pagination)


@resource_blueprint.route('/%s/<id>/edit' % resource_name,
                          methods=['GET', 'POST'])
@login_required
def edit(resource_name, id):
    singular = p.singular_noun(resource_name)
    title = singular[0].upper() + singular[1:]
    resource = resource_by_name(resource_name)

    if (request.method == 'POST' and
            request.form.get('action') == 'delete'):
        instance = resource.manager.read(id)
        resource.manager.delete(instance)
        flash('%s %s deleted' % (title, instance), 'success')
        return redirect(url_for('.index',
                                            resource_name=resource_name))

    instance = resource.manager.read(id)
    form = form_by_name(resource_name)(request.form, instance)

    if request.method == 'POST':
        if form.validate():
            resource.manager.update(instance, form.data)
            flash('%s %s updated' % (title, instance), 'success')
            return redirect(url_for('.index',
                                                resource_name=resource_name))

    return render_template('resources/edit.html',
                                 title='Edit %s' % title,
                                 form=form,
                                 resource_name=resource_name,
                                 instance=instance)


@resource_blueprint.route('/%s/new' % resource_name, methods=['GET', 'POST'])
@login_required
def new(resource_name):
    singular = p.singular_noun(resource_name)
    title = singular[0].upper() + singular[1:]
    resource = resource_by_name(resource_name)
    instance = resource.meta.model()
    form = form_by_name(resource_name)(request.form, instance)

    if request.method == 'POST' and form.validate():
        instance = resource.manager.create(form.data)
        flash('%s %s created' % (title, instance), 'success')
        return redirect(url_for('.index',
                                            resource_name=resource_name))

    return render_template('resources/new.html',
                                 title='New %s' % title,
                                 form=form,
                                 resource_name=resource_name,
                                 instance=instance)


@resource_blueprint.route('/%s/edit' % resource_name, methods=['GET', 'POST'])
@login_required
def bulk_edit(resource_name):
    singular = p.singular_noun(resource_name)
    title = resource_name[0].upper() + resource_name[1:]
    resource = resource_by_name(resource_name)
    ids = request.args.getlist('ids')
    where = [Condition('id', COMPARATORS['$in'], ids)]
    form = form_by_name(resource_name)

    instances = resource.manager.instances(where=where)

    forms = []
    for instance in instances:
        instance.original_id = instance.id
        forms.append(form(request.form,
                          instance,
                          '%s:%s:' % (singular, instance.id)))

    if request.method == 'POST':
        is_valid = True

        for form in forms:
            if not form.validate():
                is_valid = False

        if is_valid:
            for form in forms:
                instance = resource.manager.read(form.data['original_id'])
                resource.manager.update(instance, form.data)

            flash('%s updated' % title, 'success')
            return redirect(url_for('.index',
                                                resource_name=resource_name))

    return render_template('resources/bulk_edit.html',
                                 title='Bulk Edit %s' % title,
                                 forms=forms,
                                 resource_name=resource_name,
                                 instances=instances)

def endpoint_arguments_constructor(resource):
    def func():
        return { 'resource_name': resource }
    return func


def init_resources():
    resources = {
            'vouchers': 'Vouchers',
            'networks': 'Networks',
            'gateways': 'Gateways',
            'categories': 'Sales',
            'products': 'Sales',
            'users': 'System',
            'currencies': 'System',
    }

    endpoints = {
            'index': [ '%(resource)s', 'Manage %(plural)s' ],
            'new': [ '%(resource)s/new', 'New %(singular)s' ],
    }

    index = 0

    for resource, category in resources.iteritems():
        for action, defn in endpoints.iteritems():
            def visible_when(action=action, resource=resource):
                return has_a_role(*roles_by_resource[resource])

            (path, title) = defn
            endpoint = 'resource.%s' % action
            path = path % {'resource': resource, 'action': action}
            item = current_menu.submenu(path)
            item.register(endpoint,
                          title % {'singular': p.singular_noun(resource), 'plural': resource},
                          order=index,
                          endpoint_arguments_constructor=endpoint_arguments_constructor(resource),
                          expected_args=['resource_name'],
                          visible_when=visible_when,
                          category=category)
            index = index + 10
