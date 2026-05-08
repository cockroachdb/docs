# Hermetic Jekyll Documentation Build Image
#
# This Dockerfile creates a consistent build environment for the CockroachDB
# documentation site. It pins all Ruby, Python, and Node.js dependencies to
# ensure reproducible builds across all developers and CI environments.
#
# For build and publish instructions, see ci/README.md

FROM ruby:3.4-slim

# Version labels
LABEL org.opencontainers.image.title="CockroachDB Docs Builder"
LABEL org.opencontainers.image.description="Hermetic build environment for CockroachDB documentation"
LABEL org.opencontainers.image.source="https://github.com/cockroachdb/docs"
LABEL ruby.version="3.4.0"
LABEL bundler.version="2.7.2"
LABEL jekyll.version="4.3.4"

# Install build and runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    python3 \
    python3-pip \
    curl \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS for Jest tests
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /docs

# Install specific bundler version (must match Gemfile.lock BUNDLED WITH)
RUN gem install bundler:2.7.2 --no-document

# Copy Gemfile and local gem for dependency installation
# The jekyll-algolia-dev directory contains a local gem that must be present
COPY Gemfile Gemfile.lock ./
COPY jekyll-algolia-dev ./jekyll-algolia-dev/

# Configure bundler and install gems to /usr/local/bundle (default location)
# Ensure the lockfile in the image supports common Linux platforms
RUN bundle lock --add-platform aarch64-linux --add-platform x86_64-linux \
    && bundle config set --local jobs 4 \
    && bundle config set --local without development:test \
    && bundle install

# Install Python dependencies for Algolia indexing
RUN pip3 install --break-system-packages --no-cache-dir \
    pyyaml \
    "algoliasearch>=3.0,<4.0" \
    beautifulsoup4 \
    lxml \
    tqdm

# Set environment variables
ENV JEKYLL_ENV=development
ENV BUNDLE_FROZEN=true

# Expose Jekyll server port
EXPOSE 4000

# Default command - serve the documentation locally
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000"]
