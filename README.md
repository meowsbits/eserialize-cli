# eserialize-cli

CLI interface for Ethereum serialization.

## Install

__NPM__ :construction:

```
npm install -g @etclabscore/eserialize-cli
```

__From source__

```
> git clone https://github.com/etclabscore/eserialize-cli.git
> cd eserialize-cli
> npm install
> npm link
> eserialize-cli --help
```

## Usage

This program deserializes a serialized value, and vice versa.
The regular expression for checking if a given value is serialized is `/^(0x|00)[a-f0-9]+$/im`, 
which means that a serialized value must begin with `0x` or `00` and contain only valid hexadecimal characters (0-9, a-f) thereafter, case insensitive.

### Flags

- `-n`: Do not colorize output.
- `-s`: Silence conversion format names (output values only).

#### Argument value
```
> eserialize-cli 0x3d
number = 61
string = [invalid]
date = Wed Dec 31 1969 18:01:01 GMT-0600 (Central Standard Time)

> eserialize-cli 1337
(number) = 0x539

> eserialize-cli "$(date)"
(date) = 0x5e18952d

> eserialize-cli "my string of words"
(string) = 0x6d7920737472696e67206f6620776f726473

```

#### Piped stdin
```
> echo 0x3df | eserialize-cli 
number = 991
string = [invalid]
date = Wed Dec 31 1969 18:16:31 GMT-0600 (Central Standard Time)

> echo 1337 | eserialize-cli 
(number) = 0x539

> echo "$(date)" | eserialize-cli 
(date) = 0x5e18961b

> echo "my string of words" | eserialize-cli 
(string) = 0x6d7920737472696e67206f6620776f726473
```

#### (Interactive) TTY stdin lines

```
> eserialize-cli 
0x3df
number = 991
string = [invalid]
date = Wed Dec 31 1969 18:16:31 GMT-0600 (Central Standard Time)

1337
(number) = 0x539

"my string of words"
(string) = 0x226d7920737472696e67206f6620776f72647322

^C
```

