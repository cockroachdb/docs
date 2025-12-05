---
title: DROP TYPE
summary: The DROP TYPE statement drops a user-defined data type from the database.
toc: true
docs_area: reference.sql
---

The `DROP TYPE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) drops a specified [enumerated data type]({% link {{ page.version.version }}/enum.md %}) from the current database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_type.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`IF EXISTS` | Drop the type if it exists. If it does not exist, do not return an error.
`type_name_list` | A type name or a comma-separated list of type names to drop.

## Required privileges

The user must be the owner of the type.

## Details

- You cannot drop a type or view that is in use by a table.
- You can only drop a user-defined type from the database that contains the type.

## Examples

### Drop a single type

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE IF NOT EXISTS status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |        value
---------+--------+-----------------------
  public | status | open|closed|inactive
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
-- sqlchecker: ignore
> DROP TYPE status;
~~~

~~~
ERROR: cannot drop type "status" because other objects ([bank.public.accounts]) still depend on it
SQLSTATE: 2BP01
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE accounts;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TYPE status;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema | name | value
---------+------+--------
(0 rows)
~~~

### Drop multiple types

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE weekday AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE weekend AS ENUM ('sunday', 'saturday');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name   |                  value
---------+---------+-------------------------------------------
  public | weekday | monday|tuesday|wednesday|thursday|friday
  public | weekend | sunday|saturday
(2 rows)
~~~


{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TYPE weekday, weekend;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema | name | value
---------+------+--------
(0 rows)
~~~

## See also

- [`ENUM`]({% link {{ page.version.version }}/enum.md %})
- [Data types]({% link {{ page.version.version }}/data-types.md %})
- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %})
- [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %})
