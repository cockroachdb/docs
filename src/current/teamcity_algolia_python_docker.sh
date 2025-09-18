#!/bin/bash

# Exit on any error
set -e

# Set the site URL for Jekyll
site_url="https://www.cockroachlabs.com"
export JEKYLL_ENV="production"

echo "========================================"
echo "Starting Algolia Python Indexing Build"
echo "========================================"
echo "Setting site domain to cockroachlabs.com and JEKYLL_ENV to production"

# Fix permissions for the working directory
sudo chown -R $(whoami):$(whoami) . || echo "Could not change ownership, continuing..."
chmod -R u+w . || echo "Could not change permissions, continuing..."

# Generate the _config_url.yml file
echo "url: ${site_url}" > _config_url.yml

# Function to build the site
function build {
  local config_file="$1"
  echo "Building with config: _config_base.yml,${config_file}"
  
  bundle exec jekyll build --trace --config "_config_base.yml,${config_file}"
  
  if [[ $? != 0 ]]; then
    echo "Jekyll build failed."
    exit 1
  fi
}

# Install Ruby dependencies
echo "========================================"
echo "Installing Ruby dependencies..."
echo "========================================"

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
echo "========================================"
echo "Building the documentation site..."
echo "========================================"
build "_config_cockroachdb.yml,_config_url.yml"

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

# Install Python dependencies
echo "========================================"
echo "Installing Python dependencies..."
echo "========================================"

# The cimg/ruby:3.2-node image should have Python3
if command -v python3 &> /dev/null; then
  echo "Python3 found, installing dependencies..."
  pip3 install --user algoliasearch beautifulsoup4 lxml || \
  pip3 install algoliasearch beautifulsoup4 lxml
elif command -v python &> /dev/null; then
  echo "Python found, installing dependencies..."
  pip install --user algoliasearch beautifulsoup4 lxml || \
  pip install algoliasearch beautifulsoup4 lxml
else
  echo "Error: Python not found in container"
  exit 1
fi

# Setup state directory
echo "========================================"
echo "Setting up state directory..."
echo "========================================"

# For Docker container, use local directory for state
export ALGOLIA_STATE_DIR="./algolia_state"
mkdir -p "${ALGOLIA_STATE_DIR}"
echo "Using state directory: $ALGOLIA_STATE_DIR"

# Try to restore previous state from artifacts
if [[ -d "../previous_state" ]]; then
  echo "Attempting to restore previous state from artifacts..."
  cp ../previous_state/files_tracked_*.json "${ALGOLIA_STATE_DIR}/" 2>/dev/null || true
  cp ../previous_state/indexing_log_*.json "${ALGOLIA_STATE_DIR}/" 2>/dev/null || true
  echo "State files restored from artifacts"
else
  echo "No previous state found, will perform full indexing"
fi

# Run the Python Algolia indexer
echo "========================================"
echo "Running Python Algolia Indexer..."
echo "========================================"

# Check for required environment variables
if [[ -z "${ALGOLIA_ADMIN_API_KEY}" ]] && [[ -z "${PROD_ALGOLIA_API_KEY}" ]]; then
  echo "Error: Neither ALGOLIA_ADMIN_API_KEY nor PROD_ALGOLIA_API_KEY is set."
  exit 1
fi

# Use PROD_ALGOLIA_API_KEY if ALGOLIA_ADMIN_API_KEY is not set
if [[ -z "${ALGOLIA_ADMIN_API_KEY}" ]] && [[ -n "${PROD_ALGOLIA_API_KEY}" ]]; then
  export ALGOLIA_ADMIN_API_KEY="${PROD_ALGOLIA_API_KEY}"
  echo "Using PROD_ALGOLIA_API_KEY as ALGOLIA_ADMIN_API_KEY"
fi

# Set default values
export ALGOLIA_APP_ID="${ALGOLIA_APP_ID:-7RXZLDVR5F}"
export ALGOLIA_INDEX_NAME="${ALGOLIA_INDEX_NAME:-stage_cockroach_docs}"
export ALGOLIA_INDEX_ENVIRONMENT="${ALGOLIA_INDEX_ENVIRONMENT:-staging}"
export ALGOLIA_FORCE_FULL="${ALGOLIA_FORCE_FULL:-false}"

# Log configuration
echo "Configuration:"
echo "  ALGOLIA_APP_ID: ${ALGOLIA_APP_ID}"
echo "  ALGOLIA_INDEX_NAME: ${ALGOLIA_INDEX_NAME}"
echo "  ALGOLIA_INDEX_ENVIRONMENT: ${ALGOLIA_INDEX_ENVIRONMENT}"
echo "  ALGOLIA_STATE_DIR: ${ALGOLIA_STATE_DIR}"
echo "  ALGOLIA_FORCE_FULL: ${ALGOLIA_FORCE_FULL}"
echo "  Working Directory: $(pwd)"

# Run the Python indexing wrapper
python3 algolia_indexing_wrapper.py

if [[ $? != 0 ]]; then
  echo "========================================"
  echo "Algolia Python indexing failed."
  echo "========================================"
  exit 1
fi

# Preserve state files as artifacts
echo "========================================"
echo "Preserving state for next build..."
echo "========================================"
mkdir -p algolia_artifacts
cp ${ALGOLIA_STATE_DIR}/files_tracked_*.json algolia_artifacts/ 2>/dev/null || true
cp ${ALGOLIA_STATE_DIR}/indexing_log_*.json algolia_artifacts/ 2>/dev/null || true
echo "State files copied to artifacts"

echo "========================================"
echo "Build completed successfully!"
echo "========================================"