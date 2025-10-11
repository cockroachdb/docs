`MuxRangefeed` is a subsystem that improves the performance of rangefeeds with scale. It significantly reduces the overhead of running {% if page.name == "create-and-configure-changefeeds.md" %} [rangefeeds](#enable-rangefeeds). {% else %} [rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds). {% endif %} Without `MuxRangefeed` enabled the number of RPC streams is proportional with the number of ranges in a table. For example, a large table could have tens of thousands of ranges. With `MuxRangefeed` enabled, this proportion improves so that the number of RPC streams is relative to the number of nodes in a cluster.

We recommend enabling its functionality with the `changefeed.mux_rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}). In v24.1 and later versions, `MuxRangefeed` is enabled by default.

Use the following workflow to enable `MuxRangefeed`:

1. Enable the cluster setting:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING changefeed.mux_rangefeed.enabled = true;
    ~~~

1. After enabling the setting, pause the changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    PAUSE JOB {job ID};
    ~~~

    You can use [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) to retrieve the job ID.

1. Resume the changefeed for the cluster setting to take effect:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    RESUME JOB {job ID};
    ~~~