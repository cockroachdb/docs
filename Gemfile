# frozen_string_literal: true
source "https://rubygems.org"

# If you modify this file, you'll need to build a new version of the
# docs-builder Docker image to keep things speedy in CI. See ci/README.md for
# instructions.

# Jekyll v4.1.0 
gem "jekyll", github: "jekyll", ref: "930c65f"
gem "jekyll-redirect-from", "~> 0.15"
gem "jekyll-sitemap", "~> 1.3.1"
gem "liquid-c", "~> 4.0.0"
gem "redcarpet", "~> 3.4"
gem "sassc", "~> 2.2"

group :jekyll_plugins do
    gem 'jekyll-algolia', "~> 1.0", path: "./jekyll-algolia-dev"
    gem 'jekyll-remote-include', :github => 'netrics/jekyll-remote-include'
  end
