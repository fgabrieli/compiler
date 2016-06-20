/**
 * @author Fernando Gabrieli - fgabrieli at gmail
 */

var extend = require('extend');

function TreeNode(type, data) {
    this.type = type ? type : '';

    this.data = data ? data : {};

    this.nodes = [];
}

/**
 * Abstract class
 */
function Parser() {
    this.id = 'Parser';
}

/**
 * Parse infix ops
 */
function InfixParser() {
    this.id = 'InfixParser';
};

extend(InfixParser.prototype, Parser, {
    sanitize : function(input) {
        return input.replace(/\s/g, '');
    },

    parse : function(input, subtree) {
        var parsed = {};

        input = this.sanitize(input);

        if (this.isExpr(input, subtree)) {
            parsed = this.parseExpr(input, subtree);

            if (parsed.input.length > 0) {
                return this.parse(parsed.input, parsed.subtree);
            }
        }

        return parsed.subtree || false;
    },

    isExpr : function(input, subtree) {
        return (subtree && subtree.type == 'expr') || (input.match(/^\d+[\+|\-|\*|\/]\d+/) != null);
    },

    parseExpr : function(input, node) {
        var regex, match, digit1, operator, digit2;

        var subtree = new TreeNode('expr');

        if (node) {
            regex = /^([\+|\-|\*|\/])(\d+)/;

            match = input.match(regex);
            if (match == null) {
                var error = 'Syntax error at "' + input + '", invalid operator or non-digit used';
                throw error;
            }

            operator = match[1];
            digit2 = match[2];

            subtree.nodes.push(node);
        } else {
            regex = /^(\d+)([\+|\-|\*|\/])(\d+)/;

            match = input.match(regex);

            digit1 = match[1];
            operator = match[2];
            digit2 = match[3];

            subtree.nodes.push(new TreeNode('digit', digit1));
        }

        subtree.nodes.push(new TreeNode('operator', operator));

        subtree.nodes.push(new TreeNode('digit', digit2));

        var parseResult = {
            subtree : subtree,
            input : input.replace(regex, '')
        }

        return parseResult;
    }
});

// G language (just something invented derived from C for playing)
function GParser() {
    this.id = 'GParser';
}

extend(GParser.prototype, InfixParser.prototype, {
    isReserved : function(input) {
        return this.isFor(input);
    },

    isExpr : function(input) {
        return !this.isReserved(input) && input.match(/[a-z]+/) != null;
    },

    parseExpr : function(input, node) {
        return {
            subtree : new TreeNode('expr', input),
            input : ''
        }
    },

    isFor : function(input) {
        return input.match(/^for/) != null;
    },

    consume : function(input, regex) {
        return (input.match(regex) != null) ? input.replace(regex, '') : false;
    },

    parseFor : function(input, node) {
        // for
        input = this.consume(input, /^for/);
        if (input === false)
            throw 'Syntax error, malformed FOR';

        var subtree = new TreeNode('for');

        // (
        input = this.consume(input, /\(/);
        if (input === false)
            throw 'Syntax error, FOR does not have opening parenthesis';

        subtree.nodes.push('(');

        // 1st opt expr
        var expr = input.match(/^(.*?);/);
        if (expr != null && this.isExpr(expr[1])) {
            subtree.nodes.push(this.parse(expr[1]));
        }
        input = this.consume(input, /^.*?;/);
        if (input === false)
            throw 'Syntax error, FOR does not have ;';

        subtree.nodes.push(';');

        // 2nd opt expr
        var expr = input.match(/^(.*?);/);
        if (expr != null && this.isExpr(expr[1])) {
            subtree.nodes.push(this.parse(expr[1]));
        }
        input = this.consume(input, /^.*?;/)
        if (input === false)
            throw 'Syntax error, FOR does not have ;';

        subtree.nodes.push(';');

        // 3rd opt expr
        var expr = input.match(/^(.*?)\)/);
        if (expr != null && this.isExpr(expr[1])) {
            subtree.nodes.push(this.parse(expr[1]));
        }
        input = this.consume(input, /^.*?\)/);
        if (input === false)
            throw 'Syntax error, FOR does not have ending parenthesis';

        subtree.nodes.push(')');

        // XXX: missing statement when parsing the for

        return {
            subtree : subtree,
            input : input
        }
    },

    parse : function(input, subtree) {
        var t = this;
        return InfixParser.prototype.parse(input, subtree) || (function() {
            var parsed = {};

            if (t.isExpr(input, subtree)) {
                parsed = t.parseExpr(input, subtree);
            } else if (t.isFor(input, subtree)) {
                parsed = t.parseFor(input, subtree);
            }

            if (parsed.input && parsed.input.length > 0) {
                return t.parse(parsed.input, parsed.subtree);
            }

            return parsed.subtree || false;
        })();
    }
});

// Exports
extend(exports, {
    GParser : GParser,
    InfixParser : InfixParser
});