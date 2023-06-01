To sort the output of a `DELETE` statement, use:

{% include copy-clipboard.html %}
~~~ sql
> WITH a AS (DELETE ... RETURNING ...)
  SELECT ... FROM a ORDER BY ...
~~~

For an example, see [Sort and return deleted rows](delete.html#sort-and-return-deleted-rows).
