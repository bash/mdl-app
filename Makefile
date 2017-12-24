SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

LESS_FILES := $(shell find less -name "*.less")
JS_FILES := $(shell find js -name "*.js")

# List of polyfills to include (sorted manually)
POLYFILLS := polyfills/fetch.js polyfills/string.js

ROLLUP_CONFIG := .rollup.config.js

.PHONY: all clean lint deps

all: build/css/app.css build/js/app.js build/js/polyfills.js build/index.html

release:
	$(MAKE) clean
	BUILD_MODE=release $(MAKE)

clean:
	rm -rf build/

deps:
	yarn install

lint:
	standard 'js/**/*.js'
	lessc --lint less/app.less

build/css/app.css: $(LESS_FILES)
	@mkdir -p $(@D)
ifeq ($(BUILD_MODE), release)
	lessc less/app.less | postcss -u autoprefixer -u cssnano -o $@
else
	lessc less/app.less | postcss -u autoprefixer -o $@
endif

build/js/app.js: $(JS_FILES)
	@mkdir -p $(@D)
	rollup -c $(ROLLUP_CONFIG) -o $@ js/app.js

build/js/polyfills.js: $(POLYFILLS)
	@mkdir -p $(@D)
	uglifyjs $+ -o $@

build/index.html: index.html
	@mkdir -p $(@D)
	cp $+ $@
