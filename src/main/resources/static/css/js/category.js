

function getIndex(list, id) {
    for (var i = 0; i < list.length; i++ ) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}

var categoryApi = Vue.resource('/admin_category/category{/id}');

Vue.component('category-form', {
    props: ['categorys', 'categoryAttr'],
    data: function() {
        return {
            name: '',
            id: ''
        }
    },
    watch: {
        categoryAttr: function(newVal, oldVal) {
            this.name = newVal.name;
            this.id = newVal.id;
        }
    },

    template:
    '<div>' +
    '<input type="text" placeholder="Write something" v-model="name" />' +
    '<input type="button" value="Save" @click="save" />' +
    '<input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}"  />' +
    '</div>',
    methods: {
        save: function() {
            var category = { name: this.name };

            if (this.id) {
                categoryApi.update({id: this.id}, category).then(result =>
                result.json().then(data => {
                var index = getIndex(this.categorys, data.id);
                this.categorys.splice(index, 1, data);
                this.name = ''
                this.id = ''
            })
            )
            } else {
                categoryApi.save({}, category).then(result =>
                result.json().then(data => {
                    this.categorys.push(data);
                this.name = ''
            })
            )
            }
        }
    }

});

Vue.component('category-row', {
    props: ['category', 'editMethod', 'categorys'],
    template: '<div>' +
    '<i>({{ category.id }})</i> {{ category.name }}' +
    '<span style="position: absolute; right: 0">' +
    '<input type="button" value="Edit" @click="edit" />' +
    '<input type="button" value="X" @click="del" />' +
    '</span>' +
    '</div>',
    methods: {
        edit: function() {
            this.editMethod(this.category);
        },
        del: function() {
            categoryApi.remove({id: this.category.id}).then(result => {
                if (result.ok) {
                this.categorys.splice(this.categorys.indexOf(this.category), 1)
            }
        })
        }
    }


});

Vue.component('categorys-list', {
    props: ['categorys'],
    data: function() {
        return {
            category: null
        }
    },
    template:
    '<div style="position: relative; width: 300px;">' +
    '<category-form :categorys="categorys" :categoryAttr="category" />' +
    '<category-row v-for="category in categorys" :key="category.id" :category="category" ' +
    ':editMethod="editMethod" :categorys="categorys" />' +
    '</div>',
    created: function() {
        categoryApi.get().then(result =>
        result.json().then(data =>
        data.forEach(category => this.categorys.push(category))
    )
    )
    },
    methods: {
        editMethod: function(category) {
            this.category = category;
        }
    }
});

var app = new Vue({
    el: '#app',
    template: '<categorys-list :categorys="categorys" />',
    data: {
        categorys: []
    }
});
