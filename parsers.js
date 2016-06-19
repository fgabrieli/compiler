/**
 * Author: Fernando Gabrieli
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

extend(exports, {
    InfixParser : InfixParser
});