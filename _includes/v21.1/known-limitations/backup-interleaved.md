Interleaved tables are now disabled by default in v21.1. Your backup will fail if your cluster includes interleaved data. To include interleaved tables, use the [`INCLUDE_DEPRECATED_INTERLEAVES` option](backup.html#include-deprecated-interleaves). Note that, interleaved tables will be [permanently removed from CockroachDB](interleave-in-parent.html#deprecation) in a future release, so you will be unable to `RESTORE` backups containing interleaved tables to any future versions.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/52009)
