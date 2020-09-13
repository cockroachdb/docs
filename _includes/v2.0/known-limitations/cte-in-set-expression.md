{{site.data.alerts.callout_info}}
Resolved as of v2.1.
{{site.data.alerts.end}}

It is not yet possible to use a [common table expression](common-table-expressions.html) defined outside of a [set expression](selection-queries.html#set-operations) in the right operand of a set operator, for example:

~~~ sql
> WITH a AS (SELECT 1)
  SELECT * FROM users UNION SELECT * FROM a; -- "a" used on the right, not yet supported.
~~~

For `UNION`, you can work around this limitation by swapping the operands. For the other set operators, you can inline the definition of the CTE inside the right operand.
