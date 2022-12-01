Change data capture (CDC) provides efficient, distributed, row-level changefeeds into a configurable sink for downstream processing such as reporting, caching, or full-text indexing.

A changefeed targets an allowlist of tables, called "watched rows". Each change to a watched row is emitted as a record to a configurable sink, like [Kafka](../{{site.versions["cloud"]}}/create-changefeed.html#create-a-changefeed-connected-to-kafka) or a [cloud storage sink](../{{site.versions["cloud"]}}/create-changefeed.html#create-a-changefeed-connected-to-a-cloud-storage-sink). You can manage your changefeeds with [create](../{{site.versions["cloud"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html#create), [pause](../{{site.versions["cloud"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html#pause), [resume](../{{site.versions["cloud"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html#resume), or [cancel](../{{site.versions["cloud"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html#cancel) in this version of {{ site.data.products.db }}.

#### Create a changefeed connected to Kafka

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'kafka://host:port'
  WITH updated, resolved;
~~~
~~~
+--------------------+
|       job_id       |
+--------------------+
| 360645287206223873 |
+--------------------+
(1 row)
~~~

{{site.data.alerts.callout_info}}
Currently, [changefeeds](../{{site.versions["cloud"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html) connected to [Kafka versions < v1.0](https://docs.confluent.io/platform/current/installation/versions-interoperability.html) are not supported in CockroachDB v21.1.
{{site.data.alerts.end}}

For more information on how to create a changefeed connected to Kafka, see [Stream Data Out of CockroachDB Using Changefeeds](../{{site.versions["cloud"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-kafka) and [`CREATE CHANGEFEED`](../{{site.versions["cloud"]}}/create-changefeed.html).

#### Create a changefeed connected to a cloud storage sink

{{site.data.alerts.callout_danger}}
**This is an experimental feature.** The interface and output are subject to change.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'experimental-s3://host?parameters'
  WITH updated, resolved;
~~~
~~~
+--------------------+
|       job_id       |
+--------------------+
| 360645287206223873 |
+--------------------+
(1 row)
~~~

For more information on how to create a changefeed connected to a cloud storage sink, see [Stream Data Out of CockroachDB Using Changefeeds](../{{site.versions["cloud"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-a-cloud-storage-sink) and [`CREATE CHANGEFEED`](../{{site.versions["cloud"]}}/create-changefeed.html).
