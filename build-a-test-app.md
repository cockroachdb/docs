---
title: Build a Test App
summary: Follow this tutorial to quickly learn how to create a CockroachDB database and connect to it from a client application.
toc: false
asciicast: true
optimizely: true
---

This page is CockroachDB's **Hello, World!** tutorial. It walks you through creating a user, creating a database, granting privileges on the database to the new user, and then connecting with that user from your preferred language to execute basic statements as well as more complex transactions.

<div id="toc"></div>

## Before You Begin

Make sure you have already:

- [Installed CockroachDB](install-cockroachdb.html)
- [Started a local cluster](start-a-local-cluster.html) in insecure mode
- [Installed a client driver](install-client-drivers.html)

Feel free to watch this process in action before going through the steps yourself. Note that the demo video features Python code for executing basic statements (step 4), but the code for executing more complex transactions is not covered (step 5). Also note that you can copy commands directly from the video, and you can use **<** and **>** to go back and forward.

<asciinema-player class="asciinema-demo" src="asciicasts/build-a-test-app.json" cols="107" speed="2" theme="monokai" poster="npt:0:40" title="Build a Test App"></asciinema-player>

## Step 1. Create a user

As the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

~~~ shell
$ cockroach user set maxroach
~~~

~~~
INSERT 1
~~~

## Step 2. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database and [grant privileges](grant.html) to the `maxroach` user. The privileges will enable the user to execute statements in the next steps.

~~~ shell
$ cockroach sql -e 'CREATE DATABASE bank'
~~~

~~~
CREATE DATABASE
~~~

~~~ shell
$ cockroach sql -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~

~~~
GRANT
~~~

## Step 3. Create a table in the new database

As the `maxroach` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create an `accounts` table in the new database.

~~~ shell
$ cockroach sql --database=bank --user=maxroach -e \
'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)'
~~~

~~~
CREATE TABLE
~~~

## Step 4. Execute basic statements from a client

As the `maxroach` user, connect from your preferred language, insert a few rows into the `accounts` table, and read and print the rows.

<div id="step-three-filters" class="filters clearfix">
	<button class="filter-button current" data-language="python">Python</button>
	<button class="filter-button" data-language="ruby">Ruby</button>
	<button class="filter-button" data-language="go">Go</button>
	<button class="filter-button" data-language="java">Java</button>
	<button class="filter-button" data-language="nodejs">Node.js</button>
	<button class="filter-button" data-language="cplusplus">C++</button>
	<button class="filter-button" data-language="clojure">Clojure</button>
	<button class="filter-button" data-language="php">PHP</button>
    <button class="filter-button" data-language="rust">Rust</button>
</div>

<div class="filter-content current" markdown="1" data-language="python">
**Python**

~~~ py
{% include app/basic-sample.py %}
~~~

The balance printout will look like this:

~~~ shell
Initial balances:
['1', '1000']
['2', '250']
~~~
</div>

<div class="filter-content" markdown="1" data-language="ruby">
**Ruby**

~~~ ruby
{% include app/basic-sample.rb %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="go">
**Go**

~~~ go
{% include app/basic-sample.go %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="java">
**Java**

~~~ java
{% include app/BasicSample.java %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="nodejs">
**Node.js**

~~~ js
{% include app/basic-sample.js %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="cplusplus">
**C++**

~~~ cpp
{% include app/basic-sample.cpp %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="clojure">
**Clojure**

~~~ clojure
{% include app/basic-sample.clj %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="php">
**PHP**

~~~ php
{% include app/basic-sample.php %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="rust">
**Rust**

~~~ rust
{% include app/basic-sample.rs %}
~~~
</div>

## Step 5. Execute transactions from a client

As the `maxroach` user, connect again from your preferred language, but this time execute a batch of statements as an atomic transaction, where all included statements are either commited or aborted.

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

<div id="step-four-filters" class="filters clearfix">
	<button class="filter-button current" data-language="python">Python</button>
	<button class="filter-button" data-language="ruby">Ruby</button>
	<button class="filter-button" data-language="go">Go</button>
	<button class="filter-button" data-language="java">Java</button>
	<button class="filter-button" data-language="nodejs">Node.js</button>
	<button class="filter-button" data-language="cplusplus">C++</button>
	<button class="filter-button" data-language="clojure">Clojure</button>
	<button class="filter-button" data-language="php">PHP</button>
    <button class="filter-button" data-language="rust">Rust</button>
</div>

<div class="filter-content current" markdown="1" data-language="python">
**Python**

~~~ py
{% include app/txn-sample.py %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="ruby">
**Ruby**

~~~ ruby
{% include app/txn-sample.rb %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="go">
**Go**

For Go, the CockroachDB retry function is in the `crdb` package of the CockroachDB Go client. You can clone the library into your `$GOPATH` as follows:

~~~ shell
$ mkdir -p $GOPATH/github.com/cockroachdb
$ cd $GOPATH/github.com/cockroachdb
$ git clone git@github.com:cockroachdb/cockroach-go.git
~~~

~~~ go
{% include app/txn-sample.go %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="java">
**Java**

~~~ java
{% include app/TxnSample.java %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="nodejs">
**Node.js**

~~~ js
{% include app/txn-sample.js %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="cplusplus">
**C++**

~~~ cpp
{% include app/txn-sample.cpp %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="clojure">
**Clojure**

~~~ clojure
{% include app/txn-sample.clj %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="php">
**PHP**

~~~ php
{% include app/txn-sample.php %}
~~~
</div>

<div class="filter-content" markdown="1" data-language="rust">
**Rust**

~~~ rust
{% include app/txn-sample.rs %}
~~~
</div>

## What's Next?

Use a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Scalability](demo-scalability.html)


<script>
$(document).ready(function(){

    var $filter_button = $('.filter-button');

    $filter_button.on('click', function(){
        var language = $(this).data('language'),
        $current_tab = $('.filter-button.current'), $current_content = $('.filter-content.current');

        //remove current class from tab and content
        $current_tab.removeClass('current');
        $current_content.removeClass('current');

        //add current class to clicked button and corresponding content block
        $('.filter-button[data-language="'+language+'"]').addClass('current');
        $('.filter-content[data-language="'+language+'"]').addClass('current');
    });
});
</script>
