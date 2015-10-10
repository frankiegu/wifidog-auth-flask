<users>
    <h1>Users</h1>

    <div class="actions-collection">
        <form class="pure-form" onsubmit={ create }>
            <fieldset>
                <input name="email" type="text" placeholder="Email" required />
                <input name="password" type="text" placeholder="Password" required />
                <button type="submit" class="pure-button pure-button-primary">
                    <span class="oi" data-glyph="file" title="Create" aria-hidden="true"></span>
                    Create
                </button>
                <button if={ users.length > 1 } type="button" class="pure-button" onclick={ removeAll }>
                    <span class="oi" data-glyph="x" title="Remove All" aria-hidden="true"></span>
                    Remove All
                </button>
            </fieldset>
        </form>
    </div>

    <table if={ users.length } width="100%" cellspacing="0" class="pure-table pure-table-horizontal">
        <thead>
            <tr>
                <th>Network</th>
                <th>Gateway</th>
                <th>Email</th>
                <th>Created</th>
                <th class="actions">Actions</th>
            </tr>
        </thead>

        <tbody>
            <tr each={ row, i in users } data-id={ row['$id'] } class={ pure-table-odd: i % 2 }>
                <td>{ row.network_id }</td>
                <td>{ row.gateway_id }</td>
                <td>{ row.email }</td>
                <td>{ renderDateTime(row.created_at) }</td>

                <td class="actions actions-row">
                    <button class="pure-button" onclick={ remove }>
                        <span class="oi" data-glyph="x" title="Remove" aria-hidden="true"></span>
                        Remove
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <script>
    var self = this;

    RiotControl.on('users.updated', function (users) {
        self.users = users;
        self.update();
    });

    RiotControl.trigger('users.load');

    pad(number, length) {
        var str = '' + number;

        while (str.length < length) {
            str = '0' + str;
        }

        return str;
    }

    renderDateTime(dt) {
        if (dt) {
            dt = new Date(dt.$date);
            return dt.toLocaleString();
        }
    }

    getId(e) {
        return $(e.target).closest('tr[data-id]').data('id');
    }

    create(e) {
        RiotControl.trigger('users.create', self.email.value, self.password.value);
        return false;
    }

    removeAll(e) {
        if(confirm('Are you sure?')) {
            RiotControl.trigger('users.remove');
        }
    }

    remove(e) {
        if(confirm('Are you sure?')) {
            RiotControl.trigger('user.remove', self.getId(e));
        }
    }
    </script>
</users>