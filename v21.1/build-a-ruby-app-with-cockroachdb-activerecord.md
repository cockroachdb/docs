---
title: Build a Ruby App with CockroachDB and ActiveRecord
summary: Learn how to use CockroachDB from a simple Ruby script with the ActiveRecord gem.
toc: true
twitter: false
referral_id: docs_hello_world_ruby_activerecord
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button current">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB and [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html). CockroachDB provides an ActiveRecord adapter for CockroachDB as a [RubyGem](https://rubygems.org/gems/activerecord-cockroachdb-adapter).

{{site.data.alerts.callout_success}}
For a more realistic use of ActiveRecord with CockroachDB in a Rails app, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Get the code

<div class="filters filters-big clearfix">
  <button class="filter-button page-level" data-scope="ar61">Active Record 6.1</button>
  <button class="filter-button page-level" data-scope="ar52">Active Record 5.2</button>
</div>

Clone [the code's GitHub repository](https://github.com/cockroachlabs/example-app-ruby-activerecord).

{% include_cached copy-clipboard.html %}
~~~ shell
git clone https://github.com/cockroachlabs/example-app-ruby-activerecord
~~~

<div class="filter-content" markdown="1" data-scope="local">
<div class="filter-content" markdown="1" data-scope="ar52">
Check out the `5.2` branch:

{% include_cached copy-clipboard.html %}
~~~ shell
git checkout 5.2
~~~
</div>

</div>

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

<div class="filter-content" markdown="1" data-scope="ar61">
Check out the `cockroachcloud` branch:

{% include_cached copy-clipboard.html %}
~~~shell
git checkout cockroachcloud
~~~

</div>
<div class="filter-content" markdown="1" data-scope="ar52">
Check out the `cockroachcloud-5.2` branch:

{% include_cached copy-clipboard.html %}
~~~ shell
git checkout cockroachcloud-5.2
~~~
</div>

</div>

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
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-ruby-activerecord/main/main.rb||# BEGIN connect||# END connect %}
~~~

Where `{port}` is the port number from the connection string you noted earlier, `{username}` is the database username you created, and `{password}` is the database user's password.

</section>
<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ ruby
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-ruby-activerecord/cockroachcloud/main.rb||# BEGIN connect||# END connect %}
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
-- create_table(:accounts, {:force=>true, :id=>:integer})
   -> 0.3951s
account: 1 balance: 1000
account: 2 balance: 250
~~~

## What's next?

Read more about using [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html), or check out a more realistic implementation of ActiveRecord with CockroachDB in a Rails app in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{page.version.version}}/app/see-also-links.md %}
