
function getIndex(list, id) {
    for (var i = 0; i < list.length; i++ ) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}

var cityApi = Vue.resource('/admin_city/city{/id}');

Vue.component('city-form', {
    props: ['citys', 'cityAttr'],
    data: function() {
        return {
            name: '',
            id: ''
        }
    },
    watch: {
        cityAttr: function(newVal, oldVal) {
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
            var city = { name: this.name };

            if (this.id) {
                cityApi.update({id: this.id}, city).then(result =>
                result.json().then(data => {
                var index = getIndex(this.citys, data.id);
                this.citys.splice(index, 1, data);
                this.name = ''
                this.id = ''
            })
            )
            } else {
                cityApi.save({}, city).then(result =>
                result.json().then(data => {
                    this.citys.push(data);
                this.name = ''
            })
            )
            }
        }
    }

});

Vue.component('city-row', {
    props: ['city', 'editMethod', 'citys'],
    template: '<div>' +
    '<i>({{ city.id }})</i> {{ city.name }}' +
    '<span style="position: absolute; right: 0">' +
    '<input type="button" value="Edit" @click="edit" />' +
    '<input type="button" value="X" @click="del" />' +
    '</span>' +
    '</div>',
    methods: {
        edit: function() {
            this.editMethod(this.city);
        },
        del: function() {
            cityApi.remove({id: this.city.id}).then(result => {
                if (result.ok) {
                this.citys.splice(this.citys.indexOf(this.city), 1)
            }
        })
        }
    }


});

Vue.component('citys-list', {
    props: ['citys'],
    data: function() {
        return {
            city: null
        }
    },
    template:
    '<div style="position: relative; width: 300px;">' +
    '<city-form :citys="citys" :cityAttr="city" />' +
    '<city-row v-for="city in citys" :key="city.id" :city="city" ' +
    ':editMethod="editMethod" :citys="citys" />' +
    '</div>',
    created: function() {
        cityApi.get().then(result =>
        result.json().then(data =>
        data.forEach(city => this.citys.push(city))
    )
    )
    },
    methods: {
        editMethod: function(city) {
            this.city = city;
        }
    }
});

var app = new Vue({
    el: '#app',
    template: '<citys-list :citys="citys" />',
    data: {
        citys: []
    }
});
