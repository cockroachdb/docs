#!/bin/bash

# Populate the site_url to be used by jekyll for generating sidebar and search links
site_url="${DEPLOY_PRIME_URL}" # this is set by Netlify for the site
echo "site_url defaulted to Netlify DEPLOY_PRIME_URL: ${site_url}"
JEKYLL_ENV="preview"
if [[ "$CONTEXT" = "production" ]]; then
	site_url="https://crdbdocsdev.netlify.app" # dev site production env url
    echo "site_url updated to: ${site_url}"
	JEKYLL_ENV="production" # even in the dev repo/site, we'll maintain production vs preview builds; these are Netlify designations
fi;
echo "url: ${site_url}" > _config_url.yml

# Builds the site
function build {
	bundle exec jekyll build --trace --config _config_base-dev.yml,$1 #adds parameters from build call, _config_cockroachdb.yml,_config_url.yml
	if [[ $? != 0 ]]; then
	  exit 1
	fi;
}
gem install bundler --silent
bundle install --quiet
build _config_cockroachdb.yml,_config_url.yml # _config_url.yml is created earlier in the build process

# Copy static files
cp _site/docs/_redirects _site/_redirects
cp _site/docs/404.html _site/404.html

# Set up htmltest
# curl -s https://htmltest.wjdp.uk | bash
# if [[ $? != 0 ]]; then
#	echo "Failed to install htmltest"
#	exit 1
# fi;

# ./bin/build.sh>/dev/null 2>&1 # does not exist in the repo; likely has no effect, with error always suppressed

# Run htmltest to check external links on scheduled nightly runs
# (see .github/workflows/nightly.yml)
if [[ "$INCOMING_HOOK_TITLE" = "nightly" ]]; then
	./bin/htmltest
	if [[ $? != 0 ]]; then
          exit 1
        fi;
fi;

# Run htmltest, but skip checking external links to speed things up
# ./bin/htmltest --skip-external
# if [[ $? != 0 ]]; then
#   exit 1
# fi;

# Former Algolia indexing step removed intentionally

# Run tests defined in __tests__ # excluding for dev
# ./node_modules/.bin/jest
exit $?
