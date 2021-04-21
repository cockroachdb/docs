# frozen_string_literal: true
source "https://rubygems.org"

# If you modify this file, you'll need to build a new version of the
# docs-builder Docker image to keep things speedy in CI. See ci/README.md for
# instructions.

gem "jekyll", "~> 4.2"
gem "jekyll-redirect-from", "~> 0.15"
gem "jekyll-sitemap", "~> 1.3.1"
gem "liquid-c", "~> 4.0.0"
gem "redcarpet", "~> 3.5"
gem "rss"
gem "sassc", "~> 2.2"
gem "webrick"

group :jekyll_plugins do
    gem "jekyll-include-cache"
    gem 'jekyll-algolia', "~> 1.0", path: "./jekyll-algolia-dev"
    gem 'jekyll-remote-include', "~> 1.1.4", github: 'ianjevans/jekyll-remote-include'
  end
