/**
 * @author Fernando Gabrieli - fgabrieli at gmail
 */

var parsers = require('./parsers.js');

var availableParsers = [ new parsers.GParser(), new parsers.InfixParser() ];


// Main app

{
    //var str = '2+3+8';
    var str = 'for(i=0;i<10;i++)';
    //var str = 'i--xwe';

    var gParser = new parsers.GParser();
    var tree = gParser.parse(str);
    console.log(tree);
    
//    for (var i = 0; i < availableParsers.length; i++) {
//        var tree = availableParsers[i].parse(str);
//        if (tree) {
//            console.log(tree);
//            break;
//        }
//    }
}