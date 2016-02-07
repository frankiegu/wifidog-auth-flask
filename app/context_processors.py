from flask.ext.menu import current_menu


def init_context_processors(app):
    @app.context_processor
    def menu_categories():
        menu_categories = {}

        for child in current_menu.children:
            if child.visible:
                if child.category not in menu_categories:
                    menu_categories[child.category] = []
                menu_categories[child.category].append(child)

        return dict(menu_categories=menu_categories)
