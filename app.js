var parsers = require('./parsers.js');


var availableParsers = [ new parsers.InfixParser() ];


// Main app

{
    var str = '2+3+8+9+15-10+4';

    for (var i = 0; i < availableParsers.length; i++) {
        var tree = availableParsers[i].parse(str);
        if (tree) {
            console.log(tree);
            break;
        }
    }
}