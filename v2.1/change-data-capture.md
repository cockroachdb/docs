---
title: Change Data Capture (CDC)
summary: Change data capture (CDC) provides efficient, distributed, row-level change subscriptions.
toc: true
---

<span class="version-tag">New in v2.1:</span> Change data capture (CDC) provides efficient, distributed, row-level change feeds into Apache Kafka for downstream processing such as reporting, caching, or full-text indexing.

{{site.data.alerts.callout_danger}}
**This feature is under active development** and only works for a targeted use case. Please [file a Github issue](file-an-issue.html) if you have feedback on the interface.

In v2.1, CDC will be an enterprise feature and will have a core version.
{{site.data.alerts.end}}


## What is change data capture?

While CockroachDB is an excellent system of record, it also needs to coexist with other systems. For example, you might want to keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.

The core feature of CDC is the [changefeed](create-changefeed.html). Changefeeds target a whitelist of databases and tables, called the "watched rows." Every change to a watched row is emitted as a record in a configurable format (`JSON`) to a configurable sink ([Kafka](https://kafka.apache.org/)).

## Ordering guarantees

- In the common case, each version of a row will be emitted once. However, some (infrequent) conditions will cause them to be repeated. This gives our changefeeds an **at-least-once delivery guarantee**.

- Once a row has been emitted with some timestamp, no previously unseen versions of that row will be emitted with a lower timestamp.

- If a row is modified more than once in the same transaction, only the last change will be emitted.

- Rows are sharded between Kafka partitions by the row’s [primary key](primary-key.html).

- The `WITH timestamps` option adds an **update timestamp** to each emitted row. It also causes periodic **resolved timestamp** messages to be emitted to each Kafka partition. A resolved timestamp is a guarantee that no (previously unseen) rows with a lower update timestamp will be emitted on that partition.

    For example:

    ~~~ json
    {"__crdb__": {"updated": "1532377312562986715.0000000000"}, "id": 1, "name": "Petee H"}
    {"__crdb__": {"updated": "1532377306108205142.0000000000"}, "id": 2, "name": "Carl"}
    {"__crdb__": {"updated": "1532377358501715562.0000000000"}, "id": 3, "name": "Ernie"}
    {"__crdb__":{"resolved":"1532379887442299001.0000000000"}}
    {"__crdb__":{"resolved":"1532379888444290910.0000000000"}}
    {"__crdb__":{"resolved":"1532379889448662988.0000000000"}}
    ...
    {"__crdb__":{"resolved":"1532379922512859361.0000000000"}}
    {"__crdb__": {"updated": "1532379923319195777.0000000000"}, "id": 4, "name": "Lucky"}
    ~~~

- Cross-row and cross-table order guarantees are not directly given. However, the resolved timestamp notifications on every Kafka partition can be used to provide strong ordering and global consistency guarantees by buffering records in between timestamp closures.

    Because CockroachDB supports transactions that can affect any part of the cluster, there is no way to horizontally divide the cluster's transaction log in a way where each piece is independent, so it can't be scaled in the general case.

## Configure a changefeed

### Create

To create a changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name INTO 'kafka://host:port';
~~~

For more information, see [`CREATE CHANGEFEED`](create-changefeed.html).

### Pause

To pause a changefeed:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

### Resume

To resume a paused changefeed:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> RESUME JOB job_id;
~~~

For more information, see [`RESUME JOB`](resume-job.html).

### Cancel

To cancel a changefeed:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

## Usage example

### Create a changefeed connected to Kafka

In this example, you'll set up a changefeed for a single-node cluster that is connected to a Kafka sink.

1. In a terminal window, start `cockroach`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start --insecure
    ~~~

2. Download and extract the [Confluent Open Source platform](https://www.confluent.io/download/) (which includes Kafka).

3. Start Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./confluent-4.0.0/bin/confluent start
    ~~~

    Only `zookeeper` and `kafka` are needed. To troubleshoot Confluent, see [their docs](https://docs.confluent.io/current/installation/installing_cp.html#zip-and-tar-archives).

4. Create a Kafka topic:

    {% include copy-clipboard.html %}
    ~~~
    $ ./confluent-4.0.0/bin/kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic office_dogs
    ~~~

    {{site.data.alerts.callout_info}}
    You are expected to create any Kafka topics with the necessary number of replications and partitions. [Topics can be created manually](https://kafka.apache.org/documentation/#basic_ops_add_topic) or [Kafka brokers can be configured to automatically create topics](https://kafka.apache.org/documentation/#topicconfigs) with a default partition count and replication factor.
    {{site.data.alerts.end}}

5. As the `root` user, open the [built-in SQL client](use-the-built-in-sql-client.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

6. Create a database called `test`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE cdc_demo;
    ~~~

7. Set the database as the default:

    {% include copy-clipboard.html %}
    ~~~ sql?nofmt
    > SET DATABASE = cdc_demo;
    ~~~

8. Create a table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE office_dogs (id INT PRIMARY KEY, name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES (1, 'Petee'), (2, 'Carl');
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > UPDATE office_dogs SET name = 'Petee H' WHERE id = 1;
    ~~~

9. Start the changefeed:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE CHANGEFEED FOR TABLE office_dogs INTO 'kafka://localhost:9092';
    ~~~
    ~~~
    +--------------------+
    |       job_id       |
    +--------------------+
    | 360645287206223873 |
    +--------------------+
    (1 row)
    ~~~

    This will start up the changefeed in the background and return the `job_id`. The changefeed writes to Kafka.

10. In a new terminal, start watching the Kafka topic:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./confluent-4.0.0/bin/kafka-console-consumer --bootstrap-server=localhost:9092 --from-beginning --topic=office_dogs
    ~~~
    ~~~
    {"id": 1, "name": "Petee H"}
    {"id": 2, "name": "Carl"}
    ~~~

    Note that the initial scan displays the state of the table as of when the changefeed started (therefore, the initial value of `"Petee"` is missing).

11. Back in the SQL client, insert more data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES (3, 'Ernie');
    ~~~

12. Back in the terminal where you're watching the Kafka topic, the following output has appeared:

    ~~~
    {"id": 3, "name": "Ernie"}
    ~~~

## Known limitations

The following are limitations in the July 30, 2018 alpha release, and will be addressed before the v2.1 release.

- Changefeeds created with the alpha may not be compatible with future alphas and the final v2.1 release.

    {{site.data.alerts.callout_danger}}
    Do not use this feature on production data.
    {{site.data.alerts.end}}

- The CockroachDB core changefeed is not ready for external testing.
- Changefeed progress is not exposed to the user.
- The SQL interface is not final and may change.
- Changefeeds only work on tables with a single [column family](column-families.html) (which is the default for new tables).
- Changefeeds do not work on [interleaved tables](interleave-in-parent.html).
- Many DDL queries (including [`TRUNCATE`](truncate.html), [`RENAME TABLE`](rename-table.html), and [`DROP TABLE`](drop-table.html)) will cause undefined behavior on a changefeed watching the affected tables.
- Changefeeds cannot be [backed up](backup.html) or [restored](restore.html).
- Changefeed behavior under most types of failures/degraded conditions is not yet tuned.
- Changefeed internal buffering does not respect memory use limitations.
- Changefeeds do not scale horizontally or to high traffic workloads.
- Changefeeds use a pull model, but will use a push model in v2.1, lowering latencies considerably.
- Changefeeds are slow on data recently loaded via [`RESTORE`](restore.html) or [`IMPORT`](import.html).
- Additional format options will be added, including Avro.
- Additional envelope options will be added, including one that displays the old and new values for the changed row.
- Additional target options will be added, including partitions and ranges of primary key rows.

## See also

- [`CREATE CHANGEFEED`](create-changefeed.html)
- [`PAUSE JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Other SQL Statements](sql-statements.html)
