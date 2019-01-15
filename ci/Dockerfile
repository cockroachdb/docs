FROM alpine:3.7

COPY Gemfile Gemfile.lock /tmp/bundler/

RUN apk add --update \
    bash \
    build-base \
    ca-certificates \
    groff \
    less \
    libcurl \
    libffi-dev \
    go \
    git \
    make \
    openssl \
    py-pip \
    python \
    ruby \
    ruby-bundler \
    ruby-dev \
    ruby-json \
    zlib \
    zlib-dev \
  && GOBIN=/usr/local/bin go get -u github.com/cockroachdb/htmltest \
  && wget -O- https://github.com/errata-ai/vale/releases/download/v1.2.7/vale_1.2.7_Linux_64-bit.tar.gz | tar -xzC /usr/local/bin vale \
  && pip install --upgrade awscli \
  && cd /tmp/bundler && bundle install && rm -rf /tmp/bundler \
  && apk --purge del \
    build-base \
    libffi-dev \
    go \
    git \
    py-pip \
    ruby-dev \
    zlib-dev \
  && rm -rf ~/.cache ~/.bundle /var/cache/apk $(go env GOPATH)

WORKDIR /docs
