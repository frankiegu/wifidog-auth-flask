import flask

from flask_security import current_user

# These functions all assume they are in request context


def is_logged_in():
    return current_user is not None and current_user.is_authenticated


def has_role(role):
    return is_logged_in() and current_user.has_role(role)


def has_a_role(*roles, **kwargs):
    if is_logged_in():
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
