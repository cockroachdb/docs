## Limit the size of rows

You can specify the behavior when you write a row larger than a specified size to the database (or
individual column families, if multiple column families are in use). The [cluster settings](cluster-settings.html)
`sql.mutations.max_row_size.log` and `sql.guardrails.max_row_size.err` can help you avoid failures arising
from misbehaving applications that bloat the size of rows.

The `sql.mutations.max_row_size.log` setting controls large row logging. Whenever a `INSERT`, `UPSERT`, `UPDATE`, `CREATE TABLE AS`, `CREATE INDEX`,
`ALTER TABLE`, `ALTER INDEX`, `IMPORT`, or `RESTORE` statement writes a row larger than this size, a `LargeRow` event
is logged to the [`SQL_PERF`](logging.html#sql_perf) channel. `SELECT`, `DELETE`, `TRUNCATE`, and `DROP` are not affected.

When you write a row that exceeds `sql.guardrails.max_row_size.err`:

- `INSERT`, `UPSERT`, and `UPDATE` statements will fail with a code `54000 (program_limit_exceeded)` error.

- `CREATE TABLE AS`, `CREATE INDEX`, `ALTER TABLE`, `ALTER INDEX`, `IMPORT`, and `RESTORE` statements will log a `LargeRowInternal` event to the [`SQL_INTERNAL_PERF`](logging.html#sql_internal_perf) channel.

- `SELECT`, `DELETE`, `TRUNCATE`, and `DROP` are not affected.

You **cannot** update existing rows that violate the limit unless the update shrinks the size of the
row below the limit. You **can** select, delete, alter, backed up, and restore such rows. We
recommend using the accompanying setting `sql.guardrails.max_row_size.log` in conjunction with
`SELECT pg_column_size()` queries to detect and fix any existing large rows before lowering
`sql.guardrails.max_row_size.err`.
