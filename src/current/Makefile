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

# Jekyll-Algolia Self-Contained Pipeline
# Extract and load Algolia records from _site with exact objectID generation

# Configuration
SITE_DIR_ALGOLIA ?= _site
STAGING_INDEX ?= stage_cockroach_docs
RECORDS_FILE ?= extracted_records.jsonl

# Check required environment variables for Algolia
check-algolia-env:
	@echo "🔧 Checking Algolia environment variables..."
	@test -n "$(ALGOLIA_APP_ID)" || (echo "❌ ALGOLIA_APP_ID not set" && exit 1)
	@test -n "$(ALGOLIA_STAGE_ADMIN_KEY)" || (echo "❌ ALGOLIA_STAGE_ADMIN_KEY not set" && exit 1)
	@echo "✅ Algolia environment variables set"

# Extract records from _site
algolia-extract:
	@echo "🔄 Extracting records from $(SITE_DIR_ALGOLIA)..."
	python3 site_to_algolia.py --site-dir $(SITE_DIR_ALGOLIA)
	@echo "✅ Extraction complete"

# Extract limited number of files for testing
algolia-extract-sample:
	@echo "🔄 Extracting sample records (100 files)..."
	python3 site_to_algolia.py --site-dir $(SITE_DIR_ALGOLIA) --max-files 100
	@echo "✅ Sample extraction complete"

# Load records to staging index
algolia-load: check-algolia-env
	@echo "📤 Loading records to $(STAGING_INDEX)..."
	python3 load_and_validate.py \
		--app-id "$(ALGOLIA_APP_ID)" \
		--admin-key "$(ALGOLIA_STAGE_ADMIN_KEY)" \
		--index "$(STAGING_INDEX)" \
		--records "$(RECORDS_FILE)"
	@echo "✅ Loading complete"

# Load and validate against production (optional)
algolia-load-and-validate: check-algolia-env
	@echo "📤 Loading and validating against production..."
	python3 load_and_validate.py \
		--app-id "$(ALGOLIA_APP_ID)" \
		--admin-key "$(ALGOLIA_STAGE_ADMIN_KEY)" \
		--index "$(STAGING_INDEX)" \
		--records "$(RECORDS_FILE)" \
		--validate-prod "cockroachcloud_docs" \
		--prod-read-key "$(ALGOLIA_PROD_READ_KEY)"
	@echo "✅ Loading and validation complete"

# Test UUID algorithm
algolia-test-uuid:
	@echo "🧪 Testing UUID algorithm..."
	python3 algolia_uuid.py
	@echo "✅ UUID test complete"

# Full Algolia pipeline: extract and load
algolia-all: algolia-extract algolia-load
	@echo "🎯 Complete Algolia pipeline finished"

# Test Algolia pipeline with sample
algolia-test: algolia-extract-sample algolia-load
	@echo "🎯 Test Algolia pipeline finished"

# Clean Algolia generated files
algolia-clean:
	rm -f $(RECORDS_FILE) test_*.jsonl focused_test_records.jsonl
	@echo "🧹 Cleaned Algolia generated files"

# Show Algolia help
algolia-help:
	@echo "Jekyll-Algolia Self-Contained Pipeline"
	@echo ""
	@echo "Available Algolia targets:"
	@echo "  algolia-extract           - Extract all records from _site"
	@echo "  algolia-extract-sample    - Extract sample (100 files) for testing"
	@echo "  algolia-load              - Load records to staging index"
	@echo "  algolia-load-and-validate - Load records and validate against production"
	@echo "  algolia-test-uuid         - Test UUID algorithm implementation"
	@echo "  algolia-all               - Full pipeline (extract + load)"
	@echo "  algolia-test              - Test pipeline (sample extract + load)"
	@echo "  algolia-clean             - Remove generated files"
	@echo "  algolia-help              - Show this help"
	@echo ""
	@echo "Required environment variables:"
	@echo "  ALGOLIA_APP_ID         - Algolia application ID"
	@echo "  ALGOLIA_STAGE_ADMIN_KEY - Algolia admin key for staging"
	@echo ""
	@echo "Optional environment variables:"
	@echo "  ALGOLIA_PROD_READ_KEY  - Production read key (for validation)"
	@echo "  SITE_DIR_ALGOLIA       - Path to _site directory (default: _site)"
	@echo "  STAGING_INDEX          - Staging index name (default: stage_cockroach_docs)"
	@echo "  RECORDS_FILE           - Records file name (default: extracted_records.jsonl)"
	@echo ""
	@echo "Examples:"
	@echo "  make algolia-test              # Test with sample"
	@echo "  make algolia-all               # Full extraction and loading"
	@echo "  make algolia-load-and-validate # Load with production validation"

.PHONY: check-algolia-env algolia-extract algolia-extract-sample algolia-load algolia-load-and-validate algolia-test-uuid algolia-all algolia-test algolia-clean algolia-help
