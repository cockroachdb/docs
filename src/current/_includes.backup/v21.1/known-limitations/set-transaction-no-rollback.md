{% if page.name == "set-vars.md" %} `SET` {% else %} [`SET`](set-vars.html) {% endif %} does not properly apply [`ROLLBACK`](rollback-transaction.html) within a transaction. For example, in the following transaction, showing the `TIME ZONE` [variable](set-vars.html#supported-variables) does not return `2` as expected after the rollback:

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

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/69396)
