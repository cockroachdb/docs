---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with either a low-level client driver or ORM.
toc: false
---

<style>
.filters .filter-button {
  width: 20%;
  height: 65px;
  margin: 15px 15px 10px 0px;
}
.filters a:hover {
  border-bottom: none;
}
</style>

<div id="tool-filters" class="filters clearfix">
    <button class="filter-button current" data-tool="driver" >Use <strong>jdbc</strong></button>
    <button class="filter-button" data-tool="orm">Use <strong>Hibernate</strong></button>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Java jdbc driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/), so those are featured here.

<div id="toc" style="display: none"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

<div class="filter-content" markdown="1" data-tool="driver">
## Step 1. Install the Java jdbc driver

Download and set up the Java jdbc driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/head/setup.html).
</div>

<div class="filter-content" markdown="1" data-tool="orm">
## Step 1. Install the Gradle build tool

This tutorial uses the [Gradle build tool](https://gradle.org/) to get all dependencies for your application, including the Hibernate ORM. To install Gradle, run the following command:

~~~ shell
$ brew install gradle
~~~

For details about prerequisites, or for other ways to install Gradle, see the [official documentation](https://gradle.org/install).
</div>

{% include app/common-steps.md %}

## Step 5. Run the Java code

<div class="filter-content" markdown="1" data-tool="driver">
### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, creating a table, inserting rows, and reading and printing the rows. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/BasicSample.java" download>download it directly</a>.

~~~ java
{% include app/BasicSample.java %}
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.rb" download>download it directly</a>. 

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ java
{% include app/TxnSample.java %}
~~~

After running the code, to verify that funds were, in fact, transferred from one account to another, you can again use the [built-in SQL client](use-the-built-in-sql-client.html): 

~~~ shell
$ cockroach sql -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |     900 |
|  2 |     350 |
+----+---------+
(2 rows)
~~~
</div>

<div class="filter-content" markdown="1" data-tool="orm">

[Downlod and extract this tarball](https://github.com/cockroachdb/docs/raw/gh-pages/_includes/app/hibernate-basic-sample/hibernate-basic-sample.tgz), which includes three files that work together:

File | Description
-----|------------
`hibernate.cfg.xml` | This file defines how to connect to the database. It must be in the `src/main/resources` directory.
`Sample.java` | This file uses the Hibernate ORM to map Java-specific objects to SQL operations. It must be in the `src/main/java/com/cockroachlabs/ directory`.
`build.gradle` | This is the file you will run to execute your app. 

For more insight into this sample application, review the `Sample.java` file, which uses the [Hibernate ORM](http://hibernate.org/orm/) to map Java-specific objects to SQL operations. Specifically, `public Account() {}` creates an `accounts` table based on the Account class, `session.save(new Account())` inserts rows into the table, and `session.getCriteriaBuilder().createQuery(Account.class)` selects from the table so that balances can be printed. 

~~~ java
{% include app/hibernate-basic-sample/Sample.java %}
~~~

Then in the `hibernate-basic-sample` directory, run the gradle file to fetch the dependencies in `Sample.java` (including Hibernate) and run the application:

~~~ shell
$ gradle run 
~~~

Toward the end of the output, you shoud see:

~~~ shell
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):  

~~~ shell
$ cockroach sql -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

~~~ shell
$ cockroach sql -e 'SELECT id, balance FROM accounts' --database=bank
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
</div>

## What's Next?

<div class="filter-content" markdown="1" data-tool="driver">
Read more about using the [Java jdbc driver](https://jdbc.postgresql.org/).
</div>

<div class="filter-content" markdown="1" data-tool="orm">
Read more about using the [Hibernate ORM](http://hibernate.org/orm/).
</div>

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Scalability](demo-scalability.html)

<script>
(function() {
    // Generate toc of h2 and h3 headers currently visible on page.
    function renderTOC() {
        var toc = $('#toc');
        toc.show();
        toc.toc({ minimumHeaders: 0, listType: 'ul', showSpeed: 0, headers: 'h2:not(.filter-content:not(.current) h2),h3:not(.filter-content:not(.current) h3)' });
    }

    function selectTool(tool) {
        var current_tab = $('.filter-button.current');
        var current_content = $('.filter-content.current');

        // Remove current class from tab and content blocks.
        current_tab.removeClass('current');
        current_content.removeClass('current');

        // Add current class to clicked button and corresponding content blocks.
        $('.filter-button[data-tool="'+tool+'"]').addClass('current');
        $('.filter-content[data-tool="'+tool+'"]').addClass('current');
    }

    var hash = window.location.hash.split('#')[1] == 'orm' ? 'orm' : 'driver';
    selectTool(hash);

    $(document).ready(function() {
        renderTOC();

        // Show and hide content blocks with buttons.
        $('.filter-button').on('click', function(){
            selectTool($(this).data('tool'));
            renderTOC();
        });
    });
})();
</script>

