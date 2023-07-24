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
Currently, [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) connected to [Kafka versions < v1.0](https://docs.confluent.io/platform/current/installation/versions-interoperability.html) are not supported in CockroachDB v21.1.
{{site.data.alerts.end}}

For more information on how to create a changefeed connected to Kafka, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-kafka).

#### Create a changefeed connected to a cloud storage sink

{{site.data.alerts.callout_danger}}
**This is an experimental feature.** The interface and output are subject to change.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'experimental-scheme://host?parameters'
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

For more information on how to create a changefeed connected to a cloud storage sink, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-a-cloud-storage-sink).
