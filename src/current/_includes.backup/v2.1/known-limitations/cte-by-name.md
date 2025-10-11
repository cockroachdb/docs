It is currently not possible to refer to a [common table expression](common-table-expressions.html) by name more than once.

For example, the following query is invalid because the CTE `a` is
referred to twice:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH a AS (VALUES (1), (2), (3))
  SELECT * FROM a, a;
~~~
