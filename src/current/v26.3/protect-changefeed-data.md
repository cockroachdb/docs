---
title: Protect Changefeed Data from Garbage Collection
summary: Understand how changefeeds interact with garbage collection.
toc: true
docs_area: stream_data
---

By default, [protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) will protect changefeed data from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) up to the time of the [_checkpoint_]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}).

Protected timestamps will protect changefeed data from garbage collection in the following scenarios:

- The downstream [changefeed sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) is unavailable. Protected timestamps will protect changes until you either [cancel]({% link {{ page.version.version }}/cancel-job.md %}) the changefeed or the sink becomes available once again.
- (**deprecated**) You [pause]({% link {{ page.version.version }}/pause-job.md %}) a changefeed with the [`protect_data_from_gc_on_pause`]({% link {{ page.version.version }}/create-changefeed.md %}#protect-data-from-gc-on-pause) option enabled. Or, a changefeed with `protect_data_from_gc_on_pause` pauses from a [retryable error]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#changefeed-retry-errors). Protected timestamps will protect changes until you [resume]({% link {{ page.version.version }}/resume-job.md %}) the changefeed.

However, if the changefeed lags too far behind, the protected changes could lead to an accumulation of garbage. This could result in increased disk usage and degraded performance for some workloads.

## Prevent garbage accumulation

To prevent an accumulation of protected changes that could impact performance, consider defining an expiration duration:

- [`changefeed.protect_timestamp.max_age`](#changefeed-protect_timestamp-max_age): a [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to define a protected timestamp expiration for all changefeeds on a cluster.
- [`gc_protect_expires_after`](#gc_protect_expires_after): a [changefeed option]({% link {{ page.version.version }}/create-changefeed.md %}#options) to define a protected timestamp expiration for a changefeed.

In general, a few hours to a few days are appropriate values for these settings. A lower protected timestamp expiration should not have adverse effects on your changefeed as long as the changefeed is running. However, if the changefeed pauses, you will need to [resume]({% link {{ page.version.version }}/resume-job.md %}) it before the defined expiration time. The value of either `changefeed.protect_timestamp.max_age` or `gc_protect_expires_after` should reflect how much time the changefeed may remain paused before it is canceled.

### `changefeed.protect_timestamp.max_age`

By default, the `changefeed.protect_timestamp.max_age` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) sets the maximum time that changefeeds making no forward progress will hold protected timestamp records. Once the `changefeed.protect_timestamp.max_age` duration is reached, the changefeed will fail with a permanent error. As a result, it is **critical to monitor for changefeed failures** because changefeeds will eventually fail with an unrecoverable error if they cannot progress before the duration is reached.

This cluster setting is enabled by default to 4 days. To disable expiration of protected timestamp records, you can set `changefeed.protect_timestamp.max_age` to `0`; however, Cockroach Labs recommends implementing an expiration.

`changefeed.protect_timestamp.max_age` is a cluster-wide setting affecting all changefeeds.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING changefeed.protect_timestamp.max_age = '120h';
~~~

{{site.data.alerts.callout_info}}
`changefeed.protect_timestamp.max_age` applies only to **newly created changefeeds in v23.2**.

If you are [upgrading to v23.2]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}), we recommend setting [`protect_data_from_gc_on_pause`]({% link {{ page.version.version }}/create-changefeed.md %}#protect-data-from-gc-on-pause) on any existing changefeeds to ensure that it does not enter a situation of infinite retries, which could prevent garbage collection. You can use the [`ALTER CHANGEFEED`]({% link {{ page.version.version }}/alter-changefeed.md %}) statement to add `protect_data_from_gc_on_pause` to existing changefeeds.
{{site.data.alerts.end}}

### `gc_protect_expires_after`

The [`gc_protect_expires_after`]({% link {{ page.version.version }}/create-changefeed.md %}#gc-protect-expires-after) option automatically expires the protected timestamp records that are older than the defined duration and cancels a changefeed job.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE db.table INTO 'external://sink' WITH on_error='pause', gc_protect_expires_after='24h';
~~~

If this changefeed runs into a retryable error, protected timestamps will protect changes for up to 24 hours. After this point, if the changefeed has not made any progress in the past 24 hours, the protected timestamp records will expire and the changefeed job will be canceled to prevent accumulation of garbage.

`gc_protect_expires_after` is an option applied to a single changefeed. To enable an expiration for protected timestamp records across changefeeds on the cluster, use the [`changefeed.protect_timestamp.max_age`](#changefeed-protect_timestamp-max_age) cluster setting.

{{site.data.alerts.callout_success}}
You can track changefeed metrics to monitor how changefeeds are using protected timestamps. Refer to [Protected timestamp and garbage collection monitoring]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#protected-timestamp-and-garbage-collection-monitoring).
{{site.data.alerts.end}}

## Release protected timestamp records

To release the protected timestamps manually and allow garbage collection to resume, you can:

- [Cancel]({% link {{ page.version.version }}/cancel-job.md %}) the changefeed job.
- [Resume]({% link {{ page.version.version }}/resume-job.md %}) a paused changefeed job.

We recommend [monitoring]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) storage and the number of running changefeeds. If a changefeed is not advancing and is [retrying]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#changefeed-retry-errors), it will (without limit) accumulate garbage while it retries to run up to the settings outlined in [Prevent garbage accumulation](#prevent-garbage-accumulation).

The only ways for changefeeds to **not** protect data are:

- You cancel the changefeed.
- The changefeed fails without [`on_error=pause`]({% link {{ page.version.version }}/create-changefeed.md %}#on-error) set.

## See also

- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %})
