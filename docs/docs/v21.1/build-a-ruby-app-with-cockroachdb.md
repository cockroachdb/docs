---
title: Build a Ruby App with CockroachDB and the Ruby pg Driver
summary: Learn how to use CockroachDB from a simple Ruby application with the pg client driver.
toc: true
twitter: false
referral_id: docs_hello_world_ruby_pg
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button current">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB and the [Ruby pg driver](https://deveiate.org/code/pg/PG/Connection.html).

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Get the code

Clone [the code's GitHub repository](https://github.com/cockroachlabs/hello-world-ruby-pg).

{% include_cached copy-clipboard.html %}
~~~shell
git clone https://github.com/cockroachlabs/hello-world-ruby-pg
~~~

The code connects as the user you created and executes some basic SQL statements: creating a table, inserting rows, and reading and printing the rows.

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Check out the `cockroachcloud` branch:

{% include_cached copy-clipboard.html %}
~~~ shell
git checkout cockroachcloud
~~~

</section>

## Step 4. Configure the dependencies

1. Install `libpq` for your platform. For example, to install it on Mac with Homebrew:
    {% include_cached copy-clipboard.html %}
    ~~~shell
    brew install libpq
    ~~~
1. Configure `bundle` to use `libpq`. For example, if you installed `libpq` on Mac using Homebrew:
    {% include_cached copy-clipboard.html %}
    ~~~shell
    bundle config --local build.pg --with-opt-dir="/usr/local/opt/libpq"
    ~~~
    Set `--with-opt-dir` to the location of `libpq` on your OS.

## Step 5. Install the dependencies

{% include_cached copy-clipboard.html %}
~~~shell
bundle install
~~~

## Step 6. Update the connection parameters

Update the connection parameters to connect to your cluster.

<section class="filter-content" markdown="1" data-scope="local">

{% include_cached copy-clipboard.html %}
~~~ ruby
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-ruby-pg/master/main.rb||# BEGIN connect||# END connect %}
~~~

Where `{port}` is the port number from the connection string you noted earlier, `{username}` is the database username you created, and `{password}` is the database user's password.

</section>
<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ ruby
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-ruby-pg/cockroachcloud/main.rb||# BEGIN connect||# END connect %}
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

</section>

## Step 7. Run the Ruby code

Run the code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

{% include_cached copy-clipboard.html %}
~~~ shell
ruby main.rb
~~~

The output should be:

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
