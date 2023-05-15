FROM ruby:3.2.2

ENV NODE_VERSION=20.1.0
ENV NODE_DISTRO=linux-x64

RUN curl -o node-v${NODE_VERSION}-${NODE_DISTRO}.tar.xz \
    https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${NODE_DISTRO}.tar.xz

RUN mkdir -p /usr/local/lib/nodejs
RUN tar -xJvf node-v${NODE_VERSION}-${NODE_DISTRO}.tar.xz \
    -C /usr/local/lib/nodejs 

RUN export PATH=/usr/local/lib/nodejs/node-v${NODE_VERSION}-${NODE_DISTRO}/bin:$PATH

RUN . ~/.profile

RUN ls /usr/local/lib/nodejs/node-v${NODE_VERSION}-${NODE_DISTRO}/bin

RUN echo $PATH

RUN which node


# CMD should be the last instruction in the Dockerfile

WORKDIR /app

COPY . /app

RUN gem install jekyll bundler

RUN bundle lock --add-platform ruby

RUN bundle lock --add-platform x86_64-linux

RUN bundle config set --local deployment 'true'

RUN bundle install



EXPOSE 4000

CMD ["make", "standard"]
