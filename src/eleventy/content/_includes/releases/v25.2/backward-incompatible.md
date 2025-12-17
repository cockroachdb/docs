Before [upgrading to CockroachDB v25.2]({% link "v25.2/upgrade-cockroach-version.md" %}), be sure to review the following backward-incompatible changes, as well as [key cluster setting changes](#v25-2-0-cluster-settings), and adjust your deployment as necessary.

- The default value of the `autocommit_before_ddl` session variable is now `true`. This will cause any schema change statement that is sent during a transaction to make the current transaction commit before executing the schema change in a separate transaction. Users who do not want the autocommit behavior can preserve the previous behavior by changing the default value of `autocommit_before_ddl` with: `ALTER ROLE ALL SET autocommit_before_ddl = false;`. [#139871]
- `DROP INDEX` can now only be run when `sql_safe_updates` is set to `false`. [#139456]
- Vector indexes do not support mutation while being created with `CREATE INDEX` or rebuilt with `ALTER PRIMARY KEY`. To prevent inadvertent application downtime, set the `sql_safe_updates` session setting to `false` when using `CREATE INDEX` or `ALTER PRIMARY KEY` with a vector index. [#144601]
- The variable arguments of polymorphic built-in functions (e.g., `concat`, `num_nulls`, `format`, `concat_ws`, etc.) no longer need to have the same type, matching PostgreSQL behavior. As a result, CockroachDB's type inference engine will no longer be able to infer argument types in some cases where it previously could, and there is a possibility that CockroachDB applications will encounter new errors. The new session variable `use_pre_25_2_variadic_builtins` restores the previous behavior (and limitations). [#144600]

[#139871]: https://github.com/cockroachdb/cockroach/pull/139871
[#139456]: https://github.com/cockroachdb/cockroach/pull/139456
[#144601]: https://github.com/cockroachdb/cockroach/pull/144601
[#144600]: https://github.com/cockroachdb/cockroach/pull/144600