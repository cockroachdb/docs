#!/bin/bash

# TeamCity Algolia Python Build Script (No SSH)
# New Python-based indexing system replacing Jekyll Algolia gem

set -e  # Exit on any error

echo "=== CockroachDB Documentation Algolia Python Indexing ==="

# Set the site URL for Jekyll
site_url="https://www.cockroachlabs.com"
export JEKYLL_ENV="production"

echo "Setting site domain to cockroachlabs.com and JEKYLL_ENV to production"

# Fix permissions for the working directory
sudo chown -R $(whoami):$(whoami) . || echo "Could not change ownership, continuing..."
chmod -R u+w . || echo "Could not change permissions, continuing..."

# Generate the _config_url.yml file
echo "url: ${site_url}" > _config_url.yml

# Install dependencies
echo "Installing dependencies..."

# Install bundler first
gem install bundler --no-document --silent

# Configure bundle to install in a writable location
bundle config set --local path 'vendor/bundle'
bundle config set --local deployment false

# Create vendor directory with proper permissions
mkdir -p vendor/bundle
chmod -R u+w vendor/ || echo "Could not set vendor permissions"

# Install gems
echo "Running bundle install..."
bundle install --retry=3

# Verify jekyll is available
if ! bundle exec jekyll --version; then
  echo "Jekyll not found after bundle install. Checking gem list..."
  bundle list | grep jekyll || echo "Jekyll gem not found in bundle"
  exit 1
fi

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

# Check if _site directory exists
if [[ ! -d "_site" ]]; then
  echo "Error: _site directory not found after build"
  exit 1
fi

# Copy files with proper path resolution
if [[ -f "_site/docs/_redirects" ]]; then
  cp "_site/docs/_redirects" "_site/_redirects"
else
  echo "Warning: _site/docs/_redirects not found"
fi

if [[ -f "_site/docs/404.html" ]]; then
  cp "_site/docs/404.html" "_site/404.html"
else
  echo "Warning: _site/docs/404.html not found"
fi

# Run Python Algolia indexing
echo "Starting Python Algolia indexing..."
echo "Using wrapper script: algolia_indexing_wrapper.py"

# Set state directory to writable workspace location
export ALGOLIA_STATE_DIR="./algolia_state"
mkdir -p "${ALGOLIA_STATE_DIR}"

python3 algolia_indexing_wrapper.py
if [[ $? != 0 ]]; then
  echo "Algolia indexing failed."
  exit 1
fi

echo "=== Build completed successfully! ==="