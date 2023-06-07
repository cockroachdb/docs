It is useful to be able to pause all running changefeeds during troubleshooting, testing, or when a decrease in CPU load is needed.

To pause all running changefeeds:

{% include copy-clipboard.html %}
~~~sql
PAUSE JOBS (SELECT job_id FROM [SHOW JOBS] WHERE job_type='CHANGEFEED' AND status IN ('running'));
~~~

This will change the status for each of the running changefeeds to `paused`, which can be verified with [`SHOW JOBS`](stream-data-out-of-cockroachdb-using-changefeeds.html#using-show-jobs).

To resume all running changefeeds:

{% include copy-clipboard.html %}
~~~sql
RESUME JOBS (SELECT job_id FROM [SHOW JOBS] WHERE job_type='CHANGEFEED' AND status IN ('paused'));
~~~

This will resume the changefeeds and update the status for each of the changefeeds to `running`.
