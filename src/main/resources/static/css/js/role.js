
function getIndex(list, id) {
    for (var i = 0; i < list.length; i++ ) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}

var roleApi = Vue.resource('/admin_role/role{/id}');

Vue.component('role-form', {
    props: ['roles', 'roleAttr'],
    data: function() {
        return {
            name: '',
            id: ''
        }
    },
    watch: {
        roleAttr: function(newVal, oldVal) {
            this.name = newVal.name;
            this.id = newVal.id;
        }
    },

    template:
    '<div>' +
    '<input type="text" placeholder="Write something" v-model="name" />' +
    '<input type="button" value="Save" @click="save" />' +
    '</div>',
    methods: {
        save: function() {
            var role = { name: this.name };

            if (this.id) {
                roleApi.update({id: this.id}, role).then(result =>
                result.json().then(data => {
                var index = getIndex(this.roles, data.id);
                this.roles.splice(index, 1, data);
                this.name = ''
                this.id = ''
            })
            )
            } else {
                roleApi.save({}, role).then(result =>
                result.json().then(data => {
                    this.roles.push(data);
                this.name = ''
            })
            )
            }
        }
    }

});

Vue.component('role-row', {
    props: ['role', 'editMethod', 'roles'],
    template: '<div>' +
    '<i>({{ role.id }})</i> {{ role.name }}' +
    '<span style="position: absolute; right: 0">' +
    '<input type="button" value="Edit" @click="edit" />' +
    '<input type="button" value="X" @click="del" />' +
    '</span>' +
    '</div>',
    methods: {
        edit: function() {
            this.editMethod(this.role);
        },
        del: function() {
            roleApi.remove({id: this.role.id}).then(result => {
                if (result.ok) {
                this.roles.splice(this.roles.indexOf(this.role), 1)
            }
        })
        }
    }


});

Vue.component('roles-list', {
    props: ['roles'],
    data: function() {
        return {
            role: null
        }
    },
    template:
    '<div style="position: relative; width: 300px;">' +
    '<role-form :roles="roles" :roleAttr="role" />' +
    '<role-row v-for="role in roles" :key="role.id" :role="role" ' +
    ':editMethod="editMethod" :roles="roles" />' +
    '</div>',
    created: function() {
        roleApi.get().then(result =>
        result.json().then(data =>
        data.forEach(role => this.roles.push(role))
    )
    )
    },
    methods: {
        editMethod: function(role) {
            this.role = role;
        }
    }
});

var app = new Vue({
    el: '#app',
    template: '<roles-list :roles="roles" />',
    data: {
        roles: []
    }
});
