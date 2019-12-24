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

    $ eserialize-cli 0xdeadbeef 42
                     |
                     0x:Number 0xdeadbeef 3735928559
                     0x:String 0x30786465616462656566 ޭ��
                     0x:Date   0xNaN 2088-05-20T21:55:59.000Z

                                |
                                0x:Number 0x2a 66
                                0x:String 0x3432
                                0x:Date   0x876e8b60 1970-01-01T00:01:06.000Z
`, {
    flags: {
        nocolor: {
            type: 'boolean',
            alias: 'n'
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
    if ( cli.flags.nocolor) {
        return label;
    }
    var ls = label.split(":");
    var ls1 = chalk.magenta(ls[0]);
    var ls2 = chalk.cyan(ls[1]);
    return ls1 + chalk.gray(":") + ls2;
}

function formatToHex(input, output) {
    if ( cli.flags.nocolor ) {
        return output;
    }
    if (input === output) {
        return chalk.underline(input);
    }
    return chalk.magenta(output);
}

function formatToVal(input, output) {
    if ( cli.flags.nocolor ) {
        return output;
    }
    return chalk.cyan(output);
}

var handleInputHex = function(o, input) {
    o += 2; // space + index0
    console.log();
    console.log(offset(o), formatConversionLabel("0x:Number"), formatToHex(input, ser.numberToHex(+input)), formatToVal(input, ser.hexToNumber(input) ));
    console.log(offset(o), formatConversionLabel("0x:String"), formatToHex(input, ser.stringToHex(input)), formatToVal(input, ser.hexToString(input) ));

    // FIXME
    // Date (HexTo) throws 'Invalid time value' sometimes.
    // Reproduce with 0x74657374696e67737472696e67
    var d = "";
    var outputd = new Date();
    var gotd;
    try {
        d = new Date(input) || true;
    } catch (err) {
        // noop
    }
    try {
        gotd = ser.hexToDate(input);
    } catch {
        // noop
    }
    if (typeof gotd != undefined) {
        gotd = new Date();
    }
    console.log(offset(o), formatConversionLabel("0x:Date  "), formatToHex(input, ser.dateToHex(d)), formatToVal(input, outputd.toISOString() ));
}

var foo = function(input, flags) {
    var len = basenameLen();
    for (var i = 0; i < Object.keys( cli.flags ).length; i++) {
        if (cli.flags[Object.keys(cli.flags)[i]]) {
            len += 3;
        }
    }
    for (var i = 0; i < input.length; i++) {
        if (i > 0) {
            len += input[i - 1].length + 1;
        }
        handleInputHex(len, input[i]);
    }
    console.log();
};

foo(cli.input, cli.flags);
