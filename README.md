# CockroachDB Docs

This repository contains the source files for the CockroachDB documentation available at [cockroachlabs.com/docs](https://cockroachlabs.com/docs).

## Suggest Improvements

Want a topic added to the docs? Need additional details or clarification? See an error or other problem? Please [open an issue](https://github.com/cockroachdb/docs/issues).

## Write Docs

Want to contribute to the docs? See [CONTRIBUTING](CONTRIBUTING.md) for details about setting yourself up and getting started.

## Build locally

To build the documentation, you need the following installed on your local machine:

- Ruby
- `make`

The docs are built using [Jekyll](https://jekyllrb.com/), a static site generator.

### Install Ruby using `rbenv`

We recommend using [`rbenv`](https://github.com/rbenv/rbenv) to manage Ruby versions. Ruby 3 is set as the local `rbenv` version in `.ruby-version`.

1. Install `rbenv`.

    ~~~ shell
    brew install rbenv
    ~~~

1. Configure your shell to enable `rbenv`.

    ~~~ shell
    rbenv init
    ~~~

    Follow the instructions in the output to integrate `rbenv` with your shell.

1. Install Ruby using `rbenv`.

    List all the available Ruby versions.

    ~~~ shell
    rbenv install -l
    ~~~

    Install a particular version.

    ~~~ shell
    rbenv install 3.0.2
    ~~~

1. Install the [`rbenv-aliases`](https://github.com/tpope/rbenv-aliases) plugin.

    ~~~ shell
    mkdir -p "$(rbenv root)/plugins"
    git clone git://github.com/tpope/rbenv-aliases.git "$(rbenv root)/plugins/rbenv-aliases"
    rbenv alias --auto
    ~~~

### Upgrade to Ruby 3

1. Clean any existing dependencies.

    ~~~ shell
    make clean
    ~~~

1. If you are upgrading from Ruby 2.x delete `Gemfile.lock`.

    ~~~ shell
    rm Gemfile.lock
    ~~~

1. Install the dependencies with the `boostrap` target.

    ~~~ shell
    make bootstrap
    ~~~

### Build the docs

Run the `cockroachdb` target to build and preview the docs.

~~~ shell
make cockroachdb
~~~

## Resources

- [Code of conduct](CODE_OF_CONDUCT.md)
- [Contributing](CONTRIBUTING.md)
