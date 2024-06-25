- It is necessary to [`PAUSE`]({% link {{ page.version.version }}/pause-job.md %}) the changefeed before performing any [`ALTER CHANGEFEED`]({% link {{ page.version.version }}/alter-changefeed.md %}) statement. [#77171](https://github.com/cockroachdb/cockroach/issues/77171)
- CockroachDB does not keep track of the [`initial_scan`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) option applied to tables when it is set to `yes` or `only`. For example:

    ~~~ sql
    ALTER CHANGEFEED {job_ID} ADD table WITH initial_scan = 'yes';
    ~~~

    This will trigger an initial scan of the table and the changefeed will track `table`. The changefeed will **not** track `initial_scan` specified as an option, so it will not display in the output or after a `SHOW CHANGEFEED JOB` statement.