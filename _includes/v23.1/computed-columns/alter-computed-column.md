To alter the formula for a computed column, you must [`DROP`](alter-table.html#drop-column) and [`ADD`](alter-table.html#add-column) the column back with the new definition. Take the following table for instance:

{% include_cached copy-clipboard.html %}
~~~sql
> CREATE TABLE x (
a INT NULL,
b INT NULL AS (a * 2) STORED,
c INT NULL AS (a + 4) STORED,
FAMILY "primary" (a, b, rowid, c)
);
~~~
~~~
CREATE TABLE


Time: 4ms total (execution 4ms / network 0ms)
~~~

Add a computed column `d`:

{% include_cached copy-clipboard.html %}
~~~sql
> ALTER TABLE x ADD COLUMN d INT AS (a // 2) STORED;
~~~
~~~
ALTER TABLE


Time: 199ms total (execution 199ms / network 0ms)
~~~

If you try to alter it, you'll get an error:

{% include_cached copy-clipboard.html %}
~~~sql
> ALTER TABLE x ALTER COLUMN d INT AS (a // 3) STORED;
~~~
~~~
invalid syntax: statement ignored: at or near "int": syntax error
SQLSTATE: 42601
DETAIL: source SQL:
ALTER TABLE x ALTER COLUMN d INT AS (a // 3) STORED
                             ^
HINT: try \h ALTER TABLE
~~~

However, you can drop it and then add it with the new definition:

{% include_cached copy-clipboard.html %}
~~~sql
> SET sql_safe_updates = false;
> ALTER TABLE x DROP COLUMN d;
> ALTER TABLE x ADD COLUMN d INT AS (a // 3) STORED;
> SET sql_safe_updates = true;
~~~
~~~
SET


Time: 1ms total (execution 0ms / network 0ms)

ALTER TABLE


Time: 195ms total (execution 195ms / network 0ms)

ALTER TABLE


Time: 186ms total (execution 185ms / network 0ms)

SET


Time: 0ms total (execution 0ms / network 0ms)
~~~
