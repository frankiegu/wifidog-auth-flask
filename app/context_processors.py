from flask.ext.menu import current_menu
from flask.ext.security import current_user


def init_context_processors(app):
    @app.context_processor
    def menu_categories():
        def func():
            menu_categories = {}

            for child in current_menu.children:
                if child.visible and hasattr(child, 'category'):
                    if child.category not in menu_categories:
                        menu_categories[child.category] = []
                    menu_categories[child.category].append(child)

            sorted_categories = []
            for category in app.config['MENU_CATEGORY_ORDER']:
                if category in menu_categories:
                    sorted_categories.append([category, menu_categories[category]])

            return sorted_categories

        return dict(menu_categories=func)

    @app.context_processor
    def status_icons():
        return dict(status_icons={
            'new': 'file',
            'active': 'bolt',
            'ended': 'flag',
            'expired': 'circle-x',
            'archived': 'trash',
            'blocked': 'thumb-down'
        })
