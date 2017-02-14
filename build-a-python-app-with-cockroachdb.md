---
title: Build a Python App with CockroachDB
summary: Learn how to use CockroachDB from a simple Python application with either a low-level client driver or ORM.
toc: false
asciicast: true
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
    <button class="filter-button current" data-tool="driver" >Use <strong data-tool="driver">psycopg2</strong></button>
    <button class="filter-button" data-tool="orm">Use <strong data-tool="orm">SQLAlchemy</strong></button>
</div>

This tutorial shows you how build a simple Python application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Python psycopg2 driver](http://initd.org/psycopg/docs/) and the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/), so those are featured here.

<div id="toc" style="display: none"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

<div class="filter-content" markdown="1" data-tool="driver">
Also, feel free to watch this process in action before going through the steps yourself. Note that the demo video does not show installation of the driver (step 1). Also note that you can copy commands directly from the video, and you can use **<** and **>** to go back and forward.

<asciinema-player class="asciinema-demo" src="asciicasts/build-a-python-app-with-driver.json" cols="107" speed="2" theme="monokai" poster="npt:0:24" title="Build a Python App - Client Driver"></asciinema-player>
</div>

<div class="filter-content" markdown="1" data-tool="driver">
## Step 1. Install the psycopg2 driver

To install the Python psycopg2 driver, run the following command:

~~~ shell
$ pip install psycopg2
~~~

For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).
</div>

<div class="filter-content" markdown="1" data-tool="orm">
## Step 1. Install the SQLAlchemy ORM

To install SQLAlchemy, as well as a [cockroachdb python package](https://github.com/cockroachdb/cockroachdb-python) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

~~~ shell
$ pip install sqlalchemy cockroachdb
~~~

For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).
</div>

{% include app/common-steps.md %}

## Step 5. Run the Python code

<div class="filter-content" markdown="1" data-tool="driver">
### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, creating a table, inserting rows, and reading and printing the rows. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.py" download>download it directly</a>.

~~~ python
{% include app/basic-sample.py %}
~~~

Then run the code:

~~~ shell
$ python basic-sample.py
~~~

The output should be:

~~~ shell
Initial balances:
['1', '1000']
['2', '250']
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.py" download>download it directly</a>. 

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ python
{% include app/txn-sample.py %}
~~~

Then run the code:

~~~ shell
$ python txn-sample.py
~~~

The output should be:

~~~ shell
Balances after transfer:
['1', '900']
['2', '350']
~~~

However, if you want to verify that funds were, in fact, transferred from one account to another, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):  

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
The following code uses the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) to map Python-specific objects to SQL operations. Specifically, `Base.metadata.create_all(engine)` creates an `accounts` table based on the Account class, `session.add_all([Account(),...
])` inserts rows into the table, and `session.query(Account)` selects from the table so that balances can be printed. Also note that the [cockroachdb python package](https://github.com/cockroachdb/cockroachdb-python) installed earlier is triggered by the `cockroachdb://` prefix in the engine URL. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/sqlalchemy-basic-sample.py" download>download it directly</a>.

~~~ python
{% include app/sqlalchemy-basic-sample.py %}
~~~

Then run the code:

~~~ shell
$ python sqlalchemy-basic-sample.go
~~~

The output should be:

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
Read more about using the [Python psycopg2 driver](http://initd.org/psycopg/docs/).
</div>

<div class="filter-content" markdown="1" data-tool="orm">
Read more about using the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/).
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
