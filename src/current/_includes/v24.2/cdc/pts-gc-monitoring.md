You can monitor changefeed jobs for [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) usage. We recommend setting up {% if page.name == "monitor-and-debug-changefeeds.md" %} monitoring {% else %} [monitoring]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) {% endif %}for the following metrics:

- `jobs.changefeed.protected_age_sec`: Tracks the age of the oldest [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) record protected by changefeed jobs. We recommend monitoring if `protected_age_sec` is greater than [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds). As `protected_age_sec` increases, garbage accumulation increases. [Garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) will not progress on a table, database, or cluster if the protected timestamp record is present.
- `jobs.changefeed.currently_paused`: Tracks the number of changefeed jobs currently considered [paused]({% link {{ page.version.version }}/pause-job.md %}). Since paused changefeed jobs can accumulate garbage, it is important to [monitor the number of paused changefeeds]({% link {{ page.version.version }}/pause-job.md %}#monitoring-paused-jobs).
- `jobs.changefeed.expired_pts_records`: Tracks the number of expired [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) records owned by changefeed jobs. You can monitor this metric in conjunction with the [`gc_protect_expires_after` option]({% link {{ page.version.version }}/create-changefeed.md %}#gc-protect-expires-after).
- `jobs.changefeed.protected_record_count`: Tracks the number of [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) records held by changefeed jobs.