It is useful to be able to pause all running changefeeds during troubleshooting, testing, or when a decrease in CPU load is needed.

To pause all running changefeeds:

{% include copy-clipboard.html %}
~~~sql
PAUSE JOBS (WITH x AS (SHOW CHANGEFEED JOBS) SELECT * FROM x WHERE status = ('running'));
~~~

This will change the status for each of the running changefeeds to `paused`, which can be verified with [`SHOW CHANGEFEED JOBS`](show-jobs.html#show-changefeed-jobs).

To resume all running changefeeds:

{% include copy-clipboard.html %}
~~~sql
RESUME JOBS (WITH x AS (SHOW CHANGEFEED JOBS) SELECT * FROM x WHERE status = ('paused'));
~~~

This will resume the changefeeds and update the status for each of the changefeeds to `running`.
