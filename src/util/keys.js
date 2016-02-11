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
