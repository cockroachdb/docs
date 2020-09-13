---
title: EXPERIMENTAL CHANGEFEED FOR
summary: which streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.
toc: true
---

{{site.data.alerts.callout_info}}
`EXPERIMENTAL CHANGEFEED FOR` is the core implementation of changefeeds. For the [enterprise-only](enterprise-licensing.html) version, see [`CREATE CHANGEFEED`](create-changefeed.html).
{{site.data.alerts.end}}

The `EXPERIMENTAL CHANGEFEED FOR` [statement](sql-statements.html) creates a new core changefeed, which streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.

{% include {{ page.version.version }}/cdc/core-url.md %}

For more information, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html).

{% include {{ page.version.version }}/misc/experimental-warning.md %}

## Required privileges

Changefeeds can only be created by superusers, i.e., [members of the `admin` role](authorization.html#create-and-manage-roles). The admin role exists by default with `root` as the member.

## Considerations

- Because core changefeeds return results differently than other SQL statements, they require a dedicated database connection with specific settings around result buffering. In normal operation, CockroachDB improves performance by buffering results server-side before returning them to a client; however, result buffering is automatically turned off for core changefeeds. Core changefeeds also have different cancelation behavior than other queries: they can only be canceled by closing the underlying connection or issuing a [`CANCEL QUERY`](cancel-query.html) statement on a separate connection. Combined, these attributes of changefeeds mean that applications should explicitly create dedicated connections to consume changefeed data, instead of using a connection pool as most client drivers do by default.

    This cancelation behavior (i.e., close the underlying connection to cancel the changefeed) also extends to client driver usage; in particular, when a client driver calls `Rows.Close()` after encountering errors for a stream of rows. The pgwire protocol requires that the rows be consumed before the connection is again usable, but in the case of a core changefeed, the rows are never consumed. It is therefore critical that you close the connection, otherwise the application will be blocked forever on `Rows.Close()`.

- In most cases, each version of a row will be emitted once. However, some infrequent conditions (e.g., node failures, network partitions) will cause them to be repeated. This gives our changefeeds an at-least-once delivery guarantee. For more information, see [Change Data Capture - Ordering Guarantees](stream-data-out-of-cockroachdb-using-changefeeds.html#ordering-guarantees).

## Synopsis

~~~
> EXPERIMENTAL CHANGEFEED FOR table_name [ WITH (option [= value] [, ...]) ];
~~~

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table (or tables in a comma separated list) to create a changefeed for.
`option` / `value` | For a list of available options and their values, see [Options](#options) below.

<!-- `IF NOT EXISTS` | Create a new changefeed only if a changefeed of the same name does not already exist; if one does exist, do not return an error.
`name` | The name of the changefeed to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers). -->

### Options

Option | Value | Description
-------|-------|------------
`updated` | N/A | Include updated timestamps with each row.
`resolved` | [`INTERVAL`](interval.html) | Periodically emit resolved timestamps to the changefeed. Optionally, set a minimum duration between emitting resolved timestamps. If unspecified, all resolved timestamps are emitted.<br><br>Example: `resolved='10s'`
`envelope` | `key_only` / `row` | Use `key_only` to emit only the key and no value, which is faster if you only want to know when the key changes.<br><br>Default: `envelope=row`
`cursor` | [Timestamp](as-of-system-time.html#parameters)  | Emits any changes after the given timestamp, but does not output the current state of the table first. If `cursor` is not specified, the changefeed starts by doing a consistent scan of all the watched rows and emits the current value, then moves to emitting any changes that happen after the scan.<br><br>`cursor` can be used to start a new changefeed where a previous changefeed ended.<br><br>Example: `CURSOR=1536242855577149065.0000000000`
`format` | `json` / `experimental_avro` | Format of the emitted record. Currently, support for [Avro is limited and experimental](#avro-limitations). <br><br>Default: `format=json`.
`confluent_schema_registry` | Schema Registry address | The [Schema Registry](https://docs.confluent.io/current/schema-registry/docs/index.html#sr) address is required to use `experimental_avro`.

#### Avro limitations

Currently, support for Avro is limited and experimental. Below is a list of unsupported SQL types and values for Avro changefeeds:

- [Decimals](decimal.html) must have precision specified.
- [Decimals](decimal.html) with `NaN` or infinite values cannot be written in Avro.

    {{site.data.alerts.callout_info}}
    To avoid `NaN` or infinite values, add a [`CHECK` constraint](check.html) to prevent these values from being inserted into decimal columns.
    {{site.data.alerts.end}}

- [`time`, `date`, `interval`](https://github.com/cockroachdb/cockroach/issues/32472), [`uuid`, `inet`](https://github.com/cockroachdb/cockroach/issues/34417), [`array`](https://github.com/cockroachdb/cockroach/issues/34420), and [`jsonb`](https://github.com/cockroachdb/cockroach/issues/34421) are not supported in Avro yet.

## Examples

### Create a changefeed

{% include {{ page.version.version }}/cdc/create-core-changefeed.md %}

### Create a changefeed with Avro

{% include {{ page.version.version }}/cdc/create-core-changefeed-avro.md %}

<!-- ### Pause and resume a changefeed

You can pause a changefeed by -->

## See also

- [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html)
- [Other SQL Statements](sql-statements.html)
