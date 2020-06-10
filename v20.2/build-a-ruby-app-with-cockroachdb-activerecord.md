---
title: Build a Ruby App with CockroachDB and ActiveRecord
summary: Learn how to use CockroachDB from a simple Ruby script with the ActiveRecord gem.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button current">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB and [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html). CockroachDB provides an ActiveRecord adapter for CockroachDB as a [RubyGem](https://rubygems.org/gems/activerecord-cockroachdb-adapter).

{{site.data.alerts.callout_success}}
For a more realistic use of ActiveRecord with CockroachDB in a Rails app, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install PostgreSQL

[`pg`](ttps://github.com/ged/ruby-pg) and [`activerecord`](https://guides.rubyonrails.org/active_record_postgresql.html) are both dependencies of `activerecord-cockroachdb-adapter`. Both libraries require a [PostgreSQL](https://www.postgresql.org/) installation.

To install PostgreSQL from source code, follow [the instructions on their documentation website](https://www.postgresql.org/docs/current/installation.html).

You can also use a package manager to install PostgreSQL. For example, to install PostgreSQL on macOS, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ brew install postgresql
~~~

To install PostgreSQL on a Debian-based Linux distribution (e.g., Ubuntu), run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ apt-get install postgresql
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Ruby code

The following code uses [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html) to map Ruby-specific objects to SQL operations. Specifically, `Schema.new.change()` creates an `accounts` table based on the Account model (or drops and recreates the table if it already exists), `Account.create()` inserts rows into the table, and `Account.all` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/activerecord-basic-sample.rb" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ ruby
{% include {{page.version.version}}/app/activerecord-basic-sample.rb %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ ruby activerecord-basic-sample.rb
~~~

The output should be:

~~~ shell
-- create_table(:accounts, {:force=>true, :id=>:integer})
   -> 0.0883s
account: 1 balance: 1000
account: 2 balance: 250
~~~

To verify that the table and rows were created successfully, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank
~~~

Then, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
~~~

~~~
  id | balance
-----+----------
   1 |    1000
   2 |     250
(2 rows)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Ruby code

The following code uses [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html) to map Ruby-specific objects to database tables. Specifically, `Schema.new.change()` creates an `accounts` table based on the `Account` model (or drops and recreates the table if it already exists), `Account.create()` inserts rows into the table, and `Account.all` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/activerecord-basic-sample.rb" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ ruby
{% include {{page.version.version}}/app/insecure/activerecord-basic-sample.rb %}
~~~

Then run the code (no need to run bundler first):

{% include copy-clipboard.html %}
~~~ shell
$ ruby activerecord-basic-sample.rb
~~~

The output should be:

~~~ shell
-- create_table(:accounts, {:force=>true, :id=>:integer})
   -> 0.0883s
account: 1 balance: 1000
account: 2 balance: 250
~~~

To verify that the table and rows were created successfully, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

Then, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
~~~

~~~
  id | balance
-----+----------
   1 |    1000
   2 |     250
(2 rows)
~~~

</section>

## What's next?

Read more about using [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html), or check out a more realistic implementation of ActiveRecord with CockroachDB in a Rails app in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{page.version.version}}/app/see-also-links.md %}
