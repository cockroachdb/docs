# Documentation Build Docker Image

This directory contains configuration for building and publishing the hermetic Docker image used for CockroachDB documentation builds.

## Quick Start (Local Development for engineers)

```bash
# 1. Build the Docker image (first time only)
make docker-build

# 2. Serve docs locally with live reload
make docker-serve

# 3. Open http://localhost:4000/docs/ in your browser
```

That's it! No Ruby, Bundler, or gem installation required on your machine.

**Other useful commands:**
- `make docker-build-site` - Build without serving
- `make docker-shell` - Interactive shell for debugging
- `make docker-pull` - Pull pre-built image from GCP (instead of building locally)

## Overview

The `docs-builder` Docker image provides a consistent build environment with pinned versions of:

| Component | Version |
|-----------|---------|
| Base Image | ruby:3.4-slim (Debian Trixie) |
| Ruby | 3.4.0 |
| Bundler | 4.0.0 |
| Jekyll | 4.3.4 |
| Python | 3.13+ |
| Node.js | 20 LTS |

## Prerequisites

- Docker installed locally
- For publishing: `gcloud` CLI configured with appropriate permissions

## Building the Image Locally

```bash
# From the repository root
docker build -t docs-builder:local .

# Or use the Makefile target
make docker-build
```

## Running Locally with Docker

### Serve documentation with live reload

```bash
make docker-serve
# Then open http://localhost:4000
```

### Interactive shell in the container

```bash
make docker-shell
```

### Build without serving

```bash
docker run -it --rm \
    -v "$(pwd)":/docs \
    docs-builder:local \
    bundle exec jekyll build --trace \
    --config _config_base.yml,_config_cockroachdb.yml
```

## Publishing to GCP Artifact Registry

### Manual Publishing

1. Authenticate with GCP:
   ```bash
   gcloud auth login
   gcloud auth configure-docker us-docker.pkg.dev
   ```

2. Build and push the image:
   ```bash
   # Set the image tag (use date-based versioning)
   export IMAGE_TAG=$(date +%Y-%m-%d)
   export REGISTRY=us-docker.pkg.dev/release-notes-automation-stag/docs-builder

   # Build for multi-architecture
   docker buildx build \
       --platform linux/amd64,linux/arm64 \
       --tag ${REGISTRY}/docs-builder:${IMAGE_TAG} \
       --tag ${REGISTRY}/docs-builder:latest \
       --push \
       .
   ```

### Automated Publishing with Cloud Build

Trigger a Cloud Build to build and publish the image:

```bash
gcloud builds submit --config ci/cloudbuild.yaml .
```

## Image Tagging Convention

| Tag | Description |
|-----|-------------|
| `latest` | Most recent build |
| `YYYY-MM-DD` | Date-based version (e.g., `2025-01-15`) |
| `ruby3.4-bundler4.0` | Version-based for explicit compatibility |

## When to Rebuild the Image

Rebuild and publish a new image when:

1. `Gemfile` or `Gemfile.lock` changes
2. Python dependencies change in build scripts
3. Ruby or Node.js version needs updating
4. Security updates are required for base image

## Environment Variables

The following environment variables can be passed to the container:

| Variable | Description | Default |
|----------|-------------|---------|
| `JEKYLL_ENV` | Build environment (`development`, `production`, `preview`) | `development` |
| `ALGOLIA_API_KEY` | Algolia write API key for indexing | - |
| `PROD_ALGOLIA_API_KEY` | Production Algolia API key | - |

## Volume Mounts

| Mount Point | Purpose |
|-------------|---------|
| `/docs` | Mount the documentation source directory here |

## Exposed Ports

| Port | Service |
|------|---------|
| 4000 | Jekyll development server |

## Troubleshooting

### Permission errors with mounted volumes

If you encounter permission errors (e.g., with `.jekyll-cache`, `_site`, `.jekyll-metadata`), run the container as your current user:

```bash
docker run -it --rm \
    -v "$(pwd)":/docs \
    -u "$(id -u):$(id -g)" \
    -e HOME=/tmp \
    docs-builder:local \
    bundle exec jekyll build
```

If files were created by root in a previous run, remove them first:

```bash
sudo rm -rf .jekyll-cache _site .jekyll-metadata
```

### DNS resolution errors

If you see errors like "Failed to open TCP connection" or "getaddrinfo: Temporary failure in name resolution", add explicit DNS:

```bash
docker run -it --rm \
    --dns 8.8.8.8 \
    -v "$(pwd)":/docs \
    docs-builder:local \
    bundle exec jekyll build
```

### Native gem compilation issues

The image uses `ruby:3.4-slim` which includes build tools for native extensions. If you encounter issues:

1. Ensure you're using the multi-arch image matching your platform
2. Try pulling a fresh image: `docker pull ${REGISTRY}/docs-builder:latest`

### Bundle path issues

The image pre-installs gems to `/usr/local/bundle`. When mounting your local directory, ensure you don't have a conflicting local `vendor/bundle` directory.

To work around this, you can either:
- Clear your local vendor directory: `rm -rf vendor`
- Or use a different bundle path in the container
