---
title: Name Resolution
summary: Object names can exist in multiple places in the naming hierarchy. Resolution decides which one to use.
toc: true
docs_area: reference.sql
---

This page documents **name resolution** in CockroachDB.

To reference an object (e.g., a table) in a query, you can specify the [identifier]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers) that refers to a database, a schema, both, or neither. To resolve which object a query references, CockroachDB scans the [appropriate namespaces](#naming-hierarchy), following the rules in [How name resolution works](#how-name-resolution-works).

## Naming hierarchy

For compatibility with PostgreSQL, CockroachDB supports a **three-level structure for names**. This is called the "naming hierarchy".

In the naming hierarchy, the path to a stored object has three components:

- Database name
- Schema name
- Object name

A CockroachDB cluster can store multiple databases. Each database can store multiple schemas, and each schema can store multiple [tables]({% link {{ page.version.version }}/create-table.md %}), [views]({% link {{ page.version.version }}/views.md %}), [sequences]({% link {{ page.version.version }}/create-sequence.md %}), and [user-defined types]({% link {{ page.version.version }}/enum.md %}).

When you first [start a cluster]({% link {{ page.version.version }}/start-a-local-cluster.md %}), a number of [preloaded databases]({% link {{ page.version.version }}/show-databases.md %}#preloaded-databases) and schemas are included, including the `defaultdb` database and the `public` schema. By default, objects (e.g., tables) are stored in the preloaded `public` schema, in the [current database](#current-database) (`defaultdb`, by default).

In addition to the `public` schema, CockroachDB supports a fixed set of [system catalog schemas]({% link {{ page.version.version }}/system-catalogs.md %}), available in every database, that provide ancillary, non-stored data to client applications. For example, [`information_schema`]({% link {{ page.version.version }}/information-schema.md %}) is provided for compatibility with the SQL standard, and [`pg_catalog`]({% link {{ page.version.version }}/pg-catalog.md %}) and [`pg_extension`]({% link {{ page.version.version }}/architecture/glossary.md %}#spatial-system-tables) are provided for compatibility with PostgreSQL.

To create a new database, use a [`CREATE DATABASE`]({% link {{ page.version.version }}/create-database.md %}) statement. To create a new schema, use a [`CREATE SCHEMA`]({% link {{ page.version.version }}/create-schema.md %}) statement. The list of all databases can be obtained with [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %}). The list of all schemas for a given database can be obtained with [`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %}). The list of all objects for a given schema can be obtained with other `SHOW` statements.

### Migrating namespaces from previous versions of CockroachDB

In CockroachDB versions < v20.2, [user-defined schemas]({% link {{ page.version.version }}/create-schema.md %}) are not supported, and all objects created in a given database use the `public` schema. To provide a multi-level structure for stored objects in earlier versions of CockroachDB, we have recommended using [database]({% link {{ page.version.version }}/create-database.md %}) namespaces instead of schema namespaces.

In CockroachDB versions >= v20.2, we recommend using schema namespaces, not database namespaces, to create a naming structure that is more similar to [PostgreSQL](https://www.postgresql.org/docs/current/ddl-schemas.html).

If you are upgrading to {{ page.version.version }}, take any combination of the following actions after the upgrade is complete:

- [Create new schemas]({% link {{ page.version.version }}/create-schema.md %}) in databases on your cluster. After the schemas are created, use [`ALTER TABLE ... RENAME`]({% link {{ page.version.version }}/alter-table.md %}#rename-to), [`ALTER SEQUENCE ... RENAME`]({% link {{ page.version.version }}/alter-sequence.md %}), [`ALTER TYPE ... RENAME`]({% link {{ page.version.version }}/alter-type.md %}), or [`ALTER VIEW ... RENAME`]({% link {{ page.version.version }}/alter-view.md %}) statements to move objects between databases as needed. To move objects between schemas, use [`ALTER TABLE ... SET SCHEMA`]({% link {{ page.version.version }}/alter-table.md %}#set-schema), [`ALTER SEQUENCE ... SET SCHEMA`]({% link {{ page.version.version }}/alter-sequence.md %}), or [`ALTER VIEW ... SET SCHEMA`]({% link {{ page.version.version }}/alter-view.md %}).

- If your cluster contains cross-database references (e.g., a cross-database foreign key reference, or a cross-database view reference), use the relevant [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}), [`ALTER SEQUENCE`]({% link {{ page.version.version }}/alter-sequence.md %}), [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %}), or [`ALTER VIEW `]({% link {{ page.version.version }}/alter-view.md %}) statements to move any cross-referencing objects to the same database, but different schemas. Cross-database object references were allowed in earlier versions of CockroachDB to make database-object naming hierarchies more flexible for users. In v20.2, creating cross-database references are disabled for [foreign keys](foreign-key.html), [views]({% link {{ page.version.version }}/views.md %}), and [sequence ownership]({% link {{ page.version.version }}/create-sequence.md %}). For details, see [tracking issue](https://github.com/cockroachdb/cockroach/issues/55791).

## How name resolution works

Name resolution occurs separately to **look up existing objects** and to
**decide the full name of a new object**.

The rules to look up an existing object are as follows:

1. If the name already fully specifies the database and schema, use that information.
1. If the name has a single-component prefix (e.g., a schema name), try to find a schema with the prefix name in the [current database](#current-database) and [current schema](#current-schema). If that fails, try to find the object in the `public` schema of a database with the prefix name.
1. If the name has no prefix, use the [search path](#search-path) with the [current database](#current-database).

Similarly, the rules to decide the full name of a new object are as follows:

1. If the name already fully specifies the database and schema, use that.
1. If the name has a single-component prefix (e.g., a schema name), try to find a schema with that name. If no such schema exists, use the `public` schema in the database with the prefix name.
1. If the name has no prefix, use the [current schema](#current-schema) in the [current database](#current-database).

## Parameters for name resolution

### Current database

The current database is used when a name is unqualified or has only one component prefix. It is the current value of the `database` session variable.

- You can view the current value of the `database` session variable with [`SHOW
database`]({% link {{ page.version.version }}/show-vars.md %}) and change it with [`SET database`]({% link {{ page.version.version }}/set-vars.md %}).

- You can inspect the list of valid database names that can be specified in `database` with [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %}).

- For client apps that connect to CockroachDB using a URL of the form `postgres://...`, the initial value of the `database` session variable can be set using the path component of the URL. For example, `postgres://node/mydb` sets `database` to `mydb` when the connection is established.

### Search path

The search path is used when a name is unqualified (i.e., has no prefix). It lists the schemas where objects are looked up. Its first element is also the [current schema](#current-schema) where new objects are created.

- You can set the current search path with [`SET search_path`]({% link {{ page.version.version }}/set-vars.md %}) and inspected it with [`SHOW
search_path`]({% link {{ page.version.version }}/show-vars.md %}).
- You can inspect the list of valid schemas that can be listed in `search_path` with [`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %}).
- By default, the search path contains `$user`, `public`, `pg_catalog`, and `pg_extension`. For compatibility with PostgreSQL, `pg_catalog` is forced to be present in `search_path` at all times, even when not specified with `SET search_path`.
- To mimic the behavior in PostgreSQL, CockroachDB will attempt a resolution to `pg_extension` prior to attempting `public`.

### Current schema

The current schema is used as target schema when creating a new object if the name is unqualified (has no prefix).

- The current schema is always the first value of `search_path`, for compatibility with PostgreSQL.

- You can inspect the current schema using the special built-in function/identifier `current_schema()`.

## Index name resolution

CockroachDB supports the following ways to specify an index name for statements that require one (e.g., [`DROP INDEX`]({% link {{ page.version.version }}/drop-index.md %}), [`ALTER INDEX ... RENAME`]({% link {{ page.version.version }}/alter-index.md %}), etc.):

1. Index names are resolved relative to a table name using the `@` character, e.g., `DROP INDEX tbl@idx;`.  This is the default and most common syntax.
1. Index names are resolved by searching all tables in the current schema to find a table with an index named `idx`, e.g., `DROP INDEX idx;` or (with optional schema prefix) `DROP INDEX public.idx;`.  This syntax is necessary for PostgreSQL compatibility because PostgreSQL index names live in the schema namespace such that e.g., `public.idx` will resolve to the index `idx` of some table in the public schema.  This capability is used by some ORMs.

The name resolution algorithm for index names supports both partial and complete qualification, using the same [name resolution rules](#how-name-resolution-works) as other objects.

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

### Lookup with unqualified names

An unqualified name is a name with no prefix, that is, a simple identifier.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mytable;
~~~

This uses the search path over the current database. The search path is `$user` by default, in the current database. If a `$user` schema does not exist, the search path resolves to the `public` schema. In this case, there is no `$user` schema, and the resolved name is `mydb.public.mytable`.

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

### Lookup with fully qualified names

A fully qualified name is a name with two prefix components, that is,
three identifiers separated by periods.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mydb.public.mytable;
~~~

Both the database and schema components are specified. The lookup
succeeds if and only if the object exists at that specific location.

### Lookup with partially qualified names

A partially qualified name is a name with one prefix component, that is, two identifiers separated by a period. When a name is partially qualified, CockroachDB will try to use the prefix as a schema name first; and if that fails, use it as a database name.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM public.mytable;
~~~

This looks up `mytable` in the `public` schema of the current
database. If the current database is `mydb`, the lookup succeeds.

To ease development in multi-database scenarios, CockroachDB also allows queries to specify a database name in a partially qualified name. For example:

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

### Using the search path to use tables across schemas

Suppose that a client frequently accesses a stored table as well as a virtual table in the [Information Schema]({% link {{ page.version.version }}/information-schema.md %}). Because `information_schema` is not in the search path by default, all queries that need to access it must mention it explicitly.

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

## Databases with special names

When resolving a partially qualified name with just one component
prefix, CockroachDB will look up a schema with the given prefix name
first, and only look up a database with that name if the schema lookup
fails. This matters in the (likely uncommon) case where you wish your
database to be called `information_schema`, `public`, `pg_catalog`, [`pg_extension`]({% link {{ page.version.version }}/architecture/glossary.md %}#spatial-system-tables),
or `crdb_internal`.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE public;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET database = mydb;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE public.mypublictable (x INT);
~~~

The [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) statement in this example uses a partially
qualified name.  Because the `public` prefix designates a valid schema
in the current database, the full name of `mypublictable` becomes
`mydb.public.mypublictable`. The table is created in database `mydb`.

To create the table in database `public`, one would instead use a
fully qualified name, as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE public;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE public.public.mypublictable (x INT);
~~~

### Preloaded databases

{% include {{ page.version.version }}/sql/preloaded-databases.md %}

## See also

- [`CREATE SCHEMA`]({% link {{ page.version.version }}/create-schema.md %})
- [`SET`]({% link {{ page.version.version }}/set-vars.md %})
- [`SHOW`]({% link {{ page.version.version }}/show-vars.md %})
- [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %})
- [`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %})
- [Information Schema]({% link {{ page.version.version }}/information-schema.md %})
- [Keywords and Identifiers]({% link {{ page.version.version }}/keywords-and-identifiers.md %})
