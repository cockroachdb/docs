---
title: Build a Ruby App with CockroachDB
summary: Learn how to use CockroachDB from a simple Ruby application with the ActiveRecord ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button current">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Ruby pg driver](https://rubygems.org/gems/pg) and the [ActiveRecord ORM](http://guides.rubyonrails.org/active_record_basics.html) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_success}}For a more realistic use of ActiveRecord with CockroachDB, see our <a href="https://github.com/cockroachdb/examples-orms"><code>examples-orms</code></a> repository.{{site.data.alerts.end}}


## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the ActiveRecord ORM

To install ActiveRecord as well as the [pg driver](https://rubygems.org/gems/pg) and a [CockroachDB Ruby package](https://github.com/cockroachdb/activerecord-cockroachdb-adapter) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ gem install activerecord pg activerecord-cockroachdb-adapter
~~~

{{site.data.alerts.callout_success}}The exact command above will vary depending on the desired version of ActiveRecord. Specifically, version 4.2.x of ActiveRecord requires version 0.1.x of the adapter; version 5.1.x of ActiveRecord requires version 0.2.x of the adapter.{{site.data.alerts.end}}

{% include {{ page.version.version }}/app/common-steps.md %}

## Step 5. Run the Ruby code

The following code uses the [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html) ORM to map Ruby-specific objects to SQL operations. Specifically, `Schema.new.change()` creates an `accounts` table based on the Account model (or drops and recreates the table if it already exists), `Account.create()` inserts rows into the table, and `Account.all` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/activerecord-basic-sample.rb" download>download it directly</a>.

{% include_cached copy-clipboard.html %}
~~~ ruby
{% include {{ page.version.version }}/app/activerecord-basic-sample.rb %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ruby activerecord-basic-sample.rb
~~~

The output should be:

~~~ shell
-- create_table(:accounts, {:force=>true})
   -> 0.0361s
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |    1000 |
|  2 |     250 |
+----+---------+
(2 rows)
~~~

## What's Next?

Read more about using the [ActiveRecord ORM](http://guides.rubyonrails.org/active_record_basics.html), or check out a more realistic implementation of ActiveRecord with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
