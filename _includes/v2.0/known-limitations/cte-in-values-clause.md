It is not yet possible to use a [common table expression](common-table-expressions.html) define outside of a `VALUES` clause in a [subquery](subqueries.html) inside the [`VALUES`](selection-queries.html#values-clause) clause, for example:

~~~ sql
> WITH a AS (...) VALUES ((SELECT * FROM a));
~~~
