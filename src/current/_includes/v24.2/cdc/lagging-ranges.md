Use the `changefeed.lagging_ranges` metric to track the number of ranges that are behind in a changefeed. This is calculated based on the [changefeed options]({% link {{ page.version.version }}/create-changefeed.md %}#options):

- `lagging_ranges_threshold` sets a duration from the present that determines the length of time a range is considered to be lagging behind, which will then track in the [`lagging_ranges`]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#lagging-ranges-metric) metric. Note that ranges undergoing an [initial scan]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) for longer than the threshold duration are considered to be lagging. Starting a changefeed with an initial scan on a large table will likely increment the metric for each range in the table. As ranges complete the initial scan, the number of ranges lagging behind will decrease.
    - **Default:** `3m`
- `lagging_ranges_polling_interval` sets the interval rate for when lagging ranges are checked and the `lagging_ranges` metric is updated. Polling adds latency to the `lagging_ranges` metric being updated. For example, if a range falls behind by 3 minutes, the metric may not update until an additional minute afterward.
    - **Default:** `1m`

{{site.data.alerts.callout_success}}
You can use the [`metrics_label`]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels) option to track the `lagging_ranges` metric per changefeed.
{{site.data.alerts.end}}