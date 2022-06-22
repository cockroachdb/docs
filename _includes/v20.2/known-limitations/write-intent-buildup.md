Due to known bugs, transactions do not always clean up their [write intents](architecture/transaction-layer.html#write-intents) (newly written values) on commit or rollback. Garbage collection is also rather slow to react to them. This can cause the amount of unresolved write intents to build up over time. While this isn't necessarily a problem in itself, some operations do not handle large amounts of intents well. In particular, backups and queries that touch large numbers of values may become very slow and appear to hang.

To verify that intents may be causing an issue, open the [**Custom Chart** debug page](ui-custom-chart-debug-page.html) in the DB Console, and create a chart for the `intentcount` metric. This will show the number of intents present over time. The following query can also be used to get intent counts by range:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM (SELECT start_pretty, end_pretty, range_id, crdb_internal.range_stats(start_key)->'intent_count' AS intent_count FROM crdb_internal.ranges_no_leases) WHERE intent_count != '0';
~~~

To force cleanup of intents, either of the following methods can be used:

- Do a high-priority scan of the table, which will resolve intents as it runs. Note that this may abort any conflicting transactions that are currently running. If the table has indexes, these can be cleaned by changing `<table>` into `<table>@<index>`. Numeric table and/or index identifiers (e.g., as output by the intent query above) can be used instead of names by placing them in brackets: `[<table-id>]` or `[<table-id>]@[<index-id>]`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN PRIORITY HIGH; SELECT COUNT(*) FROM <table>; COMMIT;
    ~~~

- Manually enqueue the range for garbage collection. In the DB Console, open the [**Advanced Debug** page](ui-debug-pages.html), scroll down to **Tracing and Profiling Endpoints**, and click **Run a range through an internal queue**. Then select **Queue: gc**, enter the range ID as output by the intent query above, check **SkipShouldQueue**, and click **Submit**. The operation will succeed on the leaseholder node and error on the others; this is expected.

The progress and effect of the cleanup can be monitored via the intent count statistics described above.
