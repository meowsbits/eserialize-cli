#!/usr/bin/env node

'use strict';
const meow = require('meow');
require('process');
var path = require('path');
var chalk = require('chalk');
const ser = require('@etclabscore/eserialize')

const cli = meow(`
    Usage
      $ eserialize <input> <input> ...

    Examples

    $ eserialize-cli 0xdeadbeef 61
                    |
                     0xdeadbeef
                     0x:number 0xdeadbeef 3735928559
                     0x:string 0x30786465616462656566 ޭ��
                     0x:date   0xNaN 2088-05-20T21:55:59.000Z

                               | 
                                61
                                0x:number 0x3d 97
                                0x:string 0x3631 
                                0x:date   0x-10ed1e20 1970-01-01T00:01:37.000Z

`, {
    flags: {
        rainbow: {
            type: 'boolean',
            alias: 'r'
        }
    }
});

var basenameLen = function() {
    return path.basename(process.argv[1]).length;
};

var offset = function(i) {
    return " ".repeat(i);
};

var formatConversionLabel = function(label) {
    var ls = label.split(":");
    var ls1 = chalk.magenta(ls[0]);
    var ls2 = chalk.cyan(ls[1]);
    return ls1 + chalk.gray(":") + ls2;
}

var handleInputHex = function(o, input) {
    // console.log(process.argv0, process.argv[0], process.argv[1], process.argv[2]);
    o += 1;
    console.log(offset(o), "|");
    o += 1;
    console.log(offset(o), input);
    console.log(offset(o), formatConversionLabel("0x:number"), ser.numberToHex(+input), ser.hexToNumber(input));
    console.log(offset(o), formatConversionLabel("0x:string"), ser.stringToHex(input), ser.hexToString(input));
    console.log(offset(o), formatConversionLabel("0x:date  "), ser.dateToHex(new Date(input)), ser.hexToDate(input).toISOString());
    console.log();
}

var foo = function(input, flags) {
    var len = basenameLen();
    for (var i = 0; i < input.length; i++) {
        if (i > 0) {
            len += input[i - 1].length + 1;
        }
        handleInputHex(len, input[i]);
    }
};

foo(cli.input, cli.flags);