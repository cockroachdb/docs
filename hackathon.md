---
title: CockroachDB Hackathon Guide
summary: Get Up & Running with CockroachDB at a Hackathon
toc: false
toc_not_nested: true
twitter: false
no_sidebar: true
---

Hello, hackers! Here you'll find everything you need to get up and running with CockroachDB. While this guide is lengthy, it includes not only details about deploying CockroachDB, but also helps you avoid common pitfalls when using a database.

<div id="toc"></div>

## Before You Begin

Before diving in, you should understand this guide assumes you're using:

- macOS or a remote Linux server
- Node.js
- Hand-written SQL statements (instead of using an ORM)

However, a lot of this information is easy to adapt if you're using different technology.

## Getting Help

If you run into *any* issues, hit up:

- The Cockroach Labs booth
- Cockroach Labs on the Hackathon slack (or [Gitter](https://gitter.im/cockroachdb/cockroach))
- Our [troubleshooting documentation](https://www.cockroachlabs.com/docs/stable/troubleshooting-overview.html)
- CockroachDB on [Stack Overflow](https://stackoverflow.com/questions/tagged/cockroachdb)

## 1. Install CockroachDB

To install CockroachDB, you have two options. Which you choose depends on how you want to work with your team:

- **Locally** on a single machine. This is useful to get started, but can be challenging because only one person can access the database at a time.
- **Remotely** on a cloud hosting provider. This option can give everyone on your team access to the database, but can be more difficult to configure because you have to deal with your VM's networking rules.

<script>
$(document).ready(function(){

    $('#newsletter-footer-popout').hide();

    install_button = $('.install-button');

    install_button.on('click', function(e){
      e.preventDefault();
      var hash = $(this).prop("hash");

      install_button.removeClass('current');
      $(this).addClass('current');
      $(hash).show();

    });

    $('#remoteinstall').hide();

    //handle click event for os-tab buttons
    $('.install-button').on('click', function(){
        $('#install-tabs').find('a').removeClass('current');
        $(this).addClass('current');

        if($(this).is('#local')){ toggleLocal(); }
        if($(this).is('#remote')){ toggleRemote(); }
    });

    function toggleLocal(){
        $("#localinstall").show();
        $("#remoteinstall").hide();
    }

    function toggleRemote(){
        //$("#remoteinstall").show();
        $("#localinstall").hide();
    }
});

</script>

<div id="install-tabs" class="clearfix install-wrap">
<a href="#localinstall" id="local" class="install-button current" data-eventaction="local-install"><div class="c2a">Locally</div></a>
<a href="#remoteinstall" id="remote" class="install-button" data-eventaction="remote-install"><div class="c2a">Remotely</div></a>
</div>

<div id="localinstall" class="install-option">
<ol>
    <li>
      <p>Download the <a href="https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz">CockroachDB archive</a> for macOS, and extract the binary:</p>

      <div class="copy-clipboard">
        <div class="copy-clipboard__text">copy</div>
        <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code><span class="gp">$ </span>curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz \
| tar -xJ</code></pre></div>
    </li>
    <li>
      <p>Copy the binary into your <code>PATH</code> so it's easy to execute <a href="cockroach-commands.html"><code>cockroach</code> commands</a> from any shell:</p>

      {% include copy-clipboard.html %}<div class="highlight"><pre class="highlight"><code><span class="gp noselect shellterminal"></span>cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin</code></pre></div>
      <p>If you get a permissions error, prefix the command with <code>sudo</code>.</p>
    </li>
    <li>
      <p>Make sure the CockroachDB executable works:</p>

      {% include copy-clipboard.html %}<div class="highlight"><pre class="highlight"><code><span class="gp">$ </span>cockroach version</code></pre></div>

      <p>You should see an output that looks somewhat like this:</p>

      <pre class="highlight"><code>Build Tag:    {{ page.release_info.version }}
Build Time:   2017/07/06 17:44:09
Distribution: CCL
Platform:     darwin amd64
Go Version:   go1.8.3
C Compiler:   4.2.1 Compatible Clang 3.8.0 (tags/RELEASE_380/final)
Build SHA-1:  b692a7cc7acc57022d1441034b93b85d860b7e86
Build Type:   release</code></pre>
      </li>
  </ol>
</div>

<div id="remoteinstall" class="install-option">

<ol>
    <li>
      <p>SSH to your machine:</p>

      <div class="copy-clipboard">
        <div class="copy-clipboard__text">copy</div>
        <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code><span class="gp">$ </span> ssh &lt;username&gt;@&lt;ip address&gt;</code></pre></div>

    <li>
      <p>Download the <a href="https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz">CockroachDB archive</a> for Linux, and extract the binary:</p>

      <div class="copy-clipboard">
        <div class="copy-clipboard__text">copy</div>
        <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
        <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
      </div>
      <div class="highlight"><pre class="highlight"><code><span class="gp">$ </span>wget -qO- https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz \
| tar  xvz</code></pre></div>
    </li>
    <li>
      <p>Copy the binary into your <code>PATH</code> so it's easy to execute <a href="cockroach-commands.html">cockroach commands</a> from any shell:</p>

      {% include copy-clipboard.html %}<div class="highlight"><pre class="highlight"><code><span class="gp noselect shellterminal"></span>cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin</code></pre></div>
      <p>If you get a permissions error, prefix the command with <code>sudo</code>.</p>
    </li>
    <li>
      <p>Make sure the CockroachDB executable works:</p>

      {% include copy-clipboard.html %}<div class="highlight"><pre class="highlight"><code><span class="gp">$ </span>cockroach version</code></pre></div>

      <p>You should see an output that looks somewhat like this:</p>

      <pre class="highlight"><code>Build Tag:    {{ page.release_info.version }}
Build Time:   2017/07/06 17:44:09
Distribution: CCL
Platform:     linux amd64
Go Version:   go1.8.3
C Compiler:   4.2.1 Compatible Clang 3.8.0 (tags/RELEASE_380/final)
Build SHA-1:  b692a7cc7acc57022d1441034b93b85d860b7e86
Build Type:   release</code></pre>
      </li>
  </ol>
</div>

## 2. Start Your Node

1. On your machine, start your node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure --background
    ~~~

    You'll receive a response like:

    ~~~
    CockroachDB node starting at 2017-08-17 16:42:18.303618399 +0700 ICT
    build:      CCL {{ page.release_info.version }} @ 2017/07/06 17:44:09 (go1.8.3)
    admin:      http://localhost:8080
    sql:        postgresql://root@localhost:26257?sslmode=disable
    logs:       /Users/me/cockroach-data/logs
    store[0]:   path=/Users/you/cockroach-data
    status:     initialized new cluster
    clusterID:  e929ac5a-0958-419a-b5ec-d568efe1d755
    nodeID:     1
    ~~~

    {{site.data.alerts.callout_success}}<img src="http://emojis.slackmojis.com/emojis/images/1471119455/979/deal_with_it_parrot.gif?1471119455" alt="flashing parrot gif" /> You should definitely note the URL that displays in the <code>sql</code> row. This is your node's connection string, which you'll need to connect your app to CockroachDB.{{site.data.alerts.end}}

2. Check that you can connect to the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

3. Make sure you can see databases:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW DATABASES;
    ~~~

    You should get a response like this:

    ~~~
    +--------------------+
    |      Database      |
    +--------------------+
    | crdb_internal      |
    | information_schema |
    | pg_catalog         |
    | system             |
    +--------------------+
    ~~~

## 2.5 (Optional): Code Sample Repo

Now that you have CockroachDB up and running, you can take a detour and check out [a simple Express-based Node.js app on GitHub](https://github.com/sploiselle/bankofroach).

<style>

a.btn.btn-primary {
    color: #ffffff;
    background-color: #54B30E;
    border-color: #54B30E;
}

a.btn.btn-primary:hover {
    color: #54B30E;
    background-color: #fff;
    border-bottom: 2px #54B30E solid;
}

</style>

<a href="https://github.com/sploiselle/bankofroach" type="button" class="btn btn-primary">Get the code sample</a>

If you're not using Node.js, we have [code samples for many other languages, as well](https://www.cockroachlabs.com/docs/stable/build-an-app-with-cockroachdb.html).

## 3. Draft Your Schema

When we're talking about schemas, we're talking about the structure of the data in your application. Planning this is important because––like so much engineering––things need to be exactly right for it to work.

It's tempting to skip this step, but investing time planning out what data you want to store in the database will make things *much* smoother in the long run––or as long of a run as a hackthon is.

### Understanding a Database's Structure

CockroachDB is a SQL database, which also means that it's a relational database management system (also known as an RDBMS). Like the name suggests, the concept is that it makes it easy to create relationships between your data (which is why SQL has been around for so long).

Relational databases are typically structured kind of like this:

1. Databases, which contain one or more...
2. Tables, which contain one or more...
3. Columns, which represent types of data
4. Rows, which represent individual "observations" of the types of data

This maps really clearly to how you think of object-oriented programming:

- Databases are like an entire application
- Tables are like classes
- Columns are like the attributes of a class, which require a specific type (`INT`, `STRING`, etc.)
- Rows represent individual instantiations of a class

So, if you want to use a database for a typical OO program you would:

- Create one database
- Create a table for each class, which has columns of the same types as the class' attribute
- Write a row of data to the table to represent each instantiation of the class

This should help you understand how you want to model your data, but it's also possible to store slightly different types of information in your database, as long as it's all structured.

### Planning

There are two major elements you should plan in your database:

- Uniquely identifying rows with a `PRIMARY KEY`
- Using columns to relate tables together with `FOREIGN KEY`s

#### Primary Key

{{site.data.alerts.callout_success}}<strong>tl;dr</strong>: You need a column to uniquely identify each row, called a <code>PRIMARY KEY</code>.{{site.data.alerts.end}}

With a database, it's important to plan to create a column (or columns) that can uniquely identify each row––in relational databases (including CockroachDB) this is known as a `PRIMARY KEY`. This column:

- Must contain unique values for each row
- Cannot be `null`

One "gotcha" with CockroachDB is that you currently cannot add a `PRIMARY KEY` after creating a table. For hackathon apps, it's really not a big deal, but it's good practice to be mindful of this decision.

#### Foreign Key

{{site.data.alerts.callout_success}}<strong>tl;dr</strong>: To relate two tables together use a <code>FOREIGN KEY</code>, which represents a column from one table in another.{{site.data.alerts.end}}

It's important to understand tables that you want to relate with one another and ensure that you include columns that will let you do that.

For instance, if you have tables for `customers` and the `orders` they place, you would want to include a column in the `orders` table that lets you identify which row from the `customers` table it relates to; typically the `PRIMARY KEY` of the referenced table. This is often called a `FOREIGN KEY`.

By creating this relationship you can easily do things like find all of a user's orders, or do more complicated things like filter `order` data based on data that exists only in the `customers` table with a `JOIN` (more on that later).

SQL offers an explicit `FOREIGN KEY` constraint, which can ensure your data remains consistent. However, it's also possible to achieve the same kind of relationships (albeit not strictly enforced) without it.

## 3. Implement Your Schema

So, it's important to understand what kind of data you want to store––i.e., your schema––and then implement it in your database.

Here's how to do that:

1. Create a database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE db_name;
    ~~~

    If this is the only database you're using, you can set it as the default database:

    {% include copy-clipboard.html %}
    ~~~ sql?nofmt
    > SET DATABASE = db_name;
    ~~~

2. Create tables for your data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE tbl_name (
      col1 INT PRIMARY KEY,
      col2 TEXT,
      etc.
    );
    ~~~

    Note that we identify which column uniquely identifies rows by making it the `PRIMARY KEY`.

    You'll need to create a table for each type of data (or "class") you want to store.

### Implementing `FOREIGN KEY` (Optional)

For some of your tables, you'll want to include a `FOREIGN KEY` columns. You don't have to formally enforce the `FOREIGN KEY` relationship, but you can to ensure you don't end up with inconsistent data:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE parent_table (id INT PRIMARY KEY, val STRING);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE child_table (
  parent_id INT,
  id INT PRIMARY KEY,
  val STRING,
  CONSTRAINT fk FOREIGN KEY (parent_id) REFERENCES parent_table (id)
);
~~~

A few notes about using `FOREIGN KEY`:

- Your foreign keys must reference a column that is ensured to be unique on another table. This means either the `PRIMARY KEY` or a column with the `UNIQUE` constraint.
- You cannot delete values from the "parent"/referenced table if they're being referenced by the "child"/referencing table. If they *aren't* being referenced, they can be deleted.

## 4. Write Some SQL to Make Sure Your App Will Work

Now that you have a schema, let's put some data in the database!

CockroachDB offers typical "CRUD" operations using standard SQL keywords:

CRUD Operation | SQL Keyword
---------------|------------
Create | `INSERT`
Read | `SELECT`
Update | `UPDATE`
Delete | `DELETE`

Below are some quick examples of what these statements look like (and you can find more of them in our [documentation](sql-statements.html)).

#### `INSERT` Examples

Implicit columns:

~~~ sql
> INSERT INTO tbl_name VALUES (1, 'a'), (2, 'b'), (3, 'a');
~~~

Explicit columns:

~~~ sql
> INSERT INTO tbl_name (id, val) VALUES (1, 'a'), (2, 'b'), (3, 'a');
~~~

#### `SELECT` Examples

Select all columns:

~~~ sql
> SELECT * FROM tbl_name;
~~~

Select specific columns:

~~~ sql
> SELECT id, val FROM tbl_name;
~~~

Select specific rows:

~~~ sql
> SELECT * FROM tbl_name WHERE id = 2;
~~~

#### `UPDATE` Examples

Update specific values:

~~~ sql
> UPDATE tbl_name SET col = 'newVal' WHERE col = 'oldVal';
~~~

{{site.data.alerts.callout_info}}If you use this on a non-<code>PRIMARY KEY</code>code> column, it will update all rows that match the <code>WHERE</code> clause.{{site.data.alerts.end}}

#### `DELETE` Examples

Delete specific rows:

~~~ sql
> DELETE FROM tbl_name WHERE col = 'specificVal';
~~~

Delete all rows:

~~~ sql
> DELETE FROM tbl_name;
~~~

#### Other, More-Complicated SQL Operations

We'll cover these a little bit later in the [Advanced SQL section](#bonus-advanced-sql-operations).

## 5. Install pg-promise

To make your code as simple as possible, we recommend using [`pg-promise`](http://vitaly-t.github.io/pg-promise/index.html). This is a Postgres driver that supports using Node.js promises––but with ES7, also lets us `async`/`await`, which makes our code _really_ easy to write and read.

`pg-promise` also requires a Promise engine; we recommend using `bluebird`, just because it's simple and well documented.

{% include copy-clipboard.html %}
~~~ shell
$ npm install bluebird --save
~~~

{% include copy-clipboard.html %}
~~~ shell
$ npm install pg-promise --save
~~~

## 6. Create a Database Module

To connect to your database in multiple locations, it's easier to create a module than duplicate the code. Where you put this file depends on your structure, but a common best practice is something like `routes/modules/db.js`.

{% include copy-clipboard.html %}
~~~ js
//db.js module

var promise = require('bluebird');
var options = {
  // Initialization Options
  promiseLib: promise
};
var pgp = require('pg-promise')(options);
var connectionString = 'postgresql://root@___database host___:26257/___your database___?sslmode=disable';
var db = pgp(connectionString);

module.exports = db;
~~~

What you use for `___database host___` depends on where you deployed CockroachDB and where your application's running:

- **Locally**: Use `localhost`
- **Remotely**: Use `localhost` if your application is running on the same machine as CockroachDB. If not, use the IP address of the VM (but make sure it allows external traffic from whatever machine you're using on port 26257).

## 7. At Last!!! Use the App to Connect to Your Database

Here's a quick code sample of using the module in your routes file:

{% include copy-clipboard.html %}
~~~ js
//routes.js API

var express = require('express');
var router = express.Router();

var db = require('./modules/db');

router.post('/endpoint', function(req, res){

  let data = {
      id: req.body.id
    };

  let query = {
      text: 'SELECT * FROM tbl_name WHERE id = $1',
      values: [data.id]
    };

  try {
    results = await db.query(query.text, query.values);
    res.send(results);
  }
  catch(error) {
    debug(error);
    return res.status(500).json({success: false, data: error});
  };

});
~~~

If you run into any issues, hit up the Cockroach Labs booth or check out our [troubleshooting documentation](https://www.cockroachlabs.com/docs/stable/troubleshooting-overview.html).

## Bonus: Advanced SQL Operations

If you've gotten this far, congratulations! Here's some extra stuff we thought you might find useful.

### Joining Together Two Tables

Besides simply reading and writing data, one of the most common things developers do with databases is `JOIN` together rows of data from different tables, which is done with a read/`SELECT`.

Doing a `JOIN` requires a column that you can use to relate the two tables; often one table's `PRIMARY KEY`, which is represented as a column in another table.

Here's a simple example that will show you all of the customers who have data in the `order` table (i.e., all of the customers who have placed an order):

{% include copy-clipboard.html %}
~~~ sql
> SELECT
  customers.id, customers.name
FROM
  customers JOIN orders ON customers.id = orders.customer_id;
~~~

### Changing Table's Schema

If you're developing at a hackathon, it's likely that you'll need to change things along the way. Here are some quick examples of things you can do to change your tables' structures.

Add a column:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE tbl_name ADD COLUMN foo TYPE;
~~~

Drop a column:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE tbl_name DROP COLUMN foo;
~~~

### Transactions

Transactions let you create a group of SQL statements; if any statement in the group fails, the entire group fails and nothing in your database is changed.

The classic example of this is a financial transaction: if the account you're withdrawing money from doesn't have enough in it, the transaction should fail, and the money shouldn't be withdrawn.

Here's a quick code sample:

{% include copy-clipboard.html %}
~~~ js
async function query (q) {

  let res = {};

  try {
    await db.query('BEGIN');
    try {
      res.first = await db.query(query1);
      res.second = await db.query(query2);
      await client.query('COMMIT');
    } catch (err) {
      await db.query('ROLLBACK');
      return res.status(500).json({success: false, data: error});
    }
  }
  return res;
}
~~~

Looking at the code above, you can infer how transactions work, but here's what's explicitly happening:

- Initiate transactions with a `BEGIN` statement.
- Statements received after `BEGIN` are considered part of the transaction.
- Once the group of statements is done, end the transaction with the `COMMIT` statement.
- If there are any errors, you can end the transaction early by issuing a `ROLLBACK` statement.

## Double Bonus: Scaling CockroachDB

While CockroachDB is an incredibly simple SQL database to use in a Hackathon, its true power lies in its ability to scale easily, while remaining simple to use, and providing industry-leading consistency (the last of which is something NoSQL databases simply cannot offer).

We're sure you're busy hacking away tonight, but if you're interested you should check out [MLH Local:Host's CockroachDB Workshop on Building Scalable Apps](https://localhost.mlh.io/activities/intro-to-cockroachdb/).
