---
title: Build a Ruby App with CockroachDB and Active Record
summary: Learn how to use CockroachDB from a simple Ruby script with the Active Record gem.
toc: true
twitter: false
referral_id: docs_ruby_activerecord
filter_category: crud_ruby
filter_html: Use <strong>Active Record</strong>
filter_sort: 2
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple Ruby application with CockroachDB and [Active Record](http://guides.rubyonrails.org/active_record_basics.html). CockroachDB provides an Active Record adapter for CockroachDB as a [RubyGem](https://rubygems.org/gems/activerecord-cockroachdb-adapter).

{{site.data.alerts.callout_success}}
For a more realistic use of Active Record with CockroachDB in a Rails app, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-certs.md %}

## Step 2. Get the code

Clone [the code's GitHub repository](https://github.com/cockroachlabs/example-app-ruby-activerecord).

{% include_cached copy-clipboard.html %}
~~~ shell
git clone https://github.com/cockroachlabs/example-app-ruby-activerecord
~~~

## Step 3. Configure the dependencies

1. Install `libpq` for your platform.

    For example, to install `libpq` on macOS with Homebrew, run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    brew install libpq
    ~~~

1. Configure `bundle` to use `libpq`.

    For example, if you installed `libpq` on macOS with Homebrew, run the following command from the `example-app-ruby-activerecord` directory:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    bundle config --local build.pg --with-opt-dir="{libpq-path}"
    ~~~

    Where `{libpq-path}` is the full path to the `libpq` installation on your machine (e.g., `/usr/local/opt/libpq`).

1. Install the dependencies:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    bundle install
    ~~~

## Step 4. Run the code

1. Set the `DATABASE_URL` environment variable to the connection string to your {{ site.data.products.db }} cluster:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="{connection-string}"
    ~~~

    Where `{connection-string}` is the connection string you obtained from the {{ site.data.products.db }} Console.

    </section>

    The app uses the connection string saved to the `DATABASE_URL` environment variable to connect to your cluster and execute the code.

1. Run the code to create a table and insert some rows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ruby main.rb
    ~~~

    The output should be similar to the following:

    ~~~
    -- create_table(:accounts, {:force=>true, :id=>:integer})
       -> 0.1998s
    account: 1 balance: 1000
    account: 2 balance: 250
    ~~~

## What's next?

Read more about using [Active Record](http://guides.rubyonrails.org/active_record_basics.html), or check out a more realistic implementation of Active Record with CockroachDB in a Rails app in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{page.version.version}}/app/see-also-links.md %}
