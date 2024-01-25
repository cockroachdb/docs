`MuxRangefeed` is a subsystem that improves the performance of rangefeeds with scale. Its functionality is enabled via the `changefeed.mux_rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}).

Use the following workflow to enable `MuxRangefeed`:

1. Enable the cluster setting:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING changefeed.mux_rangefeed.enabled = true;
    ~~~

1. After changing enabling the setting, pause the changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    PAUSE JOB {job ID};
    ~~~

    You can use [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) to retrieve the job ID.

1. Resume the changefeed for the cluser setting to take effect:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    RESUME JOB {job ID};
    ~~~