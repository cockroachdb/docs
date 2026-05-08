---
title: CREATE TYPE
summary: The CREATE TYPE statement creates a new user-defined data type in a database.
toc: true
docs_area: reference.sql
---

The `CREATE TYPE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates a new type in a [database]({% link {{ page.version.version }}/create-database.md %}). After the type is created, it can only be referenced from the database that contains the type.

The following user-defined data types can be created with this statement:

- [Enumerated data type](#create-an-enumerated-data-type)
- [Composite data type](#create-a-composite-data-type)

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_type.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`type_name` | The name of the type. You can qualify the name with a [database and schema name]({% link {{ page.version.version }}/sql-name-resolution.md %}) (e.g., `db.typename`), but after the type is created, it can only be referenced from the database that contains the type.
`IF NOT EXISTS` |  Create a new type only if a type of the same name does not already exist in the database; if one does exist, do not return an error.
`opt_enum_val_list` | A list of values that make up the type's [enumerated set](#create-an-enumerated-data-type).
`opt_composite_type_list` | A list of values that make up the set of types that make up a [composite type](#create-a-composite-data-type).

## Required privileges

- To create a type, the user must have [the `CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the parent database and the schema in which the type is being created.
- To use a user-defined type in a table (e.g., when defining a column's type), the user must have [the `USAGE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the type.

## Example

### Create an enumerated data type

Use the statements below to create an [`ENUM`]({% link {{ page.version.version }}/enum.md %}) data type.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE IF NOT EXISTS status AS ENUM ('open', 'closed', 'inactive');
~~~

To see all user-defined data types, use [`SHOW TYPES`]({% link {{ page.version.version }}/show-types.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TYPES;
~~~

~~~
  schema |  name  | owner
---------+--------+--------
  public | status | root
(1 row)
~~~

To see the values accepted by the underlying [`ENUM`]({% link {{ page.version.version }}/enum.md %}) data type, use [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |         values         | owner
---------+--------+------------------------+--------
  public | status | {open,closed,inactive} | root
(1 row)
~~~


{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        balance DECIMAL,
        status status
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts(balance,status) VALUES (500.50,'open'), (0.00,'closed'), (1.25,'inactive');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
                   id                  | balance |  status
---------------------------------------+---------+-----------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
  60928059-ef75-47b1-81e3-25ec1fb6ff10 |    0.00 | closed
  71ae151d-99c3-4505-8e33-9cda15fce302 |    1.25 | inactive
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE accounts;
~~~

~~~
  table_name |                create_statement
-------------+--------------------------------------------------
  accounts   | CREATE TABLE public.accounts (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     balance DECIMAL NULL,
             |     status public.status NULL,
             |     CONSTRAINT accounts_pkey PRIMARY KEY (id ASC)
             | )
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE status='open';
~~~

~~~
                   id                  | balance | status
---------------------------------------+---------+---------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
(1 row)
~~~

### Create a composite data type

Use the statements below to create a composite data type:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TYPE IF NOT EXISTS my_point AS (x INT, y INT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS points (
    id UUID DEFAULT gen_random_uuid(), p my_point,
    CONSTRAINT my_point_xcheck
        CHECK (((p).x >= 0) AND ((p).x <= 10000)),
    CONSTRAINT my_point_ycheck
        CHECK (((p).y >= 0) AND ((p).y <= 10000))
);
~~~

Insert 10,000 randomly generated values of type `mypoint`:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO points (p) SELECT (floor(random()*10000),floor(random()*10000))::MY_POINT FROM generate_series(1,10000);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM points ORDER BY ((p).x) ASC LIMIT 25;
~~~

~~~
                   id                  |     p
---------------------------------------+------------
  434095ae-6297-490a-9040-278c749b4d29 | (0,9982)
  4f3155f6-d184-415b-98af-22b061da6623 | (1,5242)
  ff3eda0a-c144-43c4-9bbc-0c14e90a0349 | (1,4053)
  8a97e5f1-9db6-4458-8d3a-172f8624560c | (7,9857)
  1a599ed3-0a86-4096-851b-d5b35fb9cea4 | (7,599)
  5fc17aef-6de4-452c-a434-a709b2210938 | (9,9786)
  0967799c-c726-4f42-915e-4517ea3c589b | (9,458)
  6c1a46a9-66f8-4e96-8501-49fe6f77490c | (10,1447)
  a10824ec-3d17-4162-8457-372a76675a84 | (10,808)
  e7edf3fb-88f6-4675-9c79-44f74b7d0f49 | (11,1654)
  fd477aec-6685-4607-a940-7d4b1608913b | (11,6563)
  5806fcb5-28b6-4a94-b8dc-229fadb1d46d | (12,5519)
  a9545c0c-2b45-4e1f-bb19-e9a7a1630d6f | (12,4474)
  d591111b-a1c1-4168-8565-41f3d914dc6d | (12,7164)
  262482e5-d58d-463a-8a1d-ed66389e9424 | (15,3047)
  dfd75b68-1da0-4ea1-8e6e-66a9dd7389da | (16,1306)
  060070ee-40df-4c97-badb-9c08a2f54209 | (16,3016)
  33b77621-596b-4ee3-98e9-127ba942f1a7 | (16,2343)
  f3c7e11a-1784-4604-b083-e78dd32ab8b4 | (17,5155)
  485d45ae-0870-47b6-b986-4fabf0207644 | (17,4715)
  319f2184-3743-4fb2-8fe7-8efb0710bbee | (19,8570)
  ca55a46a-e5b6-4da5-8be5-575a39cea07c | (19,6667)
  f1ef70f6-0fb7-4338-b488-14cc6187e61b | (20,9113)
  3b18c682-967b-408d-8877-4ac102da3f12 | (21,5736)
  d0dd5914-a353-4603-a9a8-494f68db01f9 | (21,4328)
(25 rows)
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/composite-type-limitations.md %}

## See also

- [Data types]({% link {{ page.version.version }}/data-types.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
- [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
- [`SHOW TYPES`]({% link {{ page.version.version }}/show-types.md %})
- [`ENUM`]({% link {{ page.version.version }}/enum.md %})
- [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %})
