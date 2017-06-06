FROM alpine:3.5

COPY Gemfile Gemfile.lock /tmp/bundler/

RUN apk add --update \
    build-base\
    groff \
    less \
    libffi-dev \
    py-pip \
    python \
    ruby \
    ruby-bundler \
    ruby-dev \
    ruby-json \
    zlib \
    zlib-dev \
  && pip install --upgrade awscli \
  && cd /tmp/bundler && bundle install && rm -rf /tmp/bundler \
  && apk --purge del \
    build-base \
    libffi-dev \
    py-pip \
    ruby-dev \
    zlib-dev \
  && rm -rf ~/.cache ~/.bundle /var/cache/apk

WORKDIR /docs
