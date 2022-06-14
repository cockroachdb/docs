---
title: Build a Ruby App with CockroachDB and the Ruby pg Driver
summary: Learn how to use CockroachDB from a simple Ruby application with the pg client driver.
toc: true
twitter: false
referral_id: docs_ruby_pg
filter_category: crud_ruby
filter_html: Use <strong>pg</strong>
filter_sort: 1
docs_area: get_started
---

{% include_cached filter-tabs.md %}

This tutorial shows you how build a simple Ruby application with CockroachDB and the [Ruby pg driver](https://deveiate.org/code/pg/PG/Connection.html).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-certs.md %}

## Step 2. Get the code

Clone [the code's GitHub repository](https://github.com/cockroachlabs/hello-world-ruby-pg).

{% include_cached copy-clipboard.html %}
~~~shell
git clone https://github.com/cockroachlabs/hello-world-ruby-pg
~~~

The code connects as the user you created and executes some basic SQL statements: creating a table, inserting rows, and reading and printing the rows.

## Step 3. Configure the dependencies

1. Install `libpq` for your platform.

    For example, to install `libpq` on macOS with Homebrew, run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    brew install libpq
    ~~~

1. Configure `bundle` to use `libpq`.

    For example, if you installed `libpq` on macOS with Homebrew, run the following command from the `hello-world-ruby-pg` directory:

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

    The output should look similar to the following:

    ~~~
    ------------------------------------------------
    print_balances(): Balances as of '2021-02-23 11:56:54 -0800':
    {"id"=>"1", "balance"=>"1000"}
    {"id"=>"2", "balance"=>"250"}
    ------------------------------------------------
    transfer_funds(): Trying to transfer 100 from account 1 to account 2
    ------------------------------------------------
    print_balances(): Balances as of '2021-02-23 11:56:55 -0800':
    {"id"=>"1", "balance"=>"900"}
    {"id"=>"2", "balance"=>"350"}
    ~~~

## What's next?

Read more about using the [Ruby pg driver](https://rubygems.org/gems/pg).

{% include {{page.version.version}}/app/see-also-links.md %}
