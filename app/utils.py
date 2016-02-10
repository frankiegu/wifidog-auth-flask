import flask

from flask.ext.security import current_user

# These functions all assume they are in request context


def is_logged_out():
    return current_user is None or not current_user.is_authenticated


def is_logged_in():
    return current_user is not None and current_user.is_authenticated


def has_role(role):
    return current_user is not None and \
            current_user.is_authenticated and \
            current_user.has_role(role)


def has_all_roles(*roles):
    if current_user is not None and current_user.is_authenticated:
        for role in roles:
            if not current_user.has_role(role):
                return False
        return True
    return False


def has_a_role(*roles, **kwargs):
    if current_user is not None and current_user.is_authenticated:
        for role in roles:
            if current_user.has_role(role):
                return True
    return False


def args_get(which):
    def func():
        value = flask.request.args.get(which)
        if value == '':
            value = None
        return value
    return func
