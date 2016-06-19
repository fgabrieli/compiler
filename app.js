var str = '2+3+8+9+15-10';

function isExpr(input, subtree) {
    return (subtree && subtree.type == 'expr') || (input.match(/^\d+[\+|\-]\d+/) != null);
}

function parseExpr(input, node) {
    var regex, match, digit1, operator, digit2;

    var subtree = new TreeNode('expr');
    
    if (node) {
        regex = /^([\+|-])(\d+)/;

        match = input.match(regex);

        operator = match[1];
        digit2 = match[2];

        subtree.nodes.push(node);
    } else {
        regex = /^(\d+)([\+|-])(\d+)/;

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

function TreeNode(type, data) {
    this.type = type ? type : '';

    this.data = data ? data : {};

    this.nodes = [];
}

function parse(input, subtree) {
    var parsed = {};

    if (isExpr(input, subtree)) {
        parsed = parseExpr(input, subtree);

        if (parsed.input.length > 0) {
            return parse(parsed.input, parsed.subtree);
        }
    }

    return parsed && parsed.subtree;
}

var parseTree = parse(str);

console.log(parseTree);
