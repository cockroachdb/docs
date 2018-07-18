# Copyright 2016 The Cockroach Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied. See the License for the specific language governing
# permissions and limitations under the License.

# Install all our ruby dependencies in an isolated environment. We
# depend on gem being installed globally, but not bundler. (Go
# developers sometimes manage to install
# https://github.com/golang/tools/tree/master/cmd/bundle in a location
# that conflicts with the ruby tool of the same name)
export GEM_HOME := vendor
export PATH := $(GEM_HOME)/bin:$(PATH)

# HACK: Make has a fast path and a slow path for command execution,
# but the fast path uses the PATH variable from when make was started,
# not the one we set on the previous line. In order for the above
# line to have any effect, we must force make to always take the slow path.
# Setting the SHELL variable to a value other than the default (/bin/sh)
# is one way to do this globally.
# http://stackoverflow.com/questions/8941110/how-i-could-add-dir-to-path-in-makefile/13468229#13468229
export SHELL := $(shell which bash)
ifeq ($(SHELL),)
$(error bash is required)
endif

.PHONY: all
all: bootstrap

.PHONY: serve
serve: bootstrap
	bundle exec jekyll serve --incremental

.PHONY: test
test: bootstrap
	go get -u github.com/cockroachdb/htmltest
	htmltest

bootstrap: Gemfile.lock
	gem install bundler
	bundle install
	touch $@

.PHONY: sqlfmt
sqlfmt:
	go run ./scripts/sqlfmt.go
