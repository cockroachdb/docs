FROM ruby:2.6

WORKDIR /docs
RUN gem install bundler
ADD . .
RUN bundle install
RUN bundle exec jekyll build --incremental \
  --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml
ENTRYPOINT bundle exec jekyll serve --incremental --port 4000 --host=0.0.0.0 \
  --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml
