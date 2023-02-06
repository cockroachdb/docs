- It is necessary to pass the [`schema_change_policy='stop'`](create-changefeed.html#schema-policy) option in the changefeed creation statement when using the {% if page.name == "cdc-transformations.md" %} CDC transformations {% else %} [CDC transformations](cdc-transformations.html){% endif %} format.
- You can only apply CDC transformations on a single table in each statement.
- Some [stable functions](functions-and-operators.html#built-in-functions), notably functions that return MVCC timestamps, are overridden to return the MVCC timestamp of the event.
- You cannot [alter](alter-changefeed.html) a changefeed that uses CDC transformations. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/83033)
{% include {{ page.version.version }}/known-limitations/udf-cdc-transformations.md %}
- The following are not permitted in CDC transformations:
    - [Volatile functions](functions-and-operators.html#function-volatility)
    - Sub-select queries
    - [Aggregate](functions-and-operators.html#aggregate-functions) and [window functions](window-functions.html) (i.e., functions operating over many rows).
- If a table has a boolean column, referring to the column in a `WHERE` clause can result in an error message: `expected boolean expression, found expression of type bool`. A workaround for this issue is to construct the clause as per the following: `WHERE IF(column, TRUE, FALSE)`. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/90411)

Since {% if page.name == "cdc-transformations.md" %} CDC transformations {% else %} [CDC transformations](cdc-transformations.html){% endif %} are in preview, there is continued development to improve limitations in the feature. Many of the limitations include SQL expressions that will cause an error if you try to run them within a transformation. You can view these in [GitHub](https://github.com/cockroachdb/cockroach/issues?q=is%3Aopen+label%3AA-cdc-expressions+label%3AC-bug).
