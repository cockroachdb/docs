---
title: Name Resolution
summary: Table and function names can exist in multiple places. Resolution decides which one to use.
toc: true
---

<span class="version-tag">Changed in v2.0:</span> A query can specify a table name without a database or schema name (e.g., `SELECT * FROM orders`). How does CockroachDB know which `orders` table is being considered and in which schema?

This page details how CockroachDB performs **name resolution** to answer this question.


## Logical Schemas And Namespaces

<span class="version-tag">New in v2.0:</span> A CockroachDB cluster can store multiple databases, and each database can store multiple tables/views/sequences. This **two-level structure for stored data** is commonly called the "logical schema" in relational database management systems.

Meanwhile, CockroachDB aims to provide compatibility with PostgreSQL
client applications and thus supports PostgreSQL's semantics for SQL
queries. To achieve this, CockroachDB supports a **three-level
structure for names**. This is called the "naming hierarchy".

In the naming hierarchy, the path to a stored object has three components:

- database name (also called "catalog")
- schema name
- object name

The schema name for all stored objects in any given database is always
`public`. There is only a single schema available for stored
objects because CockroachDB only supports a two-level storage
structure.

In addition to `public`, CockroachDB also supports a fixed set of
virtual schemas, available in every database, that provide ancillary, non-stored
data to client applications. For example,
[`information_schema`](information-schema.html) is provided for
compatibility with the SQL standard.

The list of all databases can be obtained with [`SHOW
DATABASES`](show-databases.html). The list of all schemas for a given
database can be obtained with [`SHOW SCHEMAS`](show-schemas.html). The
list of all objects for a given schema can be obtained with other
`SHOW` statements.

## How Name Resolution Works

Name resolution occurs separately to **look up existing objects** and to
**decide the full name of a new object**.

The rules to look up an existing object are as follows:

1. If the name already fully specifies the database and schema, use that information.
2. If the name has a single component prefix, try to find a schema with the prefix name in the [current database](#current-database). If that fails, try to find the object in the `public` schema of a database with the prefix name.
3. If the name has no prefix, use the [search path](#search-path) with the [current database](#current-database).

Similarly, the rules to decide the full name of a new object are as follows:

1. If the name already fully specifies the database and schema, use that.
2. If the name has a single component prefix, try to find a schema with that name. If no such schema exists, use the `public` schema in the database with the prefix name.
3. If the name has no prefix, use the [current schema](#current-schema) in the [current database](#current-database).

## Parameters for Name Resolution

### Current Database

The current database is used when a name is unqualified or has only one component prefix. It is the current value of the `database` session variable.

- You can view the current value of the `database` session variable with [`SHOW
database`](show-vars.html) and change it with [`SET database`](set-vars.html).

- You can inspect the list of valid database names that can be specified in `database` with [`SHOW DATABASES`](show-databases.html).

- For client apps that connect to CockroachDB using a URL of the form `postgres://...`, the initial value of the `database` session variable can be set using the path component of the URL. For example, `postgres://node/mydb` sets `database` to `mydb` when the connection is established.

### Search Path

The search path is used when a name is unqualified (has no prefix). It lists the schemas where objects are looked up. Its first element is also the [current schema](#current-schema) where new objects are created.

- You can set the current search path with [`SET search_path`](set-vars.html) and inspected it with [`SHOW
search_path`](show-vars.html).

- You can inspect the list of valid schemas that can be listed in `search_path` with [`SHOW SCHEMAS`](show-schemas.html).

- By default, the search path contains `public` and `pg_catalog`. For compatibility with PostgreSQL, `pg_catalog` is forced to be present in `search_path` at all times, even when not specified with
`SET search_path`.

### Current Schema

The current schema is used as target schema when creating a new object if the name is unqualified (has no prefix).

- The current schema is always the first value of `search_path`, for compatibility with PostgreSQL.

- You can inspect the current schema using the special built-in function/identifier `current_schema()`.

## Examples

The examples below use the following logical schema as a starting point:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE mydb;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE mydb.mytable(x INT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET database = mydb;
~~~

### Lookup with Unqualified Names

An unqualified name is a name with no prefix, that is, a simple identifier.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mytable;
~~~

This uses the search path over the current database. The search path
is `public` by default, in the current database. The resolved name is
`mydb.public.mytable`.

{% include_cached copy-clipboard.html %}
~~~ sql
> SET database = system;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mytable;
~~~

~~~
pq: relation "mytable" does not exist
~~~

This uses the search path over the current database, which is now
`system`. No schema in the search path contain table `mytable`, so the
look up fails with an error.

### Lookup with Fully Qualified Names

A fully qualified name is a name with two prefix components, that is,
three identifiers separated by periods.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mydb.public.mytable;
~~~

Both the database and schema components are specified. The lookup
succeeds if and only if the object exists at that specific location.

### Lookup with Partially Qualified Names

A partially qualified name is a name with one prefix component, that is, two identifiers separated by a period. When a name is partially qualified, CockroachDB will try to use the prefix as a schema name first; and if that fails, use it as a database name.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM public.mytable;
~~~

This looks up `mytable` in the `public` schema of the current
database. If the current database is `mydb`, the lookup succeeds.

For compatibility with CockroachDB 1.x, and to ease development in
multi-database scenarios, CockroachDB also allows queries to specify
a database name in a partially qualified name. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mydb.mytable;
~~~

In that case, CockroachDB will first attempt to find a schema called
`mydb` in the current database.  When no such schema exists (which is
the case with the starting point in this section), it then tries to
find a database called `mydb` and uses the `public` schema in that. In
this example, this rule applies and the fully resolved name is
`mydb.public.mytable`.

### Using the Search Path to Use Tables Across Schemas

Suppose that a client frequently accesses a stored table as well as a virtual table in the [Information Schema](information-schema.html). Because `information_schema` is not in the search path by default, all queries that need to access it must mention it explicitly.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mydb.information_schema.schemata; -- valid
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.schemata; -- valid; uses mydb implicitly
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM schemata; -- invalid; information_schema not in search_path
~~~

For clients that use `information_schema` often, you can add it to the
search path to simplify queries. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET search_path = public, information_schema;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM schemata; -- now valid, uses search_path
~~~

## Databases with Special Names

When resolving a partially qualified name with just one component
prefix, CockroachDB will look up a schema with the given prefix name
first, and only look up a database with that name if the schema lookup
fails. This matters in the (likely uncommon) case where you wish your
database to be called `information_schema`, `public`, `pg_catalog`
or `crdb_internal`.

For example:

~~~sql
> CREATE DATABASE public;
> SET database = mydb;
> CREATE TABLE public.mypublictable (x INT);
~~~

The [`CREATE TABLE`](create-table.html) statement in this example uses a partially
qualified name.  Because the `public` prefix designates a valid schema
in the current database, the full name of `mypublictable` becomes
`mydb.public.mypublictable`. The table is created in database `mydb`.

To create the table in database `public`, one would instead use a
fully qualified name, as follows:

~~~sql
> CREATE DATABASE public;
> CREATE TABLE public.public.mypublictable (x INT);
~~~

## See Also

- [`SET`](set-vars.html)
- [`SHOW`](show-vars.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [Information Schema](information-schema.html)
