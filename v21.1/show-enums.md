---
title: SHOW ENUMS
summary: The SHOW ENUMS statement lists the enumerated data types in a database.
toc: true
---

 The `SHOW ENUMS` statement lists the [enumerated data types](enum.html) in the current database.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_enums.html %}
</div>

## Examples

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


## See also

- [`ENUM`](enum.html)
- [Data types](data-types.html)
- [`CREATE TYPE`](create-type.html)
- [`ALTER TYPE`](alter-type.html)
- [`DROP TYPE`](drop-type.html)
