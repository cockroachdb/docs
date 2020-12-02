---
title: DROP TYPE
summary: The DROP TYPE statement drops an enumerated data type from the database.
toc: true
---

 The `DROP TYPE` [statement](sql-statements.html) drops a specified [enumerated data type](enum.html) from the current database.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/drop_type.html %}
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

## Example

### Drop a single type

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |        value
---------+--------+-----------------------
  public | status | open|closed|inactive
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        balance DECIMAL,
        status status
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> DROP TYPE status;
~~~

~~~
ERROR: cannot drop type "status" because other objects ([bank.public.accounts]) still depend on it
SQLSTATE: 2BP01
~~~

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE accounts;
~~~

{% include copy-clipboard.html %}
~~~ sql
> DROP TYPE status;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema | name | value
---------+------+--------
(0 rows)
~~~

### Drop multiple types

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE weekday AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE weekend AS ENUM ('sunday', 'saturday');
~~~

{% include copy-clipboard.html %}
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


{% include copy-clipboard.html %}
~~~ sql
> DROP TYPE weekday, weekend;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema | name | value
---------+------+--------
(0 rows)
~~~

## See also

- [`ENUM`](enum.html)
- [Data types](data-types.html)
- [`CREATE TYPE`](create-type.html)
- [`ALTER TYPE`](alter-type.html)
- [`SHOW ENUMS`](show-enums.html)
