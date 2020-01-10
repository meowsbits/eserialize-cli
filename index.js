#!/usr/bin/env node

'use strict';
const meow = require('meow');
require('process');
var path = require('path');
var chalk = require('chalk');
const ser = require('@etclabscore/eserialize');

const cli = meow(`
    The eserialize CLI reads from stdin and either serializes or deserializes input.

    Usage
      $ eserialize <input>

    Examples

    $ eserialize-cli 0xdeadbeef

    $ eserialize-cli "my special note"

    $ echo 42 | eserialize-cli

    $ eserialize-cli
    42
    (number) = 0x2a
`, {
    flags: {
        nocolor: {
            type: 'boolean',
            alias: 'n'
        }
    }
});

var regHex = /^(0x|00)[a-f0-9]+$/im;
var regNumber = /^\d+$/m;

var isSerialializedFormat = function(input) {
    return (regHex.test(input));
};

var stdOutPrettyKeyValue = function(k, v) {
    if (!cli.flags.nocolor) {
        console.log(chalk.magenta(k), "=", chalk.cyan(v));
    } else {
        console.log(k, "=", v);
    }
};

var deserialize = function(input) {
    var num = ser.hexToNumber(input);
    stdOutPrettyKeyValue("number", num);

    var str = ser.hexToString(input);
    stdOutPrettyKeyValue("string", str);

    var dat = ser.hexToDate(input);
    stdOutPrettyKeyValue("date", dat);
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
        deserialize(input);
        return;
    }

    // If unserialized, serialize it.

    // Number.
    if (regNumber.test(input)) {
        stdOutPrettyKeyValue("(number)", ser.numberToHex(+input));
        return;
    }

    // Date.
    if (isDateFormat(input)) {
        var d = new Date(input);
        stdOutPrettyKeyValue("(date)", ser.dateToHex(d));
        return;
    }

    // String.
    stdOutPrettyKeyValue("(string)", ser.stringToHex(input));
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
    process.stdin.pipe(require('split')()).on('data', handleInput);
};

run(cli.input, cli.flags);