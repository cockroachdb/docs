To help guard against OOM events, CockroachDB sets a soft memory limit using mechanisms in Go. Depending on your hardware and workload, you may not need to manually tune `--cache` or `--max-sql-memory`.

For production deployments, to determine appropriate settings for `--cache` and `--max-sql-memory`, use the following formula:

{% include_cached copy-clipboard.html %}
~~~ none
2 * --max-sql-memory + --cache <= 80% of system RAM
~~~

Test the configuration with a reasonable workload before deploying it to production.

On startup, if CockroachDB detects that `--max-sql` or `--cache` are set too aggressively, a warning is logged.
