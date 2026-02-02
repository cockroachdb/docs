- Access to the system database and crdb_internal schema is now restricted by default. Queries to most of these namespaces will fail unless explicitly overridden via the `allow_unsafe_internals` session variable. This change prevents accidental misuse of internal-only objects that were not designed for stable external use and could lead to difficult recovery scenarios. As part of this effort, several commonly used introspection capabilities have been migrated to stable information_schema tables:

  - `information_schema.crdb_datums_to_bytes` - previously only available as `crdb_internal.datums_to_bytes` [#156963](https://github.com/cockroachdb/cockroach/pull/156963)
  - `information_schema.crdb_index_usage_stats` - previously only available as `crdb_internal.index_usage_stats` [#156963](https://github.com/cockroachdb/cockroach/pull/156963)
  - `information_schema.crdb_rewrite_inline_hints` - replaces the function previously introduced as `crdb_internal.inject_hint` [#160946](https://github.com/cockroachdb/cockroach/pull/160946)

  [#158085](https://github.com/cockroachdb/cockroach/pull/158085)

- [FIPS-ready deployments]({% link v26.1/fips.md %}) in v26.1 have Preview status and are recommended for testing and evaluation only. CockroachDB v26.1 introduces a new FIPS architecture using Go's native FIPS 140-3 cryptographic module, replacing the OpenSSL-based approach from v25.4. This architectural change means:

  - **Production FIPS users should stay on v25.4** or wait to upgrade directly to v26.2, which will return FIPS support to GA status with full validation.
  - **Upgrading in-place from a non-FIPS binary to a FIPS binary is not supported.** To migrate an existing cluster to FIPS, you must restore to a new FIPS-ready deployment.
  - **Password length requirement:** FIPS 140-3 requires a minimum password length of 14 characters. Users with passwords shorter than 14 characters may be unable to log in after upgrading to a FIPS-ready binary.

  For detailed upgrade guidance and migration paths, refer to [FIPS-ready CockroachDB]({% link v26.1/fips.md %}).
