---
title: Change Data Capture (CDC)
summary: Partitioning is an enterprise feature that gives you row-level control of how and where your data is stored.
toc: false
---

<span class="version-tag">New in v2.1:</span> Change data capture (CDC) provides efficient, distributed, row-level change subscriptions.

{{site.data.alerts.callout_danger}}
**This feature is under active development** and only works for a targeted a use case. Please [file a Github issue](file-an-issue.html) if you have feedback on the interface.

In v2.1, CDC will be an enterprise feature and will have a core version.
{{site.data.alerts.end}}

<div id="toc"></div>

## What is change data capture?

While CockroachDB is an excellent system of record, it also needs to coexist with other systems. For example, you might want to keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.

The core feature of CDC is the [`CHANGEFEED`](create-changefeed.html). Changefeeds target a whitelist of databases, tables, partitions, rows, or a combination of these; called the "watched rows." Every change to a watched row is emitted as a record in a configurable format (i.e., `JSON` or Avro) to a configurable sink (i.e., [Kafka](https://kafka.apache.org/).

## Ordering guarantees

- If a row is modified more than once in the same transaction, only the last change will be emitted.

    Each emitted record in the changefeed contains the data of the changed row, along with the timestamp of the transaction that updated the row. Rows are sharded between Kafka partitions by the row’s [primary key](primary-key.html).

- Once a row has been emitted with some timestamp, no previously unseen versions of that row will be emitted with a lower timestamp.

    In the common case, each version of a row will be emitted once. However, some (infrequent) conditions will cause them to be repeated. This gives our changefeeds an **at-least-once delivery guarantee**, which can be used with the in-stream, resolved timestamp notifications on every Kafka partition. Together, they provide strong ordering and global consistency guarantees by buffering records in between timestamp closures.

- Cross-row and cross-table order guarantees are not given.

    Because CockroachDB supports transactions that can affect any part of the cluster, there is no way to horizontally divide the cluster's transaction log in a way where each piece is independent.

- To subscribe to a completely ordered feed of all transactions that happen in the database, you can reconstruct transactions with stronger order guarantees using resolved timestamp notifications.


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
~~~
> PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

### Cancel

To cancel a changefeed:

{% include copy-clipboard.html %}
~~~
> CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

## Usage example

### Create a changefeed connected to Kafka

In this example, you'll set up a changefeed that is connected to a Kafka sink.

1. In a terminal window, start `cockroach`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start --insecure
    ~~~

2. Download and extract the [Confluent platform](https://www.confluent.io/download/) (which includes Kafka).

3. Start Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./confluent-4.0.0/bin/confluent start
    ~~~

    Only `zookeeper` and `kafka` are needed. To troubleshoot Confluent, see [their docs](https://docs.confluent.io/current/installation/installing_cp.html#zip-and-tar-archives).

4. As the `root` user, open the [built-in SQL client](use-the-built-in-sql-client.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

5. Create a database called `test`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE test;
    ~~~

6. Set the database as the default:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = test;
    ~~~

7. Create a table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE demo_cdc (
         id INT PRIMARY KEY,
         name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO demo_cdc VALUES
       (1, 'Petee'),
       (2, 'Carl');
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > UPDATE demo_cdc SET name = 'Petee H' WHERE id = 1;
    ~~~

8. Start the changefeed:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE CHANGEFEED FOR TABLE demo_cdc INTO 'kafka://localhost:9092';
    ~~~
    ~~~
    +--------------------+
    |       job_id       |
    +--------------------+
    | 360645287206223873 |
    +--------------------+
    (1 row)
    ~~~

    This will start up the changefeed in the background and return the `job_id`. The changefeed writes to Kafka and survives node failures.

9. In a new terminal, start watching the Kafka topic:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./confluent-4.0.0/bin/kafka-console-consumer --bootstrap-server=localhost:9092 --from-beginning --topic=demo_cdc
    ~~~
    ~~~
    {"id": 1, "name": "Petee H"}
    {"id": 2, "name": "Carl"}
    ~~~

10. Back in the SQL client, insert more data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO demo_cdc VALUES (3, 'Ernie');
    ~~~

11. Back in the terminal where you're watching the Kafka topic, the following output has appeared:

    ~~~
    {"id": 3, "name": "Ernie"}
    ~~~

## Known limitations

<!-- TO DO: Dan to add -->

## See also

- [`CREATE CHANGEFEED`](create-changefeed.html)
- [`PAUSE JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Other SQL Statements](sql-statements.html)
