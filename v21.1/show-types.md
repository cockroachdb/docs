---
title: SHOW TYPES
summary: The SHOW TYPES statement lists the user-defined data types in a database.
toc: true
---

 The `SHOW TYPES` statement lists the user-defined [data types](data-types.html) in the current database.

{{site.data.alerts.callout_info}}
CockroachDB currently only supports [enumerated user-defined types](enum.html). As a result, [`SHOW ENUMS`](show-enums.html) and `SHOW TYPES` return the same results.
{{site.data.alerts.end}}

## Syntax

~~~
SHOW TYPES
~~~

## Required privileges

The `SELECT` [privilege](authorization.html#assign-privileges) on the database is required to list any user-defined types in the database.

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
> SHOW TYPES;
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
