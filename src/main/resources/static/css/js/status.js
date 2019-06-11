
function getIndex(list, id) {
    for (var i = 0; i < list.length; i++ ) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}

var statusApi = Vue.resource('/admin_status/status{/id}');

Vue.component('status-form', {
    props: ['statuss', 'statusAttr'],
    data: function() {
        return {
            name: '',
            id: ''
        }
    },
    watch: {
        statusAttr: function(newVal, oldVal) {
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
            var status = { name: this.name };

            if (this.id) {
                statusApi.update({id: this.id}, status).then(result =>
                result.json().then(data => {
                var index = getIndex(this.statuss, data.id);
                this.statuss.splice(index, 1, data);
                this.name = ''
                this.id = ''
            })
            )
            } else {
                statusApi.save({}, status).then(result =>
                result.json().then(data => {
                    this.statuss.push(data);
                this.name = ''
            })
            )
            }
        }
    }

});

Vue.component('status-row', {
    props: ['status', 'editMethod', 'statuss'],
    template: '<div>' +
    '<i>({{ status.id }})</i> {{ status.name }}' +
    '<span style="position: absolute; right: 0">' +
    '<input type="button" value="Edit" @click="edit" />' +
    '<input type="button" value="X" @click="del" />' +
    '</span>' +
    '</div>',
    methods: {
        edit: function() {
            this.editMethod(this.status);
        },
        del: function() {
            statusApi.remove({id: this.status.id}).then(result => {
                if (result.ok) {
                this.statuss.splice(this.statuss.indexOf(this.status), 1)
            }
        })
        }
    }


});

Vue.component('statuss-list', {
    props: ['statuss'],
    data: function() {
        return {
            status: null
        }
    },
    template:
    '<div style="position: relative; width: 300px;">' +
    '<status-form :statuss="statuss" :statusAttr="status" />' +
    '<status-row v-for="status in statuss" :key="status.id" :status="status" ' +
    ':editMethod="editMethod" :statuss="statuss" />' +
    '</div>',
    created: function() {
        statusApi.get().then(result =>
        result.json().then(data =>
        data.forEach(status => this.statuss.push(status))
    )
    )
    },
    methods: {
        editMethod: function(status) {
            this.status = status;
        }
    }
});

var app = new Vue({
    el: '#app',
    template: '<statuss-list :statuss="statuss" />',
    data: {
        statuss: []
    }
});
