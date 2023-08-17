#!/bin/bash

# Populate the site_url to be used by jekyll for generating sidebar and search links
site_url="${DEPLOY_PRIME_URL}"
JEKYLL_ENV="preview"
if [[ "$CONTEXT" = "production" ]]; then
	site_url="https://www.cockroachlabs.com"
	JEKYLL_ENV="production"
fi;

echo "url: ${site_url}" > _config_url.yml

function build {
	bundle exec jekyll build --trace --config _config_base.yml,$1
	if [[ $? != 0 ]]; then
	  exit 1
	fi;
}

gem install bundler --silent
bundle install --quiet
build _config_url.yml

# Set up htmltest

curl -s https://htmltest.wjdp.uk | bash
if [[ $? != 0 ]]; then
	echo "Failed to install htmltest"
	exit 1
fi;
./bin/build.sh>/dev/null 2>&1

# Run htmltest, but skip checking external links to speed things up
./bin/htmltest --skip-external
exit $?
