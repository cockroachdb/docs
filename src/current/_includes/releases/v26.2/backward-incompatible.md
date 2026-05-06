- Bullet

  - `information_schema.crdb_datums_to_bytes` - previously only available as `crdb_internal.datums_to_bytes`
  - `information_schema.crdb_index_usage_stats` - previously only available as `crdb_internal.index_usage_stats`
  - `information_schema.crdb_rewrite_inline_hints` - replaces the function previously introduced as `crdb_internal.inject_hint`

- Bullet

   - **Production FIPS-ready clusters should stay on v25.4** or wait to upgrade directly to v26.2, which will return FIPS support to GA status, using a version of the Go module that is in review for FIPS 140-3 validation.
   - **Password length requirement:** FIPS 140-3 requires a minimum password length of 14 characters. Users with passwords shorter than 14 characters may be unable to log in after upgrading to a FIPS-ready binary.

   For detailed upgrade guidance and migration paths, refer to [FIPS-ready CockroachDB]({% link {{ page.version.version }}/fips.md %}).
