require('./styles.styl');

var keys = require('./util/keys.js');

var win = window;
var doc = document;

var id = 'ractive-multiselect-dropdown-container';

module.exports = Ractive.extend({

    template: require('./template.html'),

    isolated: true,
    modifyArrays: false,

    data: function() {
        return {

            selected: [],

            clearFilterOnSelect: true,

            /* close on select */
            autoClose: false,

            /* remove items from data as they move to selected */
            consume: true,

            highlighted: -1, // for dropdown
            highlightedSelected: -1, // for selected items

            open: false,

            // show the X in selected items?
            showCross: true,

            // Allows custom items to be entered if no matches from `data`. Default: `true`
            allowCustom: true

        }
    },

    decorators: {
        preventOverscroll: require('./decorators/prevent-overscroll'),
    },

    events: {
        escape: keys.escape,
        enter: keys.enter,
        uparrow: keys.uparrow,
        downarrow: keys.downarrow,
        leftarrow: keys.leftarrow,
        rightarrow: keys.rightarrow,
        backspace: keys.backspace,
        delete: keys.delete,
    },

    computed: {

        items: function() {

            var self = this;
            var filter = self.get('filter').toLowerCase();
            var items = self.get('data');
            var selected = self.get('selected');
            var consume = self.get('consume');

            if(!items || !(items instanceof Array))
                return null;

            items = items.slice().filter(function(item) {

                // filter out the selected items
                if(consume && selected.indexOf(item) > -1)
                    return;

                // filter out items that don't match `filter`
                if(typeof item === 'object') {
                    for(var key in item) {
                        if(typeof item[key] === 'string' && item[key].toLowerCase().indexOf(filter) >-1)
                            return true;
                    }
                } else {
                    return item.toLowerCase().indexOf(filter) > -1
                }
            });


            var groups = {}, order = [];

            for(var i = 0; i < items.length; i++) {

                var item = items[i];

                // no group
                if(!item.group) {
                    continue;
                }

                // already have a group, add it
                if(groups[item.group]) {
                    groups[item.group].push(item);
                } else {
                    // no group yet, make a new one
                    groups[item.group] = [item];
                    order.push(item.group);
                }

                //remove from items
                items.splice(i, 1);
                i--;
            }

            // now concat the groups back in
            if(order.length) {
                order.forEach(function(group) {
                    items = items.concat({title: group, group: true});
                    items = items.concat(groups[group]);
                });
            }

            return items;

        }
    },

    partials: {
        selectedItem_default: require('./partials/selecteditem'),
        _selectedItem: function() {
            if(this.partials.selectedItem)
                return this.partials.selectedItem;
            else
                return this.partials.selectedItem_default;
        },

        item_default: require('./partials/item'),
        _item: function() {
            if(this.partials.item)
                return this.partials.item;
            else
                return this.partials.item_default;
        },

        group_default: require('./partials/group'),
        _group: function() {
            if(this.partials.group)
                return this.partials.group;
            else
                return this.partials.group_default;
        },
    },

    onrender: function() {

        var self = this;

        //hoist the dropdowns into a container on the body
        var dropdown = self.find('.dropdown');

        self.dropdown = dropdown; // cache for later

        var container = doc.getElementById(id);

        if (!container) {
            container = doc.createElement('div');
            container.id = id;
            container.className = 'ractive-multiselect';
            doc.body.appendChild(container);
        }

        container.appendChild(dropdown);


    },


    oncomplete: function() {

        var self = this;

        var el = self.find('*');
        var dropdown = self.find('.dropdown');

        self.clickHandler = function(e) {

            var target = e.target;
            if(el.contains(target) || target === dropdown || dropdown.contains(target))
                return;

            self.set('open', false);

        };

        self.scrollHandler = function(e) {
            requestAnimationFrame(function() {
                self.updateBounds();
            });
        };

        self.observe('open', function(open) {

            if(open) {

                doc.addEventListener('click', self.clickHandler);
                win.addEventListener('scroll', self.scrollHandler);

            } else {

                doc.removeEventListener('click', self.clickHandler);
                win.removeEventListener('scroll', self.scrollHandler);
            }

            self.updateBounds();

        });

        self.on('uparrow downarrow leftarrow rightarrow enter delete', function(details) {

            var open = self.get('open');
            var type = details.name;

            var event = details.original;

            var highlighted = self.get('highlighted');
            var highlightedSelected = self.get('highlightedSelected');
            var items = self.get('items');
            var selected = self.get('selected');
            var filter = self.get('filter');

            if(type == 'uparrow') {

                if(highlighted <= 0)
                    return;

                // increase highlighted until we find a non group
                do {
                    highlighted--;
                } while(items[highlighted] &&
                        items[highlighted].group === true)

                highlighted = Math.max(0, highlighted);

                self.set('highlighted', highlighted);

            }
            else
            if(type == 'downarrow') {

                do {
                    highlighted++;
                } while(items[highlighted] &&
                        items[highlighted].group === true)

                highlighted = Math.min(items.length, highlighted);

                self.set('highlighted', highlighted);

            }
            if(type == 'leftarrow') {

                if(highlightedSelected === 0)
                    return;

                if(highlightedSelected === -1)
                    highlightedSelected = selected.length-1;
                else
                    highlightedSelected = Math.max(0, highlightedSelected-1);

                self.set('highlightedSelected', highlightedSelected);

            }
            if(type == 'rightarrow') {

                highlightedSelected = Math.min(selected.length, highlightedSelected+1);

                self.set('highlightedSelected', highlightedSelected);

            }
            else
            if(type == 'enter') {

                if(highlighted !== -1) {
                    if(open) {
                        self.select(self.get('items.'+highlighted))
                        self.set('highlighted', -1);
                    }
                } else {
                    var allowCustom = self.get('allowCustom');
                    if(filter.length > 1 && allowCustom)
                        self.select(filter);
                }


            }
            else
            if(type == 'delete') {

                var filter = self.get('filter');


                if(highlightedSelected !== -1) {
                    self.select(self.get('selected.'+highlightedSelected));
                    self.set('highlightedSelected', -1);
                    event.preventDefault();
                }
                else
                if(filter === '') {
                    self.set('highlightedSelected', selected.length-1);
                }


            }

        });

    },

    onteardown: function() {

        doc.removeEventListener('click', this.clickHandler);
        win.removeEventListener('scroll', self.scrollHandler);

        // have to manually clean this up since we hoisted it from under ractive's nose
        var dropdown = this.find('.dropdown');

        if(dropdown) {
            dropdown.parentNode.removeChild(dropdown);
        }

        var container = doc.getElementById(id);

        if(container && container.childNodes.length == 0) {
            container.parentNode.removeChild(container);
        }


    },


    open: function(details) {

        this.set('open', true);

    },

    close: function(details) {

        this.set('open', false);

    },

    select: function(item) {

        if(!item)
            return;

        var self = this;

        if(item.keypath)
            item = self.get(item.keypath);

        var selected = self.get('selected');
        var items = self.get('items');

        var index = selected.indexOf(item);

        if(item.group === true)
            return;

        if(index == -1) {
            self.push('selected', item);

        } else {
            self.splice('selected', index, 1);
        }

        if(self.get('clearFilterOnSelect'))
            self.set('filter', '');

        if(self.get('autoClose'))
            self.close();

        self.update('items');

        self.updateBounds();

    },

    updateBounds: function() {

        var self = this;
        var el = self.find('*');
        var open = self.get('open');

        var bounds = el.getBoundingClientRect();

        // match dropdown width with el width
        self.dropdown.style.width = bounds.width + 'px';

        var dropdown = self.dropdown;

        if (open) {
            dropdown.style.left = bounds.left + 'px';
            dropdown.style.top = (bounds.bottom + 3) + 'px';
        } else {
            dropdown.style.left = '-9999px';;
        }

    },

});
