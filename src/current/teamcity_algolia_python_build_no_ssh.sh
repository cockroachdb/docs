#!/bin/bash

# TeamCity Build Script for Python-based Algolia Indexing
# Version that works without SSH access to agent

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

# Setup environment without requiring SSH access
echo "========================================"
echo "Setting up environment..."
echo "========================================"

# Try to create state directory, fallback to local if no permissions
STATE_DIR_CANDIDATES=(
  "/opt/teamcity-data/algolia_state"
  "$HOME/.algolia_state"
  "./algolia_state"
)

for dir in "${STATE_DIR_CANDIDATES[@]}"; do
  if mkdir -p "$dir" 2>/dev/null; then
    export ALGOLIA_STATE_DIR="$dir"
    echo "Using state directory: $ALGOLIA_STATE_DIR"
    break
  fi
done

# If no state dir was set, use current directory
if [[ -z "${ALGOLIA_STATE_DIR}" ]]; then
  export ALGOLIA_STATE_DIR="./algolia_state"
  mkdir -p "${ALGOLIA_STATE_DIR}"
  echo "Using local state directory: $ALGOLIA_STATE_DIR"
fi

# Download previous state from artifacts if exists
if [[ -n "${TEAMCITY_VERSION}" ]]; then
  echo "Attempting to restore previous state from artifacts..."
  
  # Try to download the last successful build's artifacts
  if [[ -f "../previous_state/files_tracked_staging.json" ]]; then
    cp ../previous_state/files_tracked_*.json "${ALGOLIA_STATE_DIR}/" 2>/dev/null || true
    echo "Restored previous state files"
  else
    echo "No previous state found, will perform full indexing"
  fi
fi

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

# Try different pip install methods
if command -v pip3 &> /dev/null; then
  pip3 install --user algoliasearch beautifulsoup4 lxml 2>/dev/null || \
  pip3 install algoliasearch beautifulsoup4 lxml
elif command -v pip &> /dev/null; then
  pip install --user algoliasearch beautifulsoup4 lxml 2>/dev/null || \
  pip install algoliasearch beautifulsoup4 lxml
else
  echo "Warning: pip not found, assuming dependencies are pre-installed"
fi

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
export ALGOLIA_FORCE_FULL="${ALGOLIA_FORCE_FULL:-false}"
export ALGOLIA_INDEX_NAME="${ALGOLIA_INDEX_NAME:-stage_cockroach_docs}"

# Log configuration
echo "Configuration:"
echo "  ALGOLIA_APP_ID: ${ALGOLIA_APP_ID}"
echo "  ALGOLIA_INDEX_ENVIRONMENT: ${ALGOLIA_INDEX_ENVIRONMENT}"
echo "  ALGOLIA_STATE_DIR: ${ALGOLIA_STATE_DIR}"
echo "  ALGOLIA_FORCE_FULL: ${ALGOLIA_FORCE_FULL}"
echo "  ALGOLIA_INDEX_NAME: ${ALGOLIA_INDEX_NAME}"
echo "  Working Directory: $(pwd)"

# Run the Python indexing wrapper
python3 algolia_indexing_wrapper.py

if [[ $? != 0 ]]; then
  echo "========================================"
  echo "Algolia Python indexing failed."
  echo "========================================"
  exit 1
fi

# Copy state files to artifacts directory
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