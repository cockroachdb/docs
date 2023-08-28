While the `cockroach debug` command has a few subcommands, users are expected to use only the [`zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}), [`encryption-active-key`]({% link {{ page.version.version }}/cockroach-debug-encryption-active-key.md %}), [`merge-logs`]({% link {{ page.version.version }}/cockroach-debug-merge-logs.md %}), [`list-files`](cockroach-debug-list-files.html), [`tsdump`](cockroach-debug-tsdump.html), and [`ballast`](cockroach-debug-ballast.html) subcommands.

We recommend using the [`encryption-decrypt`]({% link {{ page.version.version }}/cockroach-debug-encryption-decrypt.md %}) and [`job-trace`]({% link {{ page.version.version }}/cockroach-debug-job-trace.md %}) subcommands only when directed by the [Cockroach Labs support team]({% link {{ page.version.version }}/support-resources.md %}).

The other `debug` subcommands are useful only to Cockroach Labs. Output of `debug` commands may contain sensitive or secret information.
