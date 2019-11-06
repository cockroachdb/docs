Schema change [DDL](https://en.wikipedia.org/wiki/Data_definition_language#ALTER_statement) that runs inside a multi-statement transaction with non-DDL statements can fail at [`COMMIT`](commit-transaction.html) time, even if other statements in the transaction succeed.  This leaves such transactions in a "partially committed, partially aborted" state that may require manual intervention to ensure data integrity.

<span class="version-tag">New in v19.2:</span> If such a failure occurs, CockroachDB will now emit a new CockroachDB-specific error code, `XXA00`, and the following error message:

```
transaction committed but schema change aborted with error: <description of error>
HINT: Some of the non-DDL statements may have committed successfully, but some of the DDL statement(s) failed.
Manual inspection may be required to determine the actual state of the database.
```

{{site.data.alerts.callout_danger}}
If you must execute schema change DDL inside a multi-statement transaction, we **strongly recommend** checking for this error code and handling it appropriately every time you execute such transactions.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
This limitation exists in versions of CockroachDB prior to 19.2.  In these older versions, CockroachDB returned the Postgres error code `40003`, `"statement completion unknown"`.
{{site.data.alerts.end}}

To trigger this error, start by creating the following table.

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE t (x INT8);
INSERT INTO t (x) VALUES (0);
~~~

Then, enter the following multi-statement transaction, which will trigger the error.

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
ALTER TABLE t ADD COLUMN z INT8 DEFAULT 123;
INSERT INTO t (x) VALUES (1);
ALTER TABLE t
	ADD COLUMN y FLOAT8 AS (1::FLOAT8 / x::FLOAT8) STORED;
COMMIT;
~~~

~~~
pq: transaction committed but schema change aborted with error: (42P15): division by zero
HINT: Some of the non-DDL statements may have committed successfully, but some of the DDL statement(s) failed.
Manual inspection may be required to determine the actual state of the database.
~~~

In this example, the [`INSERT into t (x) ...`](insert.html) statement committed, but the [`ALTER TABLE`](alter-table.html) statements failed.  We can verify this by looking at the columns of `t` and seeing that no column `y` or column `z` were created.

{% include copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM t;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden  
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  x           | INT8      |    true     | NULL           |                       | {}        |   false    
  rowid       | INT8      |    false    | unique_rowid() |                       | {primary} |   true     
(2 rows)
~~~
