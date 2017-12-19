# mdl-app

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![built-with-make](https://img.shields.io/badge/build%20system-make-brightgreen.svg)](Makefile)

## Install Dependencies
```bash
make deps
```

## Building
```bash
make
```

## Building for production
Setting the environment variable NODE_ENV to production will disable sourcmaps and cause the javascript to be minified.
It's generally a good idea to run `make clean` before building for production.

```bash
make clean
BUILD_MODE=release make
```

## Cleanup built files
```bash
make clean
```
