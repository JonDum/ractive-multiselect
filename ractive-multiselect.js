(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["RactiveMultiselect"] = factory();
	else
		root["RactiveMultiselect"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);

	var keys = __webpack_require__(5);

	var win = window;
	var doc = document;

	var id = 'ractive-multiselect-dropdown-container';

	module.exports = Ractive.extend({

	    template: __webpack_require__(6),

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
	        preventOverscroll: __webpack_require__(7),
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
	        selectedItem_default: __webpack_require__(8),
	        _selectedItem: function() {
	            if(this.partials.selectedItem)
	                return this.partials.selectedItem;
	            else
	                return this.partials.selectedItem_default;
	        },

	        item_default: __webpack_require__(9),
	        _item: function() {
	            if(this.partials.item)
	                return this.partials.item;
	            else
	                return this.partials.item_default;
	        },

	        group_default: __webpack_require__(10),
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/stylus-loader/index.js!./styles.styl", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/stylus-loader/index.js!./styles.styl");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, ".ractive-multiselect {\n  display: flex;\n  display: inline-flex;\n  flex-wrap: wrap;\n  cursor: default;\n  user-multiselect: none;\n  line-height: 1;\n  padding: 0.2em;\n  background: #fff;\n  border: 1px solid #999;\n}\n.ractive-multiselect,\n.ractive-multiselect *,\n.ractive-multiselect *:before,\n.ractive-multiselect *:after {\n  box-sizing: border-box;\n}\n.ractive-multiselect label {\n  margin-right: 0.5em;\n}\n.ractive-multiselect .item {\n  display: inline-block;\n  margin: 0.2em;\n  background: #f0f0f0;\n  font-size: 0.8em;\n  padding: 0.3em 0.6em;\n  border-radius: 99px;\n}\n.ractive-multiselect .item .cross {\n  width: 8px;\n  height: 8px;\n  vertical-align: middle;\n  margin-left: 4px;\n  cursor: pointer;\n}\n.ractive-multiselect .item.selecting {\n  border: 1px solid #0a63c2;\n}\n.ractive-multiselect input {\n  flex: 1 1 auto;\n  background: none;\n  border: none;\n  box-shadow: none;\n  outline: none;\n  text-indent: 0.5em;\n}\n.ractive-multiselect .dropdown {\n  margin: 3px 0 0 0;\n  background: #fff;\n  color: #333;\n  border-radius: 3px;\n  padding: 2px 0;\n  cursor: default;\n  list-style: none;\n  z-index: 50;\n  box-shadow: 0 3px 9px rgba(0,0,0,0.4);\n  max-height: 400px;\n  overflow-y: scroll;\n}\n.ractive-multiselect .dropdown:not(.open) {\n  display: none;\n}\n.ractive-multiselect li {\n  padding: 0.3em 0.5em;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.ractive-multiselect li.group {\n  background: #f0f0f0;\n  color: #aaa;\n  text-align: center;\n  padding: 0.4em 0;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  letter-spacing: 1px;\n}\n.ractive-multiselect li.group:hover,\n.ractive-multiselect li.group.selecting {\n  background: #f0f0f0;\n  color: #aaa;\n  border-top-color: transparent;\n  border-bottom-color: transparent;\n}\n.ractive-multiselect li.selected {\n  color: #3d96f5;\n}\n.ractive-multiselect li:hover,\n.ractive-multiselect li.selecting {\n  background: linear-gradient(#3d96f5, #0d7cf2);\n  color: #fff;\n  border-top-color: #0a63c2;\n  border-bottom-color: #004a99;\n}\n#ractive-multiselect-dropdown-container .dropdown {\n  position: fixed;\n  left: -9999px;\n}\n", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	// TODO can we just declare the keydowhHandler once? using `this`?
	function makeKeyDefinition(code) {
	    return function(node, fire) {
	        function keydownHandler(event) {
	            var which = event.which || event.keyCode;

	            if (which === code) {

	                fire({
	                    node: node,
	                    original: event
	                });
	            }
	        }

	        node.addEventListener('keydown', keydownHandler, false);

	        return {
	            teardown: function() {
	                node.removeEventListener('keydown', keydownHandler, false);
	            }
	        };
	    };
	}

	module.exports = {

	    enter: makeKeyDefinition(13),
	    tab: makeKeyDefinition(9),
	    escape: makeKeyDefinition(27),
	    space: makeKeyDefinition(32),

	    leftarrow: makeKeyDefinition(37),
	    rightarrow: makeKeyDefinition(39),
	    downarrow: makeKeyDefinition(40),
	    uparrow: makeKeyDefinition(38),

	    backspace: makeKeyDefinition(8),
	    delete: makeKeyDefinition(46),

	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":["ractive-multiselect ",{"t":2,"r":"class"}],"style":[{"t":2,"r":"style"}]},"f":[{"t":4,"f":[{"t":7,"e":"span","a":{"class":["item ",{"t":4,"f":["selecting"],"n":50,"x":{"r":["~/highlightedSelected","@index"],"s":"_0==_1"}}]},"f":[{"t":8,"r":"_selectedItem"}," ",{"t":4,"f":[{"t":7,"e":"svg","a":{"class":"cross","xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 12 12"},"v":{"click":{"m":"select","a":{"r":["."],"s":"[_0]"}}},"f":[{"t":7,"e":"path","a":{"d":"M8.432 6l3.442-3.442a.433.433 0 0 0 0-.61L10.05.126a.43.43 0 0 0-.607 0L6 3.568 2.557.125a.432.432 0 0 0-.608 0L.124 1.95a.433.433 0 0 0 0 .608L3.568 6 .126 9.442a.432.432 0 0 0 0 .608l1.824 1.825c.167.166.44.166.608 0L6 8.432l3.442 3.443c.167.166.44.166.608 0l1.824-1.825a.432.432 0 0 0 0-.608L8.432 6z"}}]}],"n":50,"r":"showCross"}]}],"n":52,"r":"selected"}," ",{"t":7,"e":"input","a":{"type":"text","value":[{"t":2,"r":".filter"}],"placeholder":[{"t":2,"x":{"r":["placeholder"],"s":"_0||\"Select an item...\""}}]},"v":{"focus":{"m":"open","a":{"r":[],"s":"[]"}},"uparrow":"uparrow","downarrow":"downarrow","leftarrow":"leftarrow","rightarrow":"rightarrow","enter":"enter","backspace-delete":"delete"}}," ",{"t":7,"e":"ul","a":{"class":["dropdown",{"t":4,"f":[" open"],"n":50,"x":{"r":["items","items.length","open"],"s":"_0&&_1&&_2"}}," ",{"t":2,"r":"class"}]},"o":"preventOverscroll","f":[{"t":4,"f":[{"t":7,"e":"li","a":{"class":[{"t":4,"f":["selecting"],"n":50,"x":{"r":["~/highlighted","@index"],"s":"_0==_1"}}," ",{"t":4,"f":["selected"],"n":50,"x":{"r":["~/selected","."],"s":"_0.indexOf(_1)>-1"}}," ",{"t":4,"f":["group"],"n":50,"x":{"r":[".group"],"s":"_0===true"}}]},"v":{"click":{"m":"select","a":{"r":["event"],"s":"[_0]"}}},"f":[{"t":4,"f":[{"t":8,"r":"_group"}],"n":50,"x":{"r":["./group"],"s":"_0===true"}},{"t":4,"n":51,"f":[{"t":8,"r":"_item"}],"x":{"r":["./group"],"s":"_0===true"}}]}],"n":52,"r":"items"}]}]}]};

/***/ },
/* 7 */
/***/ function(module, exports) {

	
	var win = window;
	var doc = document;

	module.exports = function(node, instance) {

	    node.addEventListener('mouseenter', disableScroll);
	    node.addEventListener('mouseleave', enableScroll);

	    var contentHeight;

	    function preventDefault(e) {

	        e = e || win.event;
	        if( (node.scrollTop <= 1 && e.deltaY < 0) ||
	           (node.scrollTop >= contentHeight && e.deltaY > 0) ) {

	            if (e.preventDefault)
	                e.preventDefault();
	            e.returnValue = false;
	            return false;
	        }
	    }

	    function disableScroll() {
	        // cache height for perf and avoiding reflow/repaint
	        contentHeight = node.scrollHeight - node.offsetHeight - 1;

	        win.addEventListener('DOMMouseScroll', preventDefault, false);
	        win.addEventListener('wheel', preventDefault); // modern standard
	        win.addEventListener('mousewheel', preventDefault); // older browsers, IE
	        doc.addEventListener('mousewheel', preventDefault);
	        win.addEventListener('touchmove', preventDefault); // mobile
	    }

	    function enableScroll() {

	        win.removeEventListener('DOMMouseScroll', preventDefault, false);

	        win.removeEventListener('wheel', preventDefault); // modern standard
	        win.removeEventListener('mousewheel', preventDefault); // older browsers, IE
	        doc.removeEventListener('mousewheel', preventDefault);
	        win.removeEventListener('touchmove', preventDefault); // mobile
	    }

	    return {
	        teardown: function() {
	            node.removeEventListener('mouseenter', disableScroll);
	            node.removeEventListener('mouseleave', enableScroll);
	        }
	    }

	}



/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":2,"r":"."}]};

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":2,"r":"."}]};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":2,"r":"./title"}]};

/***/ }
/******/ ])
});
;