---
title: CREATE CHANGEFEED
summary: The CREATE CHANGEFEED statement creates a new changefeed, which provides row-level change subscriptions.
toc: false
---

<span class="version-tag">New in v2.1:</span> The `CREATE CHANGEFEED` [statement](sql-statements.html) creates a new changefeed, which provides row-level change subscriptions. Changefeed targets a whitelist of databases, tables, partitions, rows, or a combination of these; called the "watched rows." Every change to a watched row is emitted as a record in a configurable format (i.e., `JSON` or Avro) to a configurable sink (i.e., Kafka).

For more information, see [Change Data Capture](change-data-capture.html).

{{site.data.alerts.callout_danger}}
**This feature is under active development** and only works for a targeted a use case. Please [file a Github issue](file-an-issue.html) if you have feedback on the interface.

In v2.1, CDC will be an enterprise feature and will have a core version.
{{site.data.alerts.end}}

<div id="toc"></div>

## Required privileges

Only an `admin` user can create a changefeed.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/create_database.html %}

## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new changefeed only if a changefeed of the same name does not already exist; if one does exist, do not return an error.
`name` | The name of the changefeed to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

## Example

### Create a changefeed

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

For for information on how to create a changefeed connected to Kafka, see [Change Data Capture](change-data-capture.html#create-a-changefeed-connected-to-kafka).

## See also

- [Change Data Capture](change-data-capture.html)
- [Other SQL Statements](sql-statements.html)
