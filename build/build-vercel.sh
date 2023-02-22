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

# Transform API spec for API docs generation
pushd api/
npx swagger2openapi api-spec.json > spec_30.json
npx snippet-enricher-cli --targets="shell_curl" --input=spec_30.json > spec_30_enriched.json
rm spec_30.json
popd

gem install bundler --silent
bundle install --quiet
build _config_cockroachdb.yml,_config_url.yml

cp _site/docs/_redirects _site/_redirects
cp _site/docs/404.html _site/404.html

rm _site/docs/dev _site/docs/stable

ls -l _site/docs/dev
ls -l _site/docs/stable

cp -r _site/docs/v22.2 _site/docs/dev
cp -r _site/docs/v22.2 _site/docs/stable

# Set up htmltest

curl -s https://htmltest.wjdp.uk | bash
if [[ $? != 0 ]]; then
	echo "Failed to install htmltest"
	exit 1
fi;
./bin/build.sh>/dev/null 2>&1

# Run htmltest to check external links on scheduled nightly runs
# (see .github/workflows/nightly.yml)

if [[ "$INCOMING_HOOK_TITLE" = "nightly" ]]; then
	./bin/htmltest
	if [[ $? != 0 ]]; then
          exit 1
        fi;
fi;

# Run htmltest, but skip checking external links to speed things up
./bin/htmltest --skip-external
if [[ $? != 0 ]]; then
  exit 1
fi

# Run tests defined in __tests__
./node_modules/.bin/jest
exit $?
