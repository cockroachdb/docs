<div class="release-cluster-settings-table" markdown="1">

| Deprecated | Description |
|---|---|
| `cockroach encode-uri` command | The `cockroach encode-uri` command has been merged into the `cockroach convert-url` command and `encode-uri` has been deprecated. As a result, the flags `--inline`, `--database`, `--user`, `--password`, `--cluster`, `--certs-dir`, `--ca-cert`, `--cert`, and `--key` have been added to `convert-url`. [#164561](https://github.com/cockroachdb/cockroach/pull/164561) |
| `enable_inspect_command` session variable | `INSPECT` is now a generally available (GA) feature. The `enable_inspect_command` session variable has been deprecated, and is now effectively always set to `true`. [#159659](https://github.com/cockroachdb/cockroach/pull/159659) |
| `enable_super_regions` session variable and `sql.defaults.super_regions.enabled` cluster setting | The `enable_super_regions` session variable and the `sql.defaults.super_regions.enabled` cluster setting are no longer required to use super regions. Super region DDL operations (`ADD`, `DROP`, and `ALTER SUPER REGION`) now work without any experimental flag. The session variable and cluster setting are deprecated, and existing scripts that set them will continue to work without error. [#165227](https://github.com/cockroachdb/cockroach/pull/165227) |

</div>
