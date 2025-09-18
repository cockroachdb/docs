#!/bin/bash

# TeamCity Build Script for Python-based Algolia Indexing
# This replaces the Jekyll Algolia gem with the new Python indexing system

set -e  # Exit on error

echo "========================================"
echo "Starting Algolia Python Indexing Build"
echo "========================================"

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

# Install Ruby dependencies
echo "========================================"
echo "Installing Ruby dependencies..."
echo "========================================"
gem install bundler --silent
bundle install --quiet

# Build the Jekyll site
echo "========================================"
echo "Building the documentation site..."
echo "========================================"
build _config_cockroachdb.yml,_config_url.yml

# Copy necessary files for redirects and 404 handling
echo "Copying redirects and 404 page..."
cp _site/docs/_redirects _site/_redirects || true
cp _site/docs/404.html _site/404.html || true

# Install Python dependencies
echo "========================================"
echo "Installing Python dependencies..."
echo "========================================"
pip3 install --quiet algoliasearch beautifulsoup4 lxml

# Run the Python Algolia indexer
echo "========================================"
echo "Running Python Algolia Indexer..."
echo "========================================"

# Check for required environment variables
if [[ -z "${ALGOLIA_ADMIN_API_KEY}" ]]; then
  echo "Error: ALGOLIA_ADMIN_API_KEY is not set. Exiting..."
  exit 1
fi

if [[ -z "${ALGOLIA_APP_ID}" ]]; then
  echo "Error: ALGOLIA_APP_ID is not set. Exiting..."
  exit 1
fi

# Set default values if not provided
export ALGOLIA_INDEX_ENVIRONMENT="${ALGOLIA_INDEX_ENVIRONMENT:-staging}"
export ALGOLIA_STATE_DIR="${ALGOLIA_STATE_DIR:-/opt/teamcity-data/algolia_state}"
export ALGOLIA_FORCE_FULL="${ALGOLIA_FORCE_FULL:-false}"

# Log configuration
echo "Configuration:"
echo "  ALGOLIA_APP_ID: ${ALGOLIA_APP_ID}"
echo "  ALGOLIA_INDEX_ENVIRONMENT: ${ALGOLIA_INDEX_ENVIRONMENT}"
echo "  ALGOLIA_STATE_DIR: ${ALGOLIA_STATE_DIR}"
echo "  ALGOLIA_FORCE_FULL: ${ALGOLIA_FORCE_FULL}"
echo "  Working Directory: $(pwd)"

# Create state directory if it doesn't exist (will fail gracefully if no permissions)
mkdir -p "${ALGOLIA_STATE_DIR}" 2>/dev/null || true

# Run the Python indexing wrapper
python3 algolia_indexing_wrapper.py

if [[ $? != 0 ]]; then
  echo "========================================"
  echo "Algolia Python indexing failed."
  echo "========================================"
  exit 1
fi

echo "========================================"
echo "Build completed successfully!"
echo "========================================"