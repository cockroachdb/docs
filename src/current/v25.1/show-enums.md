---
title: SHOW ENUMS
summary: The SHOW ENUMS statement lists the enumerated data types in a database.
toc: true
docs_area: reference.sql
---

The `SHOW ENUMS` statement lists the [enumerated data types]({{ page.version.version }}/enum.md) in the current database.

## Syntax

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`name`<br>`name.name` | The name of the [schema]({{ page.version.version }}/create-schema.md) from which to show enumerated data types, or the name of the [database]({{ page.version.version }}/create-database.md) and the [schema]({{ page.version.version }}/create-schema.md), separated by a "`.`".

## Examples

The following example creates a [user-defined type]({{ page.version.version }}/create-type.md).

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
  schema |  name   |                   values                   | owner
---------+---------+--------------------------------------------+--------
  public | weekday | {monday,tuesday,wednesday,thursday,friday} | demo
  public | weekend | {sunday,saturday}                          | demo
(2 rows)
~~~

~~~ sql
> SHOW ENUMS FROM movr.public;
~~~

~~~
  schema |  name   |                   values                   | owner
---------+---------+--------------------------------------------+--------
  public | weekday | {monday,tuesday,wednesday,thursday,friday} | demo
  public | weekend | {sunday,saturday}                          | demo
(2 rows)
~~~


## See also

- [`ENUM`]({{ page.version.version }}/enum.md)
- [Data types]({{ page.version.version }}/data-types.md)
- [`CREATE TYPE`]({{ page.version.version }}/create-type.md)
- [`ALTER TYPE`]({{ page.version.version }}/alter-type.md)
- [`DROP TYPE`]({{ page.version.version }}/drop-type.md)