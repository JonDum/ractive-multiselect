require('./styles.styl');

var keys = require('./util/keys.js');

var win = window;
var doc = document;

var id = 'ractive-multiselect-dropdown-container';

module.exports = Ractive.extend({

    template: require('./template.html'),

    isolated: true,

    data: function() {
        return {

            selected: [],

            blockScrolling: true,

            /* close on select */
            autoClose: false,

            /* remove items from data as they move to selected */
            consume: true,

            highlighted: -1, // for dropdown
            highlightedSelected: -1, // for selected items

            open: false,

            // show the X in selected items?
            showCross: true,

            // 
            allowCustom: true

        }
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

            if(!items)
                return items;

            return items
            .filter(function(item) {

                // filter out the selected items
                if(consume && selected.indexOf(item) > -1)
                    return;

                // filter out items that don't match `filter`
                if(typeof item === 'object') {
                    for(var key in item) {
                        if(item[key].toLowerCase().indexOf(filter) >-1)
                            return true;
                    }
                } else {
                    return item.toLowerCase().indexOf(filter) > -1
                }
            });

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


        self.observe('open', function(open) {

            var blockScrolling = self.get('blockScrolling');


            if(open) {

                doc.addEventListener('click', self.clickHandler);

                if(blockScrolling)
                    disableScroll();

            } else {

                doc.removeEventListener('click', self.clickHandler);

                if(blockScrolling)
                    enableScroll();
            }

            self.updateSize();
            self.updatePosition();

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

                highlighted = Math.max(0, highlighted-1);

                self.set('highlighted', highlighted);

            }
            else
            if(type == 'downarrow') {

                highlighted = Math.min(items.length, highlighted+1);

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
                    if(filter.length > 1)
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

        if(index == -1) {

            self.push('selected', item);

        } else {

            self.splice('selected', index, 1);

        }

        if(self.get('autoClose'))
            self.close();

        self.update('items');
        self.updateSize();
        self.updatePosition();

    },

    updateSize: function() {

        var self = this;
        var el = self.find('*');
        self.dropdown.style.width = el.offsetWidth + 'px';

    },

    updatePosition: function() {

        var self = this;
        var el = self.find('*');
        var bounds = el.getBoundingClientRect();
        var open = self.get('open');
        var dropdown = self.dropdown;

        if (open) {
            dropdown.style.left = bounds.left + 'px';
            dropdown.style.top = (bounds.bottom + 3) + 'px';
        } else {
            dropdown.style.left = '-9999px';;
        }
    },




});

function showDropdown(element) {
    var event = doc.createEvent('MouseEvents');
    event.initMouseEvent('mousedown', true, true, win);
    element.dispatchEvent(event);
}

function isTouchDevice() {
    return ('ontouchstart' in win || 'onmsgesturechange' in win) && screen.width < 1200;
}


// block scrolling - from SO

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {
    37: 1,
    38: 1,
    39: 1,
    40: 1
};

function preventDefault(e) {
    e = e || win.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    win.addEventListener('DOMMouseScroll', preventDefault, false);
    win.addEventListener('wheel', preventDefault); // modern standard
    win.addEventListener('mousewheel', preventDefault); // older browsers, IE
    doc.addEventListener('mousewheel', preventDefault);
    win.addEventListener('touchmove', preventDefault); // mobile
    doc.addEventListener('keydown', preventDefaultForScrollKeys);
}

function enableScroll() {
    win.removeEventListener('DOMMouseScroll', preventDefault, false);

    win.removeEventListener('wheel', preventDefault); // modern standard
    win.removeEventListener('mousewheel', preventDefault); // older browsers, IE
    doc.removeEventListener('mousewheel', preventDefault);
    win.removeEventListener('touchmove', preventDefault); // mobile
    doc.removeEventListener('keydown', preventDefaultForScrollKeys);
}
