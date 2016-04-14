# ractive-multiselect

A `<multiselect>` component that allows full styling and customizability.

### Demo

[Live Demo](http://jondum.github.com/ractive-multiselect/demo/)

### Install


```
npm install ractive-multiselect --save
```

### Usage

Add the multiselect to your Ractive instance:

```js
Ractive.extend({
    ...
    components: {
        multiselect: require('ractive-multiselect')
    },
    ...
});
```

Use it like a normal multiselect element

```html
<multiselect value='{{ myValue }}'>
 {{#each options}}
 <option>{{this}}</option>
 {{/each}}
 <option>some other option</option>
</multiselect>
```

##### Custom Templates

Customize how rows in the dropdown and selected items are displayed through inline partials.

```html
<multiselect data='{{data}}'>
    {{#partial selectedItem}}
        {{ .name }}
    {{/partial}}
    {{#partial item}}
        <img src='{{.avatar}}'/>
        {{ .name }}
    {{/partial}}
</multiselect>
```

##### Groups

Data can be grouped

```html
<multiselect data='{{data}}'>
    {{#partial selectedItem}}
        {{ .name }}
    {{/partial}}
    {{#partial item}}
        {{ .name }}
    {{/partial}}
</multiselect>
```
```js
data = [
    {name: 'Zuchini', group: 'vegetables'},
    {name: 'Potatoes', group: 'vegetables'},
    {name: 'Oranges', group: 'fruits'},
    {name: 'Carrots', group: 'vegetables'},
    {name: 'Apples', group: 'fruits'},
    {name: 'Fruity Pebbles', group: 'cereals'},
    {name: 'Bananas', group: 'fruits'},
    {name: 'Broccoli', group: 'vegetables'},
    {name: 'Peaches', group: 'fruits'},
    {name: 'Cheerios', group: 'cereals'},
]
```


### API


`data` Populate the suggestions dropdown. Default `[]`

`selected` Array of selected items from `data`. Default `[]`

`autoClose` Close the dropdown upon making a selection. Default `false`

`consume`  Remove items from dropdown if they are a selected item. Default `true`I

`showCross` Show/Hide the X in the selected item. Default `true

`allowCustom` Allows custom items to be entered if no matches from `data`. Default: `true`

`clearFilterOnSelect` Clears whatever is typed into the filter input when a selection is made. Default `true`









