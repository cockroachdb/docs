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
# that conflicts with the ruby tool of the same name.)
# Note that we also amend the path to include /usr/local/opt/ruby/bin, which
# is where Homebrew will install a more up-to-date version of Ruby on macOS.
export GEM_HOME := vendor
export PATH := $(GEM_HOME)/bin:$(HOME)/.rbenv/shims:/usr/local/opt/ruby/bin:$(PATH)
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

comma := ,
extra-config := $(if $(JEKYLLCONFIG),$(comma)$(JEKYLLCONFIG))

jekyll-action := build

GITHOOKSDIR := .git/hooks
GITHOOKS := $(subst githooks/,$(GITHOOKSDIR)/,$(wildcard githooks/*))
$(GITHOOKSDIR)/%: githooks/%
	@rm -f $@
	@mkdir -p $(dir $@)
	@ln -s ../../$(basename $<) $(dir $@)

.PHONY: cockroachdb-build
cockroachdb-build: bootstrap
	bundle exec jekyll $(jekyll-action) --incremental --trace --config _config_base.yml,_config_cockroachdb.yml$(extra-config) $(JEKYLLFLAGS)

.PHONY: cockroachdb
cockroachdb: jekyll-action := serve --port 4000
cockroachdb: bootstrap $(GITHOOKS)
	bundle exec jekyll $(jekyll-action) --incremental --trace --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml$(extra-config) $(JEKYLLFLAGS)

.PHONY: standard
standard: cockroachdb

# turn off caching remote_include content
.PHONY: no-remote-cache
no-remote-cache: bootstrap
	bundle exec jekyll $(jekyll-action) --incremental --trace --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_no_remote_cache.yml,$(extra-config) $(JEKYLLFLAGS)

# output the performance stats for the build using the --profile option
.PHONY: profile
profile: bootstrap
	bundle exec jekyll $(jekyll-action) --incremental --profile --trace --config _config_base.yml,_config_cockroachdb.yml$(extra-config) $(JEKYLLFLAGS)


.PHONY: test
test:
	# Docker must be running locally for this to work.
	./netlify/local
	htmltest

.PHONY: linkcheck
linkcheck: cockroachdb-build
	htmltest -s

.PHONY: vale
vale:
	vale $(subst $(\n), $( ), $(shell git status --porcelain | cut -c 4- | egrep "\.md"))

.PHONY: vendor
vendor:
	gem install bundler
	bundle install

bootstrap: Gemfile | vendor
	touch $@

clean:
	rm -rf vendor
	rm -rf _site
	rm -rf .jekyll-cache
	rm -f Gemfile.lock

clean-site:
	rm -rf _site

clean-cache:
	rm -rf .jekyll-cache

# =============================================================================
# Docker-based builds
# =============================================================================
# These targets use the hermetic docs-builder Docker image for consistent builds
# across all environments. See ci/README.md for more details.

DOCKER_REGISTRY := us-docker.pkg.dev/release-notes-automation-stag/docs-builder
DOCKER_IMAGE := docs-builder
DOCKER_TAG := latest
# Run as current user to avoid permission issues with mounted volumes
DOCKER_USER := $(shell id -u):$(shell id -g)

# Build the Docker image locally
.PHONY: docker-build
docker-build:
	docker build -t $(DOCKER_IMAGE):local .

# Serve documentation using Docker (with live reload)
.PHONY: docker-serve
docker-serve:
	docker run -it --rm \
		--dns 8.8.8.8 \
		--user $(DOCKER_USER) \
		-p 4000:4000 \
		-v "$(CURDIR)":/docs \
		-e JEKYLL_ENV=development \
		-e HOME=/tmp \
		$(DOCKER_IMAGE):local \
		bundle exec jekyll serve --host 0.0.0.0 --port 4000 --incremental --trace \
		--config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml

# Build documentation using Docker (no serve)
.PHONY: docker-build-site
docker-build-site:
	docker run -it --rm \
		--dns 8.8.8.8 \
		--user $(DOCKER_USER) \
		-v "$(CURDIR)":/docs \
		-e JEKYLL_ENV=production \
		-e HOME=/tmp \
		$(DOCKER_IMAGE):local \
		bundle exec jekyll build --trace \
		--config _config_base.yml,_config_cockroachdb.yml

# Interactive shell in the Docker container
.PHONY: docker-shell
docker-shell:
	docker run -it --rm \
		--dns 8.8.8.8 \
		--user $(DOCKER_USER) \
		-v "$(CURDIR)":/docs \
		-e HOME=/tmp \
		$(DOCKER_IMAGE):local \
		/bin/bash

# Pull the latest pre-built image from GCP Artifact Registry
.PHONY: docker-pull
docker-pull:
	docker pull $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
	docker tag $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_IMAGE):local

# Push image to GCP Artifact Registry (requires gcloud auth)
.PHONY: docker-push
docker-push:
	docker tag $(DOCKER_IMAGE):local $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
