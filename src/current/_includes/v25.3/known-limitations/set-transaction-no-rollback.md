{% if page.name == "set-vars.md" %} `SET` {% else %} [`SET`]({% link {{ page.version.version }}/set-vars.md %}) {% endif %} does not properly apply [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) within a transaction. For example, in the following transaction, showing the `TIME ZONE` [variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) does not return `2` as expected after the rollback:

~~~sql
SET TIME ZONE +2;
BEGIN;
SET TIME ZONE +3;
ROLLBACK;
SHOW TIME ZONE;
~~~

~~~sql
timezone
------------
3
~~~

[#69396](https://github.com/cockroachdb/cockroach/issues/69396)
