---
title: Build a Test App
summary: Follow this tutorial to quickly learn how to create a CockroachDB database and connect to it from a client application.
toc: false
---

This page is CockroachDB's **Hello, World!** tutorial. It walks you through creating a database, granting privileges on the database to a user, and then connecting with that user from your preferred language to execute basic statements as well as more complex transactions.

<div id="toc"></div>

## Before You Begin

Make sure you have already:

- [Installed CockroachDB](install-cockroachdb.html) 
- [Started a local cluster](start-a-local-cluster.html) in insecure mode
- [Installed a client driver](install-client-drivers.html)
 
## Step 1. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database and [grant privileges](grant.html) to the `maxroach` user. The privileges will enable the user to execute statements in the next steps.

~~~ shell
$ cockroach users set maxroach
$ cockroach sql -e 'CREATE DATABASE bank'
$ cockroach sql -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~

## Step 2. Create a table in the new database

As the `maxroach` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create an `accounts` table in the new database.

~~~ shell
$ cockroach sql --database=bank --user=maxroach -e 'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)' 
~~~

## Step 3. Execute basic statements from a client

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

## Step 4. Execute transactions from a client

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

Coming soon.
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

Coming soon.
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

