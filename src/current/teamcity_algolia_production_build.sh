#!/bin/bash

# Set the site URL for Jekyll
site_url="https://www.cockroachlabs.com"
JEKYLL_ENV="production"
echo "Setting site domain to cockroachlabs.com and JEKYLL_ENV to production"

# Generate the _config_url.yml file
echo "url: ${site_url}" > _config_url.yml

# Function to build the site
function build {
  bundle exec jekyll build --trace --config _config_base.yml,$1
  if [[ $? != 0 ]]; then
    echo "Jekyll build failed."
    exit 1
  fi
}

# Install dependencies
echo "Installing dependencies..."
gem install bundler --silent
bundle install --quiet

# Build the site
echo "Building the site..."
build _config_cockroachdb.yml,_config_url.yml

# Copy necessary files for redirects and 404 handling
echo "Copying redirects and 404 page..."
cp _site/docs/_redirects _site/_redirects
cp _site/docs/404.html _site/404.html

# Build the Algolia index
echo "Building Algolia index..."
if [[ -z "${PROD_ALGOLIA_API_KEY}" ]]; then
  echo "Error: PROD_ALGOLIA_API_KEY is not set. Exiting..."
  exit 1
fi

ALGOLIA_API_KEY=${PROD_ALGOLIA_API_KEY} ALGOLIA_LOG_LEVEL=debug bundle exec jekyll algolia --config _config_base.yml,_config_url.yml --builds-config _config_cockroachdb.yml
if [[ $? != 0 ]]; then
  echo "Algolia index build failed."
  exit 1
fi

echo "Build completed successfully."
