---
title: CREATE DATABASE
summary: The CREATE DATABASE statement creates a new CockroachDB database.
toc: true
docs_area: reference.sql
---

The `CREATE DATABASE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates a new CockroachDB database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

To create a database, the user must be a member of the `admin` role or must have the [`CREATEDB`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-create-and-rename-databases) parameter set.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_database.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new database only if a database of the same name does not already exist; if one does exist, do not return an error.
`name` | The name of the database to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers).<br /><br />Cockroach Labs recommends against starting your database name with the string `cluster:`. If your database name begins with this string, you must append the following to the URI connection string to [connect to the cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}): `&options=-ccluster=system`
`encoding` | The `CREATE DATABASE` statement accepts an optional `ENCODING` clause for compatibility with PostgreSQL, but `UTF-8` is the only supported encoding. The aliases `UTF8` and `UNICODE` are also accepted. Values should be enclosed in single quotes and are case-insensitive.<br><br>Example: `CREATE DATABASE bank ENCODING = 'UTF-8'`.
`CONNECTION LIMIT` |  Supported for compatibility with PostgreSQL. A value of `-1` indicates no connection limit. Values other than `-1` are currently not supported. By default, `CONNECTION LIMIT = -1`. ([*](#connlimit-note))
`PRIMARY REGION region_name` |  Create a [multi-region database]({% link {{ page.version.version }}/multiregion-overview.md %}) with `region_name` as [the primary region]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).<br>Allowed values include any region returned by [`SHOW REGIONS FROM CLUSTER`]({% link {{ page.version.version }}/show-regions.md %}).
`REGIONS region_name_list` |  Create a [multi-region database]({% link {{ page.version.version }}/multiregion-overview.md %}) with `region_name_list` as [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).<br>Allowed values include any region returned by [`SHOW REGIONS FROM CLUSTER`]({% link {{ page.version.version }}/show-regions.md %}).<br>To set database regions at database creation, a primary region must be specified in the same `CREATE DATABASE` statement.
`SURVIVE ZONE FAILURE` (*Default*)<br>`SURVIVE REGION FAILURE` |  Create a [multi-region database]({% link {{ page.version.version }}/multiregion-overview.md %}) with regional failure or zone failure [survival goals]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals).<br>To set the regional failure survival goal, the database must have at least 3 [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).<br>Surviving zone failures is the default setting for multi-region databases.

<a name="connlimit-note">*</a>
{% include {{page.version.version}}/sql/server-side-connection-limit.md %} This setting may be useful until the `CONNECTION LIMIT` syntax is fully supported.

## Example

### Create a database

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

~~~
CREATE DATABASE
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

~~~
ERROR: database "bank" already exists
SQLSTATE: 42P04
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

~~~
CREATE DATABASE
~~~

SQL does not generate an error, but instead responds `CREATE DATABASE` even though a new database wasn't created.

{% include_cached copy-clipboard.html %}
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



Suppose you start a cluster with region and zone [localities specified at startup]({% link {{ page.version.version }}/cockroach-start.md %}#locality).

For this example, let's use a [demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}), with the [`--demo-locality` flag]({% link {{ page.version.version }}/cockroach-demo.md %}#general) to simulate a multi-region cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --nodes=6 --demo-locality=region=us-east1,zone=us-east1-a:region=us-east1,zone=us-east1-b:region=us-central1,zone=us-central1-a:region=us-central1,zone=us-central1-b:region=us-west1,zone=us-west1-a:region=us-west1,zone=us-west1-b --no-example-database
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank PRIMARY REGION "us-east1" REGIONS "us-east1", "us-central1", "us-west1" SURVIVE REGION FAILURE;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

### Create a multi-region database with a secondary region



You can add a [secondary region]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) to a [multi-region database]({% link {{ page.version.version }}/multiregion-overview.md %}) for failover purposes. If the [primary region]({% link {{ page.version.version }}/alter-database.md %}#set-primary-region) fails, the secondary region becomes the new primary region.

To add a secondary region during database creation, use the following steps:

1. Start a `cockroach demo` cluster as described in the example [Create a multi-region database](#create-a-multi-region-database).

1. Issue a `CREATE DATABASE` statement like the following.  It is the same as in the [Create a multi-region database](#create-a-multi-region-database) example, except that it adds a `SECONDARY REGION {region}` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE bank PRIMARY REGION "us-east1" REGIONS "us-east1", "us-central1", "us-west1" SURVIVE REGION FAILURE SECONDARY REGION "us-west1";
~~~

~~~
CREATE DATABASE
~~~

For more information about secondary regions, see [Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions).

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/known-limitations/secondary-regions-with-regional-by-row-tables.md %}
{{site.data.alerts.end}}

## See also

- [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %})
- [`SHOW CREATE DATABASE`]({% link {{ page.version.version }}/show-create.md %})
- [`ALTER DATABASE ... RENAME TO`]({% link {{ page.version.version }}/alter-database.md %}#rename-to)
- [`SET DATABASE`]({% link {{ page.version.version }}/set-vars.md %})
- [`DROP DATABASE`]({% link {{ page.version.version }}/drop-database.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
- [Multiregion overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions).
- [`SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)
