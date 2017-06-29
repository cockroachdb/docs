---
title: Build a Ruby App with CockroachDB
summary: Learn how to use CockroachDB from a simple Ruby application with the ActiveRecord ORM.
toc: false
twitter: true
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button current">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Ruby pg driver](https://rubygems.org/gems/pg) and the [ActiveRecord ORM](http://guides.rubyonrails.org/active_record_basics.html), so those are featured here.

{{site.data.alerts.callout_success}}For a more realistic use of ActiveRecord with CockroachDB, see our <a href="https://github.com/cockroachdb/examples-orms"><code>examples-orms</code></a> repository.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the ActiveRecord ORM

To install ActiveRecord as well as the [pg driver](https://rubygems.org/gems/pg) and a [CockroachDB Ruby package](https://github.com/cockroachdb/activerecord-cockroachdb-adapter) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ gem install activerecord pg activerecord-cockroachdb-adapter
~~~

{% include app/common-steps.md %}

## Step 5. Run the Ruby code

The following code uses the [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html) ORM to map Ruby-specific objects to SQL operations. Specifically, `Schema.new.change()` creates an `accounts` table based on the Account model (or drops and recreates the table if it already exists), `Account.create()` inserts rows into the table, and `Account.all` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/activerecord-basic-sample.rb" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ ruby
{% include app/activerecord-basic-sample.rb %}
~~~

Then run the code:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
