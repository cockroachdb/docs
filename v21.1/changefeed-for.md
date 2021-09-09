---
title: EXPERIMENTAL CHANGEFEED FOR
summary: which streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.
toc: true
---

{{site.data.alerts.callout_info}}
`EXPERIMENTAL CHANGEFEED FOR` is the core implementation of changefeeds. For the [enterprise-only](enterprise-licensing.html) version, see [`CREATE CHANGEFEED`](create-changefeed.html).
{{site.data.alerts.end}}

The `EXPERIMENTAL CHANGEFEED FOR` [statement](sql-statements.html) creates a new core changefeed, which streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled. A core changefeed can watch one table or multiple tables in a comma-separated list.

{% include {{ page.version.version }}/cdc/core-url.md %}

For more information, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html).

{% include {{ page.version.version }}/misc/experimental-warning.md %}

## Required privileges

Changefeeds can only be created by superusers, i.e., [members of the `admin` role](authorization.html#create-and-manage-roles). The admin role exists by default with `root` as the member.

## Considerations

- Because core changefeeds return results differently than other SQL statements, they require a dedicated database connection with specific settings around result buffering. In normal operation, CockroachDB improves performance by buffering results server-side before returning them to a client; however, result buffering is automatically turned off for core changefeeds. Core changefeeds also have different cancellation behavior than other queries: they can only be canceled by closing the underlying connection or issuing a [`CANCEL QUERY`](cancel-query.html) statement on a separate connection. Combined, these attributes of changefeeds mean that applications should explicitly create dedicated connections to consume changefeed data, instead of using a connection pool as most client drivers do by default.

    This cancellation behavior (i.e., close the underlying connection to cancel the changefeed) also extends to client driver usage; in particular, when a client driver calls `Rows.Close()` after encountering errors for a stream of rows. The pgwire protocol requires that the rows be consumed before the connection is again usable, but in the case of a core changefeed, the rows are never consumed. It is therefore critical that you close the connection, otherwise the application will be blocked forever on `Rows.Close()`.

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

Currently, support for Avro is limited and experimental. 

Below are clarifications for particular SQL types and values for Avro changefeeds:

  - [Decimals](decimal.html) must have precision specified.
  - [`BIT`](bit.html) and [`VARBIT`](bit.html) types are encoded as arrays of 64-bit integers.

    For efficiency, CockroachDB encodes `BIT` and `VARBIT` bitfield types as arrays of 64-bit integers. That is, [base-2 (binary format)](https://en.wikipedia.org/wiki/Binary_number#Conversion_to_and_from_other_numeral_systems) `BIT` and `VARBIT` data types are converted to base 10 and stored in arrays. Encoding in CockroachDB is [big-endian](https://en.wikipedia.org/wiki/Endianness), therefore the last value may have many trailing zeroes. For this reason, the first value of each array is the number of bits that are used in the last value of the array.

    For instance, if the bitfield is 129 bits long, there will be 4 integers in the array. The first integer will be `1`; representing the number of bits in the last value, the second integer will be the first 64 bits, the third integer will be bits 65–128, and the last integer will either be `0` or `9223372036854775808` (i.e. the integer with only the first bit set, or `1000000000000000000000000000000000000000000000000000000000000000` when base 2).

    This example is base-10 encoded into an array as follows:

    ~~~
    {"array": [1, <first 64 bits>, <second 64 bits>, 0 or 9223372036854775808]}
    ~~~

    For downstream processing, it is necessary to base 2 encode every element in the array (except for the first element). The first number in the array gives you the number of bits to take from the last base-2 number — that is, the most significant bits. So, in the example above this would be `1`. Finally, all the base-2 numbers can be appended together, which will result in the original number of bits, 129.

    In a different example of this process where the bitfield is 136 bits long, the array would be similar to the following when base-10 encoded:

    ~~~
    {"array": [8, 18293058736425533439, 18446744073709551615, 13690942867206307840]}
    ~~~

    To then work with this data, you would convert each of the elements in the array to base-2 numbers, besides the first element. For the above array, this would convert to:

    ~~~
    [8, 1111110111011011111111111111111111111111111111111111111111111111, 1111111111111111111111111111111111111111111111111111111111111111, 1011111000000000000000000000000000000000000000000000000000000000]
    ~~~

    Next, you use the first number to take the number of bits from the last base-2 element, `10111110`. Finally, you append each of the base-2 numbers (the last number from the array being truncated), which in this case results in 136 bits, the original number of bits.

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
