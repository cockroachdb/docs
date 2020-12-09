---
title: Stream Data Out of CockroachDB Using Changefeeds
summary: Stream data out of CockroachDB with efficient, distributed, row-level change subscriptions (changefeeds).
toc: true
redirect_from:
- change-data-capture.html
---

Change data capture (CDC) provides efficient, distributed, row-level change feeds into a configurable sink for downstream processing such as reporting, caching, or full-text indexing.

## What is change data capture?

While CockroachDB is an excellent system of record, it also needs to coexist with other systems. For example, you might want to keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.

The main feature of CDC is the changefeed, which targets an allowlist of tables, called the "watched rows". There are two implementations of changefeeds:

- [Core changefeeds](#create-a-core-changefeed), which stream row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.
- [Enterprise changefeeds](#configure-a-changefeed-enterprise), where every change to a watched row is emitted as a record in a configurable format (`JSON` or Avro) to a configurable sink ([Kafka](https://kafka.apache.org/)).

## Enable rangefeeds

Changefeeds connect to a long-lived request (i.e., a rangefeed), which pushes changes as they happen. This reduces the latency of row changes, as well as reduces transaction restarts on tables being watched by a changefeed for some workloads.

**Rangefeeds must be enabled for a changefeed to work.** To [enable the cluster setting](set-cluster-setting.html):

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.rangefeed.enabled = true;
~~~

Any created changefeed will error until this setting is enabled. Note that enabling rangefeeds currently has a small performance cost (about a 5-10% increase in latencies), whether or not the rangefeed is being used in a changefeed.

The `kv.closed_timestamp.target_duration` [cluster setting](cluster-settings.html) can be used with changefeeds. Resolved timestamps will always be behind by at least this setting's duration; however, decreasing the duration leads to more transaction restarts in your cluster, which can affect performance.

## Ordering guarantees

- In most cases, each version of a row will be emitted once. However, some infrequent conditions (e.g., node failures, network partitions) will cause them to be repeated. This gives our changefeeds an **at-least-once delivery guarantee**.

- Once a row has been emitted with some timestamp, no previously unseen versions of that row will be emitted with a lower timestamp. That is, you will never see a _new_ change for that row at an earlier timestamp.

    For example, if you ran the following:

    ~~~ sql
    > CREATE TABLE foo (id INT PRIMARY KEY DEFAULT unique_rowid(), name STRING);
    > CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://localhost:9092' WITH UPDATED;
    > INSERT INTO foo VALUES (1, 'Carl');
    > UPDATE foo SET name = 'Petee' WHERE id = 1;
    ~~~

    You'd expect the changefeed to emit:

    ~~~ shell
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    [1]	{"__crdb__": {"updated": <timestamp 2>}, "id": 1, "name": "Petee"}
    ~~~

    It is also possible that the changefeed emits an out of order duplicate of an earlier value that you already saw:

    ~~~ shell
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    [1]	{"__crdb__": {"updated": <timestamp 2>}, "id": 1, "name": "Petee"}
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    ~~~

    However, you will **never** see an output like the following (i.e., an out of order row that you've never seen before):

    ~~~ shell
    [1]	{"__crdb__": {"updated": <timestamp 2>}, "id": 1, "name": "Petee"}
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    ~~~

- If a row is modified more than once in the same transaction, only the last change will be emitted.

- Rows are sharded between Kafka partitions by the row’s [primary key](primary-key.html).

- <a name="resolved-def"></a>The `UPDATED` option adds an "updated" timestamp to each emitted row. You can also use the `RESOLVED` option to emit periodic "resolved" timestamp messages to each Kafka partition. A "resolved" timestamp is a guarantee that no (previously unseen) rows with a lower update timestamp will be emitted on that partition.

    For example:

    ~~~ shell
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

- With duplicates removed, an individual row is emitted in the same order as the transactions that updated it. However, this is not true for updates to two different rows, even two rows in the same table.

    To compare two different rows for [happens-before](https://en.wikipedia.org/wiki/Happened-before), compare the "updated" timestamp. This works across anything in the same cluster (e.g., tables, nodes, etc.).

    Resolved timestamp notifications on every Kafka partition can be used to provide strong ordering and global consistency guarantees by buffering records in between timestamp closures. Use the "resolved" timestamp to see every row that changed at a certain time.

    The complexity with timestamps is necessary because CockroachDB supports transactions that can affect any part of the cluster, and it is not possible to horizontally divide the transaction log into independent changefeeds. For more information about this, [read our blog post on CDC](https://www.cockroachlabs.com/blog/change-data-capture/).

## Avro schema changes

To ensure that the Avro schemas that CockroachDB publishes will work with the schema compatibility rules used by the Confluent schema registry, CockroachDB emits all fields in Avro as nullable unions. This ensures that Avro and Confluent consider the schemas to be both backward- and forward-compatible, since the Confluent Schema Registry has a different set of rules than Avro for schemas to be backward- and forward-compatible.

Note that the original CockroachDB column definition is also included in the schema as a doc field, so it's still possible to distinguish between a `NOT NULL` CockroachDB column and a `NULL` CockroachDB column.

## Schema changes with column backfill

When schema changes with column backfill (e.g., adding a column with a default, adding a computed column, adding a `NOT NULL` column, dropping a column) are made to watched rows, the changefeed will emit some duplicates during the backfill. When it finishes, CockroachDB outputs all watched rows using the new schema. When using Avro, rows that have been backfilled by a schema change are always re-emitted.

For an example of a schema change with column backfill, start with the changefeed created in the [example below](#create-a-changefeed-connected-to-kafka):

~~~ shell
[1]	{"id": 1, "name": "Petee H"}
[2]	{"id": 2, "name": "Carl"}
[3]	{"id": 3, "name": "Ernie"}
~~~

Add a column to the watched table:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE office_dogs ADD COLUMN likes_treats BOOL DEFAULT TRUE;
~~~

The changefeed emits duplicate records 1, 2, and 3 before outputting the records using the new schema:

~~~ shell
[1]	{"id": 1, "name": "Petee H"}
[2]	{"id": 2, "name": "Carl"}
[3]	{"id": 3, "name": "Ernie"}
[1]	{"id": 1, "name": "Petee H"}  # Duplicate
[2]	{"id": 2, "name": "Carl"}     # Duplicate
[3]	{"id": 3, "name": "Ernie"}    # Duplicate
[1]	{"id": 1, "likes_treats": true, "name": "Petee H"}
[2]	{"id": 2, "likes_treats": true, "name": "Carl"}
[3]	{"id": 3, "likes_treats": true, "name": "Ernie"}
~~~

## Create a changefeed (Core)

A core changefeed streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.

To create a core changefeed:

{% include copy-clipboard.html %}
~~~ sql
> EXPERIMENTAL CHANGEFEED FOR name;
~~~

For more information, see [`CHANGEFEED FOR`](changefeed-for.html).

## Configure a changefeed (Enterprise)

An enterprise changefeed streams row-level changes in a configurable format to a configurable sink (i.e., Kafka or a cloud storage sink). You can [create](#create), [pause](#pause), [resume](#resume), [cancel](#cancel), [monitor](#monitor-a-changefeed), and [debug](#debug-a-changefeed) an enterprise changefeed.

### Create

To create an enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE table_name, table_name2 INTO 'scheme://host:port';
~~~

For more information, see [`CREATE CHANGEFEED`](create-changefeed.html).

### Pause

To pause an enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

### Resume

To resume a paused enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOB job_id;
~~~

For more information, see [`RESUME JOB`](resume-job.html).

### Cancel

To cancel an enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

## Monitor a changefeed

{{site.data.alerts.callout_info}}
Monitoring is only available for enterprise changefeeds.
{{site.data.alerts.end}}

Changefeed progress is exposed as a high-water timestamp that advances as the changefeed progresses. This is a guarantee that all changes before or at the timestamp have been emitted. You can monitor a changefeed:

- On the [Changefeed Dashboard](ui-cdc-dashboard.html) of the DB Console.
- On the [Jobs page](ui-jobs-page.html) of the DB Console. Hover over the high-water timestamp to view the [system time](as-of-system-time.html).
- Using `crdb_internal.jobs`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM crdb_internal.jobs WHERE job_id = <job_id>;
    ~~~
    ~~~
            job_id       |  job_type  |                              description                               | ... |      high_water_timestamp      | error | coordinator_id
    +--------------------+------------+------------------------------------------------------------------------+ ... +--------------------------------+-------+----------------+
      383870400694353921 | CHANGEFEED | CREATE CHANGEFEED FOR TABLE office_dogs INTO 'kafka://localhost:9092' | ... | 1537279405671006870.0000000000 |       |              1
    (1 row)
    ~~~

- Setting up an alert on the `changefeed.max_behind_nanos` metric to track when a changefeed's high-water mark timestamp is at risk of falling behind the cluster's [garbage collection window](configure-replication-zones.html#replication-zone-variables). For more information, see [Monitoring and Alerting](monitoring-and-alerting.html#changefeed-is-experiencing-high-latency).

{{site.data.alerts.callout_info}}
You can use the high-water timestamp to [start a new changefeed where another ended](create-changefeed.html#start-a-new-changefeed-where-another-ended).
{{site.data.alerts.end}}

## Debug a changefeed

### Using logs

For enterprise changefeeds, [use log information](debug-and-error-logs.html) to debug connection issues (i.e., `kafka: client has run out of available brokers to talk to (Is your cluster reachable?)`). Debug by looking for lines in the logs with `[kafka-producer]` in them:

~~~
I190312 18:56:53.535646 585 vendor/github.com/Shopify/sarama/client.go:123  [kafka-producer] Initializing new client
I190312 18:56:53.535714 585 vendor/github.com/Shopify/sarama/client.go:724  [kafka-producer] client/metadata fetching metadata for all topics from broker localhost:9092
I190312 18:56:53.536730 569 vendor/github.com/Shopify/sarama/broker.go:148  [kafka-producer] Connected to broker at localhost:9092 (unregistered)
I190312 18:56:53.537661 585 vendor/github.com/Shopify/sarama/client.go:500  [kafka-producer] client/brokers registered new broker #0 at 172.16.94.87:9092
I190312 18:56:53.537686 585 vendor/github.com/Shopify/sarama/client.go:170  [kafka-producer] Successfully initialized new client
~~~

### Using `SHOW JOBS`

For enterprise changefeeds, you can check the status by using:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW JOBS] WHERE job_type='CHANGEFEED';
~~~

Or:

{% include copy-clipboard.html %}
~~~ sql
SELECT * from crdb_internal.jobs WHERE job_type='CHANGEFEED';
~~~

For more information, see [`SHOW JOBS`](show-jobs.html).

### Using the DB Console

 On the [**Custom Chart** debug page](ui-custom-chart-debug-page.html) of the DB Console:

1. To add a chart, click **Add Chart**.
2. Select `changefeed.error_retries` from the **Metric Name** dropdown menu.

    A graph of changefeed restarts due to retryable errors will display.

## Usage examples

### Create a core changefeed

{% include {{ page.version.version }}/cdc/create-core-changefeed.md %}

### Create a core changefeed using Avro

{% include {{ page.version.version }}/cdc/create-core-changefeed-avro.md %}

### Create a changefeed connected to Kafka

{{site.data.alerts.callout_info}}
[`CREATE CHANGEFEED`](create-changefeed.html) is an [enterprise-only](enterprise-licensing.html) feature. For the core version, see [the `CHANGEFEED FOR` example above](#create-a-core-changefeed).
{{site.data.alerts.end}}

In this example, you'll set up a changefeed for a single-node cluster that is connected to a Kafka sink. The changefeed will watch two tables.

1. If you do not already have one, [request a trial enterprise license](enterprise-licensing.html).

2. Use the [`cockroach start-single-node`](cockroach-start-single-node.html) command to start a single-node cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --insecure --listen-addr=localhost --background
    ~~~

3. Download and extract the [Confluent Open Source platform](https://www.confluent.io/download/) (which includes Kafka).

4. Move into the extracted `confluent-<version>` directory and start Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/confluent start
    ~~~

    Only `zookeeper` and `kafka` are needed. To troubleshoot Confluent, see [their docs](https://docs.confluent.io/current/installation/installing_cp.html#zip-and-tar-archives).

5. Create two Kafka topics:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/kafka-topics \
    --create \
    --zookeeper localhost:2181 \
    --replication-factor 1 \
    --partitions 1 \
    --topic office_dogs
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/kafka-topics \
    --create \
    --zookeeper localhost:2181 \
    --replication-factor 1 \
    --partitions 1 \
    --topic employees
    ~~~

    {{site.data.alerts.callout_info}}
    You are expected to create any Kafka topics with the necessary number of replications and partitions. [Topics can be created manually](https://kafka.apache.org/documentation/#basic_ops_add_topic) or [Kafka brokers can be configured to automatically create topics](https://kafka.apache.org/documentation/#topicconfigs) with a default partition count and replication factor.
    {{site.data.alerts.end}}

6. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

7. Set your organization name and [enterprise license](enterprise-licensing.html) key that you received via email:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<organization name>';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

8. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

9. Create a database called `cdc_demo`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE cdc_demo;
    ~~~

10. Set the database as the default:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = cdc_demo;
    ~~~

11. Create a table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE office_dogs (
         id INT PRIMARY KEY,
         name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES
       (1, 'Petee'),
       (2, 'Carl');
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > UPDATE office_dogs SET name = 'Petee H' WHERE id = 1;
    ~~~

12. Create another table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE employees (
         dog_id INT REFERENCES office_dogs (id),
         employee_name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO employees VALUES
       (1, 'Lauren'),
       (2, 'Spencer');
    ~~~

13. Start the changefeed:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE CHANGEFEED FOR TABLE office_dogs, employees INTO 'kafka://localhost:9092';
    ~~~
    ~~~

            job_id       
    +--------------------+
      360645287206223873
    (1 row)
    ~~~

    This will start up the changefeed in the background and return the `job_id`. The changefeed writes to Kafka.

14. In a new terminal, move into the extracted `confluent-<version>` directory and start watching the Kafka topics:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/kafka-console-consumer \
    --bootstrap-server=localhost:9092 \
    --from-beginning \
    --whitelist 'office_dogs|employees'
    ~~~

    ~~~ shell
    {"after": {"id": 1, "name": "Petee H"}}
    {"after": {"id": 2, "name": "Carl"}}
    {"after": {"id": 1, "name": "Lauren", "rowid": 528514320239329281}}
    {"after": {"id": 2, "name": "Spencer", "rowid": 528514320239362049}}
    ~~~

    The initial scan displays the state of the tables as of when the changefeed started (therefore, the initial value of `"Petee"` is omitted).

    {% include {{ page.version.version }}/cdc/print-key.md %}

15. Back in the SQL client, insert more data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES (3, 'Ernie');
    ~~~

16. Back in the terminal where you're watching the Kafka topics, the following output has appeared:

    ~~~ shell
    {"after": {"id": 3, "name": "Ernie"}}
    ~~~

17. When you are done, exit the SQL shell (`\q`).

18. To stop `cockroach`, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure
    ~~~

19. To stop Kafka, move into the extracted `confluent-<version>` directory and stop Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/confluent stop
    ~~~

### Create a changefeed connected to Kafka using Avro

{{site.data.alerts.callout_info}}
[`CREATE CHANGEFEED`](create-changefeed.html) is an [enterprise-only](enterprise-licensing.html) feature. For the core version, see [the `CHANGEFEED FOR` example above](#create-a-core-changefeed-using-avro).
{{site.data.alerts.end}}

In this example, you'll set up a changefeed for a single-node cluster that is connected to a Kafka sink and emits [Avro](https://avro.apache.org/docs/1.8.2/spec.html) records. The changefeed will watch two tables.

1. If you do not already have one, [request a trial enterprise license](enterprise-licensing.html).

2. Use the [`cockroach start-single-node`](cockroach-start-single-node.html) command to start a single-node cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --insecure --listen-addr=localhost --background
    ~~~

3. Download and extract the [Confluent Open Source platform](https://www.confluent.io/download/) (which includes Kafka).

4. Move into the extracted `confluent-<version>` directory and start Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/confluent start
    ~~~

    Only `zookeeper`, `kafka`, and `schema-registry` are needed. To troubleshoot Confluent, see [their docs](https://docs.confluent.io/current/installation/installing_cp.html#zip-and-tar-archives).

5. Create two Kafka topics:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/kafka-topics \
    --create \
    --zookeeper localhost:2181 \
    --replication-factor 1 \
    --partitions 1 \
    --topic office_dogs
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/kafka-topics \
    --create \
    --zookeeper localhost:2181 \
    --replication-factor 1 \
    --partitions 1 \
    --topic employees
    ~~~

    {{site.data.alerts.callout_info}}
    You are expected to create any Kafka topics with the necessary number of replications and partitions. [Topics can be created manually](https://kafka.apache.org/documentation/#basic_ops_add_topic) or [Kafka brokers can be configured to automatically create topics](https://kafka.apache.org/documentation/#topicconfigs) with a default partition count and replication factor.
    {{site.data.alerts.end}}

6. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

7. Set your organization name and [enterprise license](enterprise-licensing.html) key that you received via email:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<organization name>';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

8. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

9. Create a database called `cdc_demo`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE cdc_demo;
    ~~~

10. Set the database as the default:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = cdc_demo;
    ~~~

11. Create a table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE office_dogs (
         id INT PRIMARY KEY,
         name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES
       (1, 'Petee'),
       (2, 'Carl');
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > UPDATE office_dogs SET name = 'Petee H' WHERE id = 1;
    ~~~

12. Create another table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE employees (
         dog_id INT REFERENCES office_dogs_avro (id),
         employee_name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO employees VALUES
       (1, 'Lauren'),
       (2, 'Spencer');
    ~~~

13. Start the changefeed:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE CHANGEFEED FOR TABLE office_dogs, employees INTO 'kafka://localhost:9092' WITH format = experimental_avro, confluent_schema_registry = 'http://localhost:8081';
    ~~~

    ~~~
            job_id       
    +--------------------+
      360645287206223873
    (1 row)
    ~~~

    This will start up the changefeed in the background and return the `job_id`. The changefeed writes to Kafka.

14. In a new terminal, move into the extracted `confluent-<version>` directory and start watching the Kafka topics:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/kafka-avro-console-consumer \
    --bootstrap-server=localhost:9092 \
    --from-beginning \
    --whitelist 'office_dogs|employees'
    ~~~

    ~~~ shell
    {"after":{"office_dogs":{"id":{"long":1},"name":{"string":"Petee H"}}}}
    {"after":{"office_dogs":{"id":{"long":2},"name":{"string":"Carl"}}}}
    {"after":{"employees":{"dog_id":{"long":1},"employee_name":{"string":"Lauren"},"rowid":{"long":528537452042682369}}}}
    {"after":{"employees":{"dog_id":{"long":2},"employee_name":{"string":"Spencer"},"rowid":{"long":528537452042747905}}}}
    ~~~

    The initial scan displays the state of the table as of when the changefeed started (therefore, the initial value of `"Petee"` is omitted).

    {% include {{ page.version.version }}/cdc/print-key.md %}

15. Back in the SQL client, insert more data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES (3, 'Ernie');
    ~~~

16. Back in the terminal where you're watching the Kafka topics, the following output has appeared:

    ~~~ shell
    {"after":{"office_dogs":{"id":{"long":3},"name":{"string":"Ernie"}}}}
    ~~~

17. When you are done, exit the SQL shell (`\q`).

18. To stop `cockroach`, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure
    ~~~

19. To stop Kafka, move into the extracted `confluent-<version>` directory and stop Confluent:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./bin/confluent stop
    ~~~

### Create a changefeed connected to a cloud storage sink

{{site.data.alerts.callout_info}}
[`CREATE CHANGEFEED`](create-changefeed.html) is an [enterprise-only](enterprise-licensing.html) feature. For the core version, see [the `CHANGEFEED FOR` example above](#create-a-core-changefeed).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/experimental-warning.md %}

In this example, you'll set up a changefeed for a single-node cluster that is connected to an AWS S3 sink. The changefeed watches two tables. Note that you can set up changefeeds for any of [these cloud storage providers](create-changefeed.html#cloud-storage-sink).

1. If you do not already have one, [request a trial enterprise license](enterprise-licensing.html).

2. Use the [`cockroach start-single-node`](cockroach-start-single-node.html) command to start a single-node cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --insecure --listen-addr=localhost --background
    ~~~

3. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

4. Set your organization name and [enterprise license](enterprise-licensing.html) key that you received via email:

    {% include copy-clipboard.html %}
    ~~~ shell
    > SET CLUSTER SETTING cluster.organization = '<organization name>';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    > SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

5. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

6. Create a database called `cdc_demo`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE cdc_demo;
    ~~~

7. Set the database as the default:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = cdc_demo;
    ~~~

8. Create a table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE office_dogs (
         id INT PRIMARY KEY,
         name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES
       (1, 'Petee'),
       (2, 'Carl');
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > UPDATE office_dogs SET name = 'Petee H' WHERE id = 1;
    ~~~

9. Create another table and add data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE employees (
         dog_id INT REFERENCES office_dogs_avro (id),
         employee_name STRING);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO employees VALUES
       (1, 'Lauren'),
       (2, 'Spencer');
    ~~~

10. Start the changefeed:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE CHANGEFEED FOR TABLE office_dogs, employees INTO 'experimental-s3://example-bucket-name/test?AWS_ACCESS_KEY_ID=enter_key-here&AWS_SECRET_ACCESS_KEY=enter_key_here' with updated, resolved='10s';
    ~~~

    ~~~
            job_id       
    +--------------------+
      360645287206223873
    (1 row)
    ~~~

    This will start up the changefeed in the background and return the `job_id`. The changefeed writes to AWS.

11. Monitor your changefeed on the [DB Console](http://localhost:8080/#/metrics/changefeeds/cluster). For more information, see [Changefeeds Dashboard](ui-cdc-dashboard.html).

12. When you are done, exit the SQL shell (`\q`).

13. To stop `cockroach`, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure
    ~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/cdc.md %}

## See also

- [`CREATE CHANGEFEED`](create-changefeed.html)
- [`CHANGEFEED FOR`](changefeed-for.html)
- [`PAUSE JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Other SQL Statements](sql-statements.html)
- [Changefeed Dashboard](ui-cdc-dashboard.html)
