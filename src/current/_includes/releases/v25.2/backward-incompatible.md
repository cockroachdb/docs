Before [upgrading to CockroachDB v25.1]({% link v25.1/upgrade-cockroach-version.md %}), be sure to review the following backward-incompatible changes, as well as [key cluster setting changes](#v25-1-0-cluster-settings), and adjust your deployment as necessary.

- Bullet

- Bullet

- Bullet

- Bullet

- Bullet
  - Removed `sql.schema_changer.running`, which is redundant with `jobs.schema_change.currently_running`.
  - Removed `sql.schema_changer.successes`, which is redundant with `jobs.schema_change.resume_completed`.
  - Removed `sql.schema_changer.retry_errors`, which is redundant with `jobs.schema_change.resume_retry_error`.
  - Removed `sql.schema_changer.permanent_errors`, which is redundant with `jobs.schema_change.resume_failed`.

- Bullet

    This change is being made because CockroachDB does not have full support for multiple schema changes in a transaction, as described [here]({% link v25.1/online-schema-changes.md %}#schema-changes-within-transactions).

    Users who do not desire the autocommit behavior can preserve the old behavior by changing the default value of `autocommit_before_ddl` with a command such as:

    ``` ALTER ROLE ALL SET autocommit_before_ddl = false; ``` 
  
    [#][#]


[#]: https://github.com/cockroachdb/cockroach/pull/
[#]: https://github.com/cockroachdb/cockroach/pull/
[#]: https://github.com/cockroachdb/cockroach/pull/
[#]: https://github.com/cockroachdb/cockroach/pull/
[#]: https://github.com/cockroachdb/cockroach/pull/
[#]: https://github.com/cockroachdb/cockroach/pull/