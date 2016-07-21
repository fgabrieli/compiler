/**
 * Regular expression compiler
 * 
 * @author Fernando Gabrieli, fgabrieli at github
 */

//function RegexParser() {
//    var stack = [];
//
//    var tree = {};
//
//    var str = '';
//
//    this.parse = function(strToParse) {
//        if (typeof strToParse === 'undefined' || strToParse.length === 0) {
//            throw 'Regex to be parsed is not valid';
//        }
//
//        init(strToParse);
//
//        var parent = false, prevNode = false, addNode = false;
//        var char = nextChar();
//        do {
//            if (this.isOr(char)) {
//                node = or();
//
//                addNode = true;
//            } else if (this.isAdd(char)) {
//                node = add();
//
//                addNode = true;
//            } else if (this.isKleene(char)) {
//                node = kleene();
//
//                addNode = true;
//            } else {
//                stack.push(char);
//            }
//
//            if (addNode) {
//                if (!prevNode) {
//                    prevNode = node;
//
//                    // only for the case when the regex has one node for it's
//                    // syntax tree, say "a|b"
//                    parent = prevNode;
//                } else {
//                    parent = new TreeNode('empty'); // connect pair of nodes
//                    parent.nodes.push(prevNode, node);
//                    prevNode = parent;
//                }
//
//                addNode = false;
//            }
//
//            char = nextChar();
//        } while (char);
//
//        tree = parent;
//
//        return tree;
//    }
//
//    function init(strToParse) {
//        str = strToParse;
//        charIndex = 0;
//        stack = [];
//    }
//
//    var charIndex = 0;
//
//    function nextChar() {
//        return charIndex < str.length ? str[charIndex++] : false;
//    }
//
//    function or() {
//        return new TreeNode('or', {
//            opn1 : stack.shift(),
//            opn2 : nextChar()
//        });
//    }
//
//    function add() {
//        return new TreeNode('add', {
//            opn1 : stack.shift()
//        })
//    }
//
//    function kleene() {
//        return new TreeNode('kleene', {
//            opn1 : stack.shift()
//        })
//    }
//}


var extend = require('extend');

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

var regexParser = new RegexParser();

var symbolTable = [];
var lastSymbol = 0;

function Symbol(data) {
    symbolTable.push(this);

    this.id = '<s' + lastSymbol++ + '>';

    this.data = data;
}

function getSymbol(lexeme) {
    var entry = parseFloat(lexeme.substr(2).replace('>', ''));
    
    return symbolTable[entry];
}

function LexicalAnalyzer(strToAnalyze) {
    var str = strToAnalyze;

    this.analyze = function() {
        analyzeAdd.apply(this);

        analyzeOr.apply(this);
        
        analyzeKleene.apply(this);
        
        return str;
    }

    var currentIdx = 0;

    function analyzeAdd() {
        resetIdx();

        do {
            if (RegexParser.prototype.isAdd(this.lexeme())) {
                this.prev();
                var regex = this.lexeme();

                this.next();
                regex += this.lexeme();

                var symbol = new Symbol(regex)
                str = str.replace(regex, symbol.id);

                return analyzeAdd.apply(this);
            }
        } while (this.next());
    }
    
    function analyzeOr() {
        resetIdx();

        do {
            if (RegexParser.prototype.isOr(this.lexeme())) {
                this.prev();
                var regex = this.lexeme();

                this.next();
                regex += this.lexeme();
                
                this.next();
                regex += this.lexeme();

                console.log('regex', regex);

                var symbol = new Symbol(regex)
                str = str.replace(regex, symbol.id);

                return analyzeOr.apply(this);
            }
        } while (this.next());
    }
    
    function analyzeKleene() {
        resetIdx();

        do {
            if (RegexParser.prototype.isKleene(this.lexeme())) {
                this.prev();
                var regex = this.lexeme();

                this.next();
                regex += this.lexeme();

                console.log('regex', regex);

                var symbol = new Symbol(regex)
                str = str.replace(regex, symbol.id);

                return analyzeKleene.apply(this);
            }
        } while (this.next());
    }

    function resetIdx() {
        currentIdx = 0;
    }

    this.prev = function() {
        if (currentIdx === 0)
            return false;

        if (str[--currentIdx] == '>') {
            while (str[--currentIdx] != '<') {
            }
            ;
        }

        // console.log('prev', str.substr(currentIdx), currentIdx);

        return true;
    }

    this.next = function() {
        if (currentIdx > str.length)
            return false;

        if (str[currentIdx++] == '<') {
            while (str[currentIdx++] != '>') {
            }
            ;
        }

        // console.log('next', str.substr(currentIdx), currentIdx);

        return true;
    }

    this.lexeme = function() {
        var i = currentIdx;

        var start = i;

        if (str[i++] == '<') {
            while (str[i++] != '>') {
            }
            ;
        }

        return str.substr(start, i - start);
    }
    
    this.isSymbol = function() {
        return str[currentIdx] == '<';
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

        var lexAnalyzer = new LexicalAnalyzer(strToParse);
        
        var parent = false, prevNode = false, addNode = false;

        do {
            var lexeme = lexAnalyzer.lexeme();

            if (lexAnalyzer.isSymbol()) {
                node = new RegexParser().parse(getSymbol(lexeme).data);
            } else if (this.isOr(lexeme)) {
                node = or(lexAnalyzer);

                addNode = true;
            } else if (this.isAdd(lexeme)) {
                node = add(lexAnalyzer);

                addNode = true;
            } else if (this.isKleene(lexeme)) {
                node = kleene(lexAnalyzer);

                addNode = true;
            } else {
                stack.push(lexeme);
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

        } while(lexAnalyzer.next());
        
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

    function or(lexAnalyzer) {
        lexAnalyzer.next();
        
        return new TreeNode('or', {
            opn1 : stack.shift(),
            opn2 : lexAnalyzer.lexeme()
        });
    }

    function add(lexAnalyzer) {
        return new TreeNode('add', {
            opn1 : stack.shift()
        })
    }

    function kleene(lexAnalyzer) {
        return new TreeNode('kleene', {
            opn1 : stack.shift()
        })
    }
}


extend(RegexParser.prototype, {
    /**
     * Abstract
     */
    isKleene : function(c) {
        return c === '*';
    },

    /**
     * Abstract
     */
    isAdd : function(c) {
        return c === '+';
    },

    /**
     * Abstract
     */
    isOr : function(c) {
        return c === '|';
    }
})

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

    /**
     * Print tree for the parsed regex.
     */
    var printed = [];

    this.print = function() {
        printed = [];

        printStates(this);
    }

    function printStates(state) {
        if (printed.indexOf(state) !== -1)
            return;

        console.log(state.type, state.char, state.states);

        printed.push(state);

        for (var i = 0; i < state.states.length; i++) {
            printStates(state.states[i]);
        }
    }

    this.test = function(str) {
        console.log('checking state', this);

        if (str.length == 0)
            return true;

        if (this.isEClosure() && this.hasNext()) {
            var nextStates = this.getNext();
            for (var j = 0; j < nextStates.length; j++) {
                if (nextStates[j].test(str)) {
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

    this.getNfa = function() {
        return nfa;
    }

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
        var lastState = false;

        if (node.type == 'or') {
            lastState = or(state, node.data.opn1, node.data.opn2);
        } else if (node.type == 'add') {
            lastState = add(state, node.data.opn1);
        } else if (node.type == 'kleene') {
            lastState = kleene(state, node.data.opn1);
        } else {
            lastState = state;
        }

        for (var i = 0; i < node.nodes.length; i++) {
            lastState = addStates(lastState, node.nodes[i]);
        }

        return lastState;
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

    function kleene(prevState, opn1) {
        var opnState = new State('alphabet', opn1);
        prevState.states.push(opnState);

        var e1 = new State('e-closure');
        opnState.states.push(e1);

        var e2 = new State('e-closure');
        prevState.states.push(e2);

        e1.states.push(prevState);

        return e1;
    }

    function add(prevState, opn1) {
        var opnState = new State('alphabet', opn1);
        prevState.states.push(opnState);

        var e1 = new State('e-closure');
        e1.states.push(prevState);

        opnState.states.push(e1);

        return e1;
    }
}

var regex = new LexicalAnalyzer('a|b');
regexStr = regex.analyze();

var parser = new RegexParser();
var syntaxTree = parser.parse(regexStr);
console.log(syntaxTree);
//syntaxTree.print();

/*
 * var nfa = new NFA(); nfa.createFromSyntaxTree(syntaxTree);
 * 
 * console.log(nfa.getNfa());
 * 
 * console.log(nfa.test('qtx'));
 */
