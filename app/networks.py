import flask

from app.models import Network
from app.forms import NetworkForm
from app.resources import NetworkResource
from app.utils import has_role

from flask import Blueprint

from flask.ext.menu import register_menu
from flask.ext.potion.instances import Condition, COMPARATORS
from flask.ext.security import login_required, roles_required

networks = Blueprint('networks',
                     __name__,
                     template_folder='templates')


@networks.route('/networks', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
@register_menu(networks,
               '.networks',
               'Networks',
               visible_when=has_role('super-admin'),
               order=10,
               category='Networks')
def networks_index():
    if flask.request.method == 'GET':
        networks = NetworkResource.manager.instances()
        return flask.render_template('networks/index.html', networks=networks)
    else:
        action = flask.request.form.get('action')
        ids = flask.request.form.getlist('ids')

        if action == 'delete':
            for id in ids:
                NetworkResource.manager.delete_by_id(id)
            flask.flash('Networks deleted', 'success')
        elif action == 'edit':
            return flask.redirect(flask.url_for('.networks_bulk_edit',
                                                ids=ids))

        return flask.redirect(flask.url_for('.networks_index'))


@networks.route('/networks/delete')
@login_required
@roles_required('super-admin')
def networks_delete():
    networks = []
    return flask.render_template('networks/delete.html', networks=networks)


@networks.route('/networks/new', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
def networks_new():
    network = Network()
    form = NetworkForm(flask.request.form, network)

    if flask.request.method == 'POST' and form.validate():
        NetworkResource.manager.create(form.data)
        flask.flash('Network created', 'success')
        return flask.redirect(flask.url_for('.networks_index'))

    return flask.render_template('networks/edit.html',
                                 title='New Network',
                                 form=form,
                                 network=network)


@networks.route('/networks/bulk-edit', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
def networks_bulk_edit():
    ids = flask.request.args.getlist('ids')
    where = [Condition('id', COMPARATORS['$in'], ids)]

    networks = NetworkResource.manager.instances(where=where)

    forms = []
    for network in networks:
        network.original_id = network.id
        forms.append(NetworkForm(flask.request.form,
                                 network,
                                 'network:%s:' % network.id))

    if flask.request.method == 'POST':
        something_invalid = False

        for form in forms:
            if not form.validate():
                something_invalid = True

        if not something_invalid:
            for form in forms:
                network = NetworkResource.manager.read(form.data['original_id'])
                NetworkResource.manager.update(network, form.data)

            flask.flash('Networks updated', 'success')
            return flask.redirect(flask.url_for('.networks_index'))

    return flask.render_template('networks/bulk_edit.html',
                                 title='Bulk Edit Networks',
                                 forms=forms,
                                 networks=networks)


@networks.route('/networks/<network_id>', methods=['GET', 'POST'])
@login_required
@roles_required('super-admin')
def networks_edit(network_id):
    network = NetworkResource.manager.read(network_id)
    form = NetworkForm(flask.request.form, network)

    if flask.request.method == 'POST' and form.validate():
        NetworkResource.manager.update(network, form.data)
        flask.flash('Network updated', 'success')
        return flask.redirect(flask.url_for('.networks_index'))

    return flask.render_template('networks/edit.html',
                                 title='Edit Network',
                                 form=form,
                                 network=network)
