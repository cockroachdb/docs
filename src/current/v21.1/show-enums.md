---
title: SHOW ENUMS
summary: The SHOW ENUMS statement lists the enumerated data types in a database.
toc: true
---

 The `SHOW ENUMS` statement lists the [enumerated data types](enum.html) in the current database.

## Syntax

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/show_enums.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name`<br>`name.name` | The name of the [schema](create-schema.html) from which to show enumerated data types, or the name of the [database](create-database.html) and the [schema](create-schema.html), separated by a "`.`".

## Examples

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
  schema |  name   |                   values                   | owner
---------+---------+--------------------------------------------+--------
  public | weekday | {monday,tuesday,wednesday,thursday,friday} | demo
  public | weekend | {sunday,saturday}                          | demo
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
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

- [`ENUM`](enum.html)
- [Data types](data-types.html)
- [`CREATE TYPE`](create-type.html)
- [`ALTER TYPE`](alter-type.html)
- [`DROP TYPE`](drop-type.html)
