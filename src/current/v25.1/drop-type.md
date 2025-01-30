---
title: DROP TYPE
summary: The DROP TYPE statement drops a user-defined data type from the database.
toc: true
docs_area: reference.sql
---

The `DROP TYPE` [statement]({{ page.version.version }}/sql-statements.md) drops a specified [enumerated data type]({{ page.version.version }}/enum.md) from the current database.



## Synopsis

<div>
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

~~~ sql
> CREATE TYPE IF NOT EXISTS status AS ENUM ('open', 'closed', 'inactive');
~~~

~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |        value
---------+--------+-----------------------
  public | status | open|closed|inactive
(1 row)
~~~

~~~ sql
> CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        balance DECIMAL,
        status status
);
~~~

~~~ sql
-- sqlchecker: ignore
> DROP TYPE status;
~~~

~~~
ERROR: cannot drop type "status" because other objects ([bank.public.accounts]) still depend on it
SQLSTATE: 2BP01
~~~

~~~ sql
> DROP TABLE accounts;
~~~

~~~ sql
> DROP TYPE status;
~~~

~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema | name | value
---------+------+--------
(0 rows)
~~~

### Drop multiple types

~~~ sql
> CREATE TYPE weekday AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
~~~

~~~ sql
> CREATE TYPE weekend AS ENUM ('sunday', 'saturday');
~~~

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


~~~ sql
> DROP TYPE weekday, weekend;
~~~

~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema | name | value
---------+------+--------
(0 rows)
~~~

## See also

- [`ENUM`]({{ page.version.version }}/enum.md)
- [Data types]({{ page.version.version }}/data-types.md)
- [`CREATE TYPE`]({{ page.version.version }}/create-type.md)
- [`ALTER TYPE`]({{ page.version.version }}/alter-type.md)
- [`SHOW ENUMS`]({{ page.version.version }}/show-enums.md)