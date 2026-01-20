It is useful to be able to pause all running changefeeds during troubleshooting, testing, or when a decrease in CPU load is needed.

To pause all running changefeeds:

{% include_cached copy-clipboard.html %}
~~~sql
PAUSE JOBS (WITH x AS (SHOW CHANGEFEED JOBS) SELECT job_id FROM x WHERE status = ('running'));
~~~

This will change the status for each of the running changefeeds to `paused`, which can be verified with [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs).

To resume all paused changefeeds:

{% include_cached copy-clipboard.html %}
~~~sql
RESUME JOBS (WITH x AS (SHOW CHANGEFEED JOBS) SELECT job_id FROM x WHERE status = ('paused'));
~~~

This will resume the changefeeds and update the status for each of the changefeeds to `running`.
