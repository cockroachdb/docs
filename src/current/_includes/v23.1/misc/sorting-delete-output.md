To sort the output of a `DELETE` statement, use:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH a AS (DELETE ... RETURNING ...)
  SELECT ... FROM a ORDER BY ...
~~~

For an example, see [Sort and return deleted rows]({% link {{ page.version.version }}/delete.md %}#sort-and-return-deleted-rows).
