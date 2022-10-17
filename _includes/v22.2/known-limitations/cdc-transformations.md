- It is necessary to pass the [`schema_change_policy='stop'`](create-changefeed.html#schema-policy) option in the changefeed creation statement when using the {% if page.name == "cdc-transformations.md" %} CDC transformations {% else %} [CDC transformations](cdc-transformations.html){% endif %} format. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/85143).
- You can only apply CDC transformations on a single table in each statement.
- Some stable functions, notably functions that return MVCC timestamps, are overridden to return the MVCC timestamp of the event.
- You cannot [alter](alter-changefeed.html) a changefeed that uses CDC transformations. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/83033)
{% include {{ page.version.version }}/known-limitations/udf-cdc-transformations.md %}
- The following are not permitted in CDC transformations:
    - [Volatile functions](functions-and-operators.html#function-volatility)
    - Sub-select queries
    - [Aggregate](functions-and-operators.html#aggregate-functions) and [window functions](window-functions.html) (i.e., functions operating over many rows).