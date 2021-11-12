## Limit the size of rows

To help you avoid failures arising from misbehaving applications that bloat the size of rows, you can specify the behavior when a row or individual [column family](column-families.html) larger than a specified size is written to the database. Use the [cluster settings](cluster-settings.html) `sql.guardrails.max_row_size_log` to discover large rows and `sql.guardrails.max_row_size_err` to reject large rows.

When you write a row that exceeds `sql.guardrails.max_row_size_log`:

- `INSERT`, `UPSERT`, `UPDATE`, `CREATE TABLE AS`, `CREATE INDEX`, `ALTER TABLE`, `ALTER INDEX`, `IMPORT`, or `RESTORE` statements will log a `LargeRow` to the [`SQL_PERF`](logging.html#sql_perf) channel.
- `SELECT`, `DELETE`, `TRUNCATE`, and `DROP` are not affected.

When you write a row that exceeds `sql.guardrails.max_row_size_err`:

- `INSERT`, `UPSERT`, and `UPDATE` statements will fail with a code `54000 (program_limit_exceeded)` error.

- `CREATE TABLE AS`, `CREATE INDEX`, `ALTER TABLE`, `ALTER INDEX`, `IMPORT`, and `RESTORE` statements will log a `LargeRowInternal` event to the [`SQL_INTERNAL_PERF`](logging.html#sql_internal_perf) channel.

- `SELECT`, `DELETE`, `TRUNCATE`, and `DROP` are not affected.

You **cannot** update existing rows that violate the limit unless the update shrinks the size of the
row below the limit. You **can** select, delete, alter, back up, and restore such rows. We
recommend using the accompanying setting `sql.guardrails.max_row_size_log` in conjunction with
`SELECT pg_column_size()` queries to detect and fix any existing large rows before lowering
`sql.guardrails.max_row_size_err`.
