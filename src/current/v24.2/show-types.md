---
title: SHOW TYPES
summary: The SHOW TYPES statement lists the user-defined data types in a database.
toc: true
docs_area: reference.sql
---

 The `SHOW TYPES` statement lists the user-defined [data types]({% link {{ page.version.version }}/data-types.md %}) in the current database.

{{site.data.alerts.callout_info}}
CockroachDB currently only supports [enumerated user-defined types]({% link {{ page.version.version }}/enum.md %}). As a result, [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %}) and `SHOW TYPES` return the same results.
{{site.data.alerts.end}}

## Syntax

~~~
SHOW TYPES
~~~

## Required privileges

The `CONNECT` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the database is required to list any user-defined types in the database.

## Examples

The following example creates a [user-defined type]({% link {{ page.version.version }}/create-type.md %}).

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

- [`ENUM`]({% link {{ page.version.version }}/enum.md %})
- [Data types]({% link {{ page.version.version }}/data-types.md %})
- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
