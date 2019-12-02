// mix-in underscore.string into "_"

var s = require('underscore.string');
_.mixin(s.exports());

/**
 * Provide a cleaner way to access deep object properties avoiding null pointers
 * So, instead of doing this:
 *    var x = (obj && obj.prop && obj.prop[subprop] && obj.prop[subprop].lastprop)
 * you can do:
 *    var x = _.dig(obj, "prop", "subprop", subprop, "lastprop");
 */
(function () {
    var deepGet  = function (obj) {

        if (obj === undefined || obj === null || arguments.length === 1) {
            return obj;
        }

        // convert arguments to a real Array
        var args = [].slice.apply(arguments);

        var newObj = obj[args[1]];
        var newArgs = args.slice(2);
        newArgs.unshift(newObj);
        return deepGet.apply( this, newArgs );
    };
    _.mixin(  { dig: deepGet });
})();