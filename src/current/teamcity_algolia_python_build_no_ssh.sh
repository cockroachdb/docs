#!/bin/bash

# TeamCity Algolia Python Build Script (No SSH)
# New Python-based indexing system replacing Jekyll Algolia gem

set -e  # Exit on any error

echo "=== CockroachDB Documentation Algolia Python Indexing ==="

# Set Jekyll environment
export JEKYLL_ENV="production"
echo "Setting JEKYLL_ENV to production"

# Set the site URL for Jekyll
site_url="https://www.cockroachlabs.com"
echo "Setting site domain to cockroachlabs.com"

# Generate the _config_url.yml file
echo "url: ${site_url}" > _config_url.yml

# Install dependencies
echo "Installing Ruby dependencies..."
gem install bundler --silent
bundle install --quiet

# Build the Jekyll site
echo "Building Jekyll site..."
bundle exec jekyll build --trace --config _config_base.yml,_config_cockroachdb.yml,_config_url.yml
if [[ $? != 0 ]]; then
  echo "Jekyll build failed."
  exit 1
fi

echo "Jekyll build completed successfully."

# Copy necessary files for redirects and 404 handling
echo "Copying redirects and 404 page..."
cp _site/docs/_redirects _site/_redirects
cp _site/docs/404.html _site/404.html

# Run Python Algolia indexing
echo "Starting Python Algolia indexing..."
echo "Using wrapper script: algolia_indexing_wrapper.py"

python3 algolia_indexing_wrapper.py
if [[ $? != 0 ]]; then
  echo "Algolia indexing failed."
  exit 1
fi

echo "=== Build completed successfully! ==="