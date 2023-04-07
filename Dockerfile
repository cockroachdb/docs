ARG RUBY_VERSION=3.2.1

FROM ruby:${RUBY_VERSION}-alpine AS rb
WORKDIR /
COPY . .
RUN apk add --no-cache bash build-base git
RUN curl https://htmltest.wjdp.uk | bash

FROM rb AS gem
# COPY Gemfile* .
# COPY jekyll-algolia-dev/ .
RUN pwd
# RUN gem install jekyll bundler && bundle install
RUN echo 'we are running some # of cool things'
