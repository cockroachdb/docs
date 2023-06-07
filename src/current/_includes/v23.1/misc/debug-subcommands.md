While the `cockroach debug` command has a few subcommands, users are expected to use only the [`zip`](cockroach-debug-zip.html), [`encryption-active-key`](cockroach-debug-encryption-active-key.html), [`merge-logs`](cockroach-debug-merge-logs.html), [`list-files`](cockroach-debug-list-files.html), [`tsdump`](cockroach-debug-tsdump.html), and [`ballast`](cockroach-debug-ballast.html) subcommands.

We recommend using the [`encryption-decrypt`](cockroach-debug-encryption-decrypt.html) and [`job-trace`](cockroach-debug-job-trace.html) subcommands only when directed by the [Cockroach Labs support team](support-resources.html).

The other `debug` subcommands are useful only to Cockroach Labs. Output of `debug` commands may contain sensitive or secret information.
