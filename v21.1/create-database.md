---
title: CREATE DATABASE
summary: The CREATE DATABASE statement creates a new CockroachDB database.
toc: true
---

The `CREATE DATABASE` [statement](sql-statements.html) creates a new CockroachDB database.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

To create a database, the user must be a member of the `admin` role or must have the [`CREATEDB`](create-role.html#create-a-role-that-can-create-and-rename-databases) parameter set.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/create_database.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new database only if a database of the same name does not already exist; if one does exist, do not return an error.
`name` | The name of the database to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`encoding` | The `CREATE DATABASE` statement accepts an optional `ENCODING` clause for compatibility with PostgreSQL, but `UTF-8` is the only supported encoding. The aliases `UTF8` and `UNICODE` are also accepted. Values should be enclosed in single quotes and are case-insensitive.<br><br>Example: `CREATE DATABASE bank ENCODING = 'UTF-8'`.
`CONNECTION LIMIT` |  Supported for compatibility with PostgreSQL. A value of `-1` indicates no connection limit. Values other than `-1` are currently not supported. By default, `CONNECTION LIMIT = -1`.
`PRIMARY REGION region_name` | {% include_cached new-in.html version="v21.1" %} Create a [multi-region database](multiregion-overview.html) with `region_name` as [the primary region](multiregion-overview.html#database-regions).<br>Allowed values include any region returned by [`SHOW REGIONS FROM CLUSTER`](show-regions.html).
`REGIONS region_name_list` | {% include_cached new-in.html version="v21.1" %} Create a [multi-region database](multiregion-overview.html) with `region_name_list` as [database regions](multiregion-overview.html#database-regions).<br>Allowed values include any region returned by [`SHOW REGIONS FROM CLUSTER`](show-regions.html).<br>To set database regions at database creation, a primary region must be specified in the same `CREATE DATABASE` statement.
`SURVIVE ZONE FAILURE` (*Default*)<br>`SURVIVE REGION FAILURE` | {% include_cached new-in.html version="v21.1" %} Create a [multi-region database](multiregion-overview.html) with regional failure or zone failure [survival goals](multiregion-overview.html#survival-goals).<br>To set the regional failure survival goal, the database must have at least 3 [database regions](multiregion-overview.html#database-regions).<br>Surviving zone failures is the default setting for multi-region databases.

## Example

### Create a database

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

~~~
CREATE DATABASE
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name | owner | primary_region | regions | survival_goal
----------------+-------+----------------+---------+----------------
  bank          | demo  | NULL           | {}      | NULL
  defaultdb     | root  | NULL           | {}      | NULL
  postgres      | root  | NULL           | {}      | NULL
  system        | node  | NULL           | {}      | NULL
(4 rows)
~~~

### Create fails (name already in use)

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

~~~
ERROR: database "bank" already exists
SQLSTATE: 42P04
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

~~~
CREATE DATABASE
~~~

SQL does not generate an error, but instead responds `CREATE DATABASE` even though a new database wasn't created.

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name | owner | primary_region | regions | survival_goal
----------------+-------+----------------+---------+----------------
  bank          | demo  | NULL           | {}      | NULL
  defaultdb     | root  | NULL           | {}      | NULL
  postgres      | root  | NULL           | {}      | NULL
  system        | node  | NULL           | {}      | NULL
(4 rows)
~~~

### Create a multi-region database

{% include enterprise-feature.md %}

Suppose you start a cluster with region and zone [localities specified at startup](cockroach-start.html#locality).

For this example, let's use a [demo cluster](cockroach-demo.html), with the [`--demo-locality` flag](cockroach-demo.html#general) to simulate a multi-region cluster:

{% include copy-clipboard.html %}
~~~ shell
cockroach211 demo --nodes=6 --demo-locality=region=us-east1,zone=us-east1-a:region=us-east1,zone=us-east1-b:region=us-central1,zone=us-central1-a:region=us-central1,zone=us-central1-b:region=us-west1,zone=us-west1-a:region=us-west1,zone=us-west1-b --no-example-database
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW REGIONS;
~~~

~~~
    region    |             zones             | database_names | primary_region_of
--------------+-------------------------------+----------------+--------------------
  us-central1 | {us-central1-a,us-central1-b} | {}             | {}
  us-east1    | {us-east1-a,us-east1-b}       | {}             | {}
  us-west1    | {us-west1-a,us-west1-b}       | {}             | {}
(3 rows)
~~~

If regions are set at cluster start-up, you can create multi-region databases in the cluster that use the cluster regions.

Use the following command to specify regions and survival goals at database creation:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank PRIMARY REGION "us-east1" REGIONS "us-east1", "us-central1", "us-west1" SURVIVE REGION FAILURE;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name | owner | primary_region |             regions             | survival_goal
----------------+-------+----------------+---------------------------------+----------------
  bank          | demo  | us-east1       | {us-central1,us-east1,us-west1} | region
  defaultdb     | root  | NULL           | {}                              | NULL
  postgres      | root  | NULL           | {}                              | NULL
  system        | node  | NULL           | {}                              | NULL
(4 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW REGIONS FROM DATABASE bank;
~~~

~~~
  database |   region    | primary |             zones
-----------+-------------+---------+--------------------------------
  bank     | us-east1    |  true   | {us-east1-a,us-east1-b}
  bank     | us-central1 |  false  | {us-central1-a,us-central1-b}
  bank     | us-west1    |  false  | {us-west1-a,us-west1-b}
(3 rows)
~~~

## See also

- [`SHOW DATABASES`](show-databases.html)
- [`RENAME DATABASE`](rename-database.html)
- [`SET DATABASE`](set-vars.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
