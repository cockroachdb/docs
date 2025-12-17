Before [upgrading to CockroachDB v25.1]({% link "v25.1/upgrade-cockroach-version.md" %}), be sure to review the following backward-incompatible changes, as well as [key cluster setting changes](#v25-1-0-cluster-settings), and adjust your deployment as necessary.

- The old `BACKUP TO`, `RESTORE FROM <collectionURI>`, and `SHOW BACKUP IN <collectionURI>` syntaxes are now fully deprecated and no longer usable. [#133610][#133610]

- Altering a paused backup schedule's recurrence or location no longer resumes the schedule. [#134829][#134829]

- `BACKUP`/`RESTORE` statements no longer return index entries and bytes backed up/restored. [#134516][#134516]

- Introduced the `legacy_varchar_typing` session setting. If `on`, type checking and overload resolution for VARCHAR types ignore overloads that cause errors, allowing comparisons between VARCHAR and non-STRING-like placeholder values to execute successfully. If `off`, type checking of these comparisons is more strict and must be handled with explicit type casts. As of v25.1.0 this setting defaults to `off`. [#137844][#137844]

- Several metrics are redundant and have been removed. The following list maps each removed metric to an existing, identical metric. [#138786][#138786]
  - Removed `sql.schema_changer.running`, which is redundant with `jobs.schema_change.currently_running`.
  - Removed `sql.schema_changer.successes`, which is redundant with `jobs.schema_change.resume_completed`.
  - Removed `sql.schema_changer.retry_errors`, which is redundant with `jobs.schema_change.resume_retry_error`.
  - Removed `sql.schema_changer.permanent_errors`, which is redundant with `jobs.schema_change.resume_failed`.

- The default value of the `autocommit_before_ddl` session variable is now `true`. This will cause any schema change statement that is sent during a transaction to make the current transaction commit before executing the schema change in a separate transaction.

    This change is being made because CockroachDB does not have full support for multiple schema changes in a transaction, as described [here]({% link "v25.1/online-schema-changes.md" %}#schema-changes-within-transactions).

    Users who do not desire the autocommit behavior can preserve the old behavior by changing the default value of `autocommit_before_ddl` with a command such as:

    ``` ALTER ROLE ALL SET autocommit_before_ddl = false; ``` 
  
    [#140156][#140156]


[#133610]: https://github.com/cockroachdb/cockroach/pull/133610
[#134829]: https://github.com/cockroachdb/cockroach/pull/134829
[#134516]: https://github.com/cockroachdb/cockroach/pull/134516
[#137844]: https://github.com/cockroachdb/cockroach/pull/137844
[#138786]: https://github.com/cockroachdb/cockroach/pull/138786
[#140156]: https://github.com/cockroachdb/cockroach/pull/140156