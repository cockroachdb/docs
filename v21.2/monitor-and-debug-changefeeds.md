---
title: Monitor and Debug Changefeeds
summary: Monitor a changefeed from the DB console and use logs for debugging.
toc: true
---

[Debugging](#debug-a-changefeed) and [monitoring](#monitor-a-changefeed) a changefeed is available through the [DB console](ui-overview.html), in the SQL shell, and using [logs](logging-overview.html).

## Monitor a changefeed

{{site.data.alerts.callout_info}}
Monitoring is only available for Enterprise changefeeds.
{{site.data.alerts.end}}

Changefeed progress is exposed as a high-water timestamp that advances as the changefeed progresses. This is a guarantee that all changes before or at the timestamp have been emitted. You can monitor a changefeed:

- On the [Changefeed Dashboard](ui-cdc-dashboard.html) of the DB Console.
- On the [Jobs page](ui-jobs-page.html) of the DB Console. Hover over the high-water timestamp to view the [system time](as-of-system-time.html).
- Using `SHOW CHANGEFEED JOB <job_id>`:

    {% include copy-clipboard.html %}
    ~~~ sql
    SHOW CHANGEFEED JOB 383870400694353921;
    ~~~
    ~~~
            job_id       |  job_type  |                              description                              | ... |      high_water_timestamp      | ... |
    +--------------------+------------+-----------------------------------------------------------------------+ ... +--------------------------------+ ... +
      383870400694353921 | CHANGEFEED | CREATE CHANGEFEED FOR TABLE office_dogs INTO 'kafka://localhost:9092' | ... | 1537279405671006870.0000000000 | ... |
    (1 row)
    ~~~

- Setting up an alert on the `changefeed.max_behind_nanos` metric to track when a changefeed's high-water mark timestamp is at risk of falling behind the cluster's [garbage collection window](configure-replication-zones.html#replication-zone-variables). For more information, see [Monitoring and Alerting](monitoring-and-alerting.html#changefeed-is-experiencing-high-latency).

{{site.data.alerts.callout_info}}
You can use the high-water timestamp to [start a new changefeed where another ended](create-changefeed.html#start-a-new-changefeed-where-another-ended).
{{site.data.alerts.end}}

## Debug a changefeed

### Using logs

For Enterprise changefeeds, [use log information](logging-overview.html) to debug connection issues (i.e., `kafka: client has run out of available brokers to talk to (Is your cluster reachable?)`). Debug by looking for lines in the logs with `[kafka-producer]` in them:

~~~
I190312 18:56:53.535646 585 vendor/github.com/Shopify/sarama/client.go:123  [kafka-producer] Initializing new client
I190312 18:56:53.535714 585 vendor/github.com/Shopify/sarama/client.go:724  [kafka-producer] client/metadata fetching metadata for all topics from broker localhost:9092
I190312 18:56:53.536730 569 vendor/github.com/Shopify/sarama/broker.go:148  [kafka-producer] Connected to broker at localhost:9092 (unregistered)
I190312 18:56:53.537661 585 vendor/github.com/Shopify/sarama/client.go:500  [kafka-producer] client/brokers registered new broker #0 at 172.16.94.87:9092
I190312 18:56:53.537686 585 vendor/github.com/Shopify/sarama/client.go:170  [kafka-producer] Successfully initialized new client
~~~

### Using `SHOW CHANGEFEED JOBS`

<span class="version-tag">New in v21.2:</span> For Enterprise changefeeds, use `SHOW CHANGEFEED JOBS` to check the status of your changefeed jobs:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CHANGEFEED JOBS;
~~~

~~~
job_id               |                                                                                   description                                                                  | user_name | status  |              running_status              |          created           |          started           | finished |          modified          |      high_water_timestamp      | error |         sink_uri       |      full_table_names      | format
---------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+---------+------------------------------------------+----------------------------+----------------------------+----------+----------------------------+--------------------------------+-------+------------------------+----------------------------+---------
685724608744325121   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | root      | running | running: resolved=1629336943.183631090,0 | 2021-08-19 01:35:43.19592  | 2021-08-19 01:35:43.225445 | NULL     | 2021-08-19 01:35:43.252318 | 1629336943183631090.0000000000 |       | kafka://localhost:9092 | {defaultdb.public.mytable} | avro
685723987509116929   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | root      | paused  | NULL                                     | 2021-08-19 01:32:33.609989 | 2021-08-19 01:32:33.64293  | NULL     | 2021-08-19 01:35:44.224961 | NULL                           |       | kafka://localhost:9092 | {defaultdb.public.mytable} | avro
(2 rows)
~~~

For more information, see [`SHOW JOBS`](show-jobs.html).

### Using the DB Console

 On the [**Custom Chart** debug page](ui-custom-chart-debug-page.html) of the DB Console:

1. To add a chart, click **Add Chart**.
2. Select `changefeed.error_retries` from the **Metric Name** dropdown menu.

    A graph of changefeed restarts due to retryable errors will display.
