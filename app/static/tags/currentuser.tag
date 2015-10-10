<currentuser>
    <table class="pure-table">
        <tr><th>Email</th><td>{ user.email }</td></tr>
        <tr><th>Network</th><td>{ user.network }</td></tr>
        <tr><th>Gateway</th><td>{ user.gateway }</td></tr>
        <tr><th>Roles</th><td>{ user.roles.join(', ') }</td></tr>
    </table>

    <style scoped>
    th {
        text-align: right;
    }
    </style>

    var self = this;

    RiotControl.on('currentuser.loaded', function(user) {
        self.user = user;
        self.update();
    });

    RiotControl.trigger('currentuser.load');
</currentuser>
