function TreeNode(type, data) {
    this.type = type ? type : '';

    this.data = data ? data : {};

    this.nodes = [];
    
    /**
     * Print tree for the parsed regex.
     */
    this.print = function() {
        console.log(this);
        
        for (var i = 0; i < this.nodes.length; i++) {
            this.print.call(this.nodes[i]);
        }
    }
}

function RegexParser() {
    var stack = [];

    var tree = {};

    var str = '';
    
    this.parse = function(strToParse) {
        if (typeof strToParse === 'undefined' || strToParse.length === 0) {
            throw 'Regex to be parsed is not valid';
        }
        
        init(strToParse);

        var parent = false, prevNode = false, addNode = false;
        var char = nextChar();
        do {
            if (isOr(char)) {
                node = or();
                
                addNode = true;
            } else if (isAdd(char)) {
                node = add();
                
                addNode = true;
            } else if (isKleene(char)) {
                node = kleene();

                addNode = true;
            } else {
                stack.push(char);
            }

            if (addNode) {
                if (!prevNode) {
                    prevNode = node;
                    
                    // only for the case when the regex has one node for it's syntax tree, say "a|b"
                    parent = prevNode;
                } else {
                    parent = new TreeNode('empty'); // connect pair of nodes
                    parent.nodes.push(prevNode, node);
                    prevNode = parent;
                }
                
                addNode = false;
            }
            
            char = nextChar();
        } while(char);
        
        
        tree = parent;
        
        return tree;
    }

    function init(strToParse) {
        str = strToParse;
        charIndex = 0;
        stack = [];
    }
    
    var charIndex = 0;
    
    function nextChar() {
        return charIndex < str.length ? str[charIndex++] : false;
    }
    
    function or() {
        return new TreeNode('or', {
            opn1 : stack.shift(),
            opn2 : nextChar()
        });
    }
    
    function add() {
        return new TreeNode('add', {
            opn1 : stack.shift()
        })
    }
    
    function kleene() {
        return new TreeNode('kleene', {
            opn1 : stack.shift()
        })
    }
    
    function isKleene(c) {
        return c === '*';
    }
    
    function isAdd(c) {
        return c === '+';
    }

    function isOr(c) {
        return c === '|';
    }
}

// Our graph data structure is actually the same as the TreeNode, the only difference is in the representation 
var GraphNode = TreeNode;

function NFA() {
    // initial state
    var nfa = {};
    
    var tree = {};
    
    this.createFromTree = function(node) {
        nfa = new GraphNode('init');

        tree = node;

        return makeNfa(tree);
    }
    
    /**
     * @param tree node from syntax tree
     */
    function makeNfa(node) {
        // nfa graph node
        var gNode = {};
        
        if (node.type == 'or') {
            gNode = or(node.data.opn1, node.data.opn2);
        } else if (node.type == 'add') {
            gNode = add(node.data.opn1);
        } else if (node.type == 'kleene') {
            gNode = kleene(node.data.opn1);
        }
        
        nfa.nodes.push(gNode);
        
        for (var i = 0; i < node.nodes.length; i++) {
            makeNfa(node.nodes[i]);
        }
        
        return nfa;
    }

    /**
     * Create NFA states for OR operation
     */
    function or(opn1, opn2) {
        // create OR nfa template
        var op = new GraphNode('or');

        var e1 = new GraphNode('e-closure');
        var e2 = new GraphNode('e-closure');

        op.nodes.push(e1, e2);

        e1.nodes.push(new GraphNode('alphabet', {char : opn1}));
        e2.nodes.push(new GraphNode('alphabet', {char : opn2}));
        
        return op;
    }
}

var parser = new RegexParser();
//var tree = parser.parse('a|bc+d*');
var syntaxTree = parser.parse('a|b');
//parser.print(syntaxTree);

var nfa = new NFA();
nfa.createFromTree(syntaxTree).print();