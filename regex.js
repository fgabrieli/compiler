function TreeNode(type, data) {
    this.type = type ? type : '';

    this.data = data ? data : {};

    // i leave this exposed for debugging purposes
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

                    // only for the case when the regex has one node for it's
                    // syntax tree, say "a|b"
                    parent = prevNode;
                } else {
                    parent = new TreeNode('empty'); // connect pair of nodes
                    parent.nodes.push(prevNode, node);
                    prevNode = parent;
                }

                addNode = false;
            }

            char = nextChar();
        } while (char);

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

// NFA's have states (which are actually nodes of a graph since the nfa itself
// is a graph)
function State(type, char) {
    this.type = type;

    this.char = char ? char : false;

    // i leave this exposed for debugging purposes
    this.states = [];

    this.isEClosure = function() {
        return this.type === 'e-closure';
    }

    this.getNext = function() {
        return this.states;
    }
    
    this.hasNext = function() {
        return this.states && this.states.length > 0;
    }

    this.print = function() {
        console.log(this);

        for (var i = 0; i < this.states.length; i++) {
            this.print.call(this.states[i]);
        }
    }

    this.test = function(str) {
        console.log('checking state', this);
        
        if (str.length == 0)
            return true;

        if (this.isEClosure() && this.hasNext()) {
            var nextStates = this.getNext();
            for (var j = 0; j < nextStates.length; j++) {
                if(nextStates[j].test(str)) {
                    return true;
                }
            }
        }

        if (this.char == str[0]) {
            var nextStates = this.getNext();
            for (var j = 0; j < nextStates.length; j++) {
                if (nextStates[j].test(str.substr(1))) {
                    return true;
                }
            }
        }

        return false;
    }
}

function NFA() {
    var nfa = false;

    this.createFromSyntaxTree = function(syntaxTree) {
        // instead of an initial state i just set an e-closure
        nfa = new State('e-closure');

        addStates(nfa, syntaxTree);

        return nfa;
    }
    
    this.test = function(str) {
        return nfa.test(str);
    }

    /**
     * @param syntax
     *            tree root node
     */
    function addStates(state, node) {
        var newState = false;

        if (node.type == 'or') {
            newState = or(state, node.data.opn1, node.data.opn2);
        } else if (node.type == 'add') {
            newState = add(state, node.data.opn1);
        } else if (node.type == 'kleene') {
            newState = kleene(state, node.data.opn1);
        }

        if (newState) {
            for (var i = 0; i < node.nodes.length; i++) {
                addStates(newState, node.nodes[i]);
            }
        } else {
            throw 'Invalid state in addStates';
        }
    }

    /**
     * Create NFA states for OR operation
     */
    function or(prevState, opn1, opn2) {
        var e1 = new State('e-closure');
        var e2 = new State('e-closure');

        prevState.states.push(e1, e2);

        var stateOpn1 = new State('alphabet', opn1);
        e1.states.push(stateOpn1);

        var stateOpn2 = new State('alphabet', opn2);
        e2.states.push(stateOpn2);

        var e3 = new State('e-closure');
        stateOpn1.states.push(e3);
        stateOpn2.states.push(e3);
        
        e3.states.push(prevState);

        return e3;
    }
}

var parser = new RegexParser();
// var tree = parser.parse('a|bc+d*');

var syntaxTree = parser.parse('t|q');

// parser.print(syntaxTree);

var nfa = new NFA();
nfa.createFromSyntaxTree(syntaxTree);

console.log(nfa.test('tqtqtqtqtqttqtq'));

