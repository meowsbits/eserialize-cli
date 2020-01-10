#!/usr/bin/env node

'use strict';
const meow = require('meow');
require('process');
var path = require('path');
var chalk = require('chalk');
const ser = require('@etclabscore/eserialize');

const cli = meow(`
    The eserialize CLI reads from stdin and either serializes or deserializes input.

    Usage:
    
      $ eserialize <input>
    
    Flags:
    
      -n  Do not colorize output.
      -s  Silence conversion format names (output values only).
    
    Basic examples:

        $ eserialize-cli 0xdeadbeef
        number = 3735928559
        string = ޭ��
        date = Thu May 20 2088 16:55:59 GMT-0500 (Central Daylight Time)
        
        $ eserialize-cli 1337
        (number) = 0x539
        
        $ eserialize-cli "my special note"
        (string) = 0x6d79207370656369616c206e6f7465

    Flag examples:

        $ eserialize-cli -s 0xdeadbeef
        3735928559
        ��
        Thu May 20 2088 16:55:59 GMT-0500 (Central Daylight Time)
`, {
    flags: {
        nocolor: {
            type: 'boolean',
            alias: 'n'
        },
        silenceFormats: {
            type: 'boolean',
            alias: 's'
        }
    }
});

var regHex = /^(0x|00)[a-f0-9]+$/im;
var regNumber = /^\d+$/m;

var isSerialializedFormat = function(input) {
    return (regHex.test(input));
};

var printPrettyKeyValue = function(k, v) {
    if (cli.flags.silenceFormats) {
        if (cli.flags.nocolor) {
            console.log(v);
        } else {
            console.log(chalk.cyan(v));
        }
    } else {
        if (cli.flags.nocolor) {
            console.log(k, "=", v);
        } else {
            console.log(chalk.magenta(k), "=", chalk.cyan(v));
        }
    }
};

var printDeserialized = function(input) {
    var num = ser.hexToNumber(input);
    printPrettyKeyValue("number", num);

    var str = ser.hexToString(input);
    if (str == "=") {
        str = "[invalid]";
    }
    printPrettyKeyValue("string", str);

    var dat = ser.hexToDate(input);
    printPrettyKeyValue("date", dat);
};

var isDateFormat = function(input) {
    var d = new Date(input);
    return d instanceof Date && !isNaN(d.valueOf());
};

var handleInput = function(input) {

    // Empty is noop, eg EOF, newlines.
    if (input.length == 0) {
        return;
    }

    // If appears serialized, deserialize it.
    if (isSerialializedFormat(input)) {
        printDeserialized(input);
        return;
    }

    // If unserialized, serialize it.

    // Number.
    if (regNumber.test(input)) {
        printPrettyKeyValue("(number)", ser.numberToHex(+input));
        return;
    }

    // Date.
    if (isDateFormat(input)) {
        var d = new Date(input);
        printPrettyKeyValue("(date)", ser.dateToHex(d));
        return;
    }

    // String.
    printPrettyKeyValue("(string)", ser.stringToHex(input));
};

var run = function(input, flags) {

    // Args were passed.
    if (input.length > 0) {
        handleInput(input[0]);
        return;
    }

    // No args were passed; read from stdin.
    // This will either read line-by-line from TTY stdin in an interactive way,
    // or, if stdin is piped, it will read that and then exit.
    process.stdin.pipe(require('split')()).on('data', function(data) {
        handleInput(data);

        // Append newline so there's a little room to breathe between conversions.
        console.log();
    });
};

run(cli.input, cli.flags);