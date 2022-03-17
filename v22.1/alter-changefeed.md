---
title: ALTER CHANGEFEED
summary: Use the ALTER CHANGEFEED statement to add and drop changefeed targets, as well as set and unset options.
toc: true
docs_area: reference.sql
---

{% include enterprise-feature.md %}

<span class="version-tag">New in v22.1:</span> The `ALTER CHANGEFEED` statement modifies an existing changefeed. You can use `ALTER CHANGEFEED` to do the following:

- Add new target tables to a changefeed.
- Remove target tables from a changefeed.
- Set new options on a changefeed.
- Remove existing options from a changefeed.

The statement will return a job ID and the new job description.

It is necessary to **pause** a changefeed before running an `ALTER CHANGEFEED` on it. For an example of creating a changefeed and then modifying it with `ALTER CHANGEFEED`, see [Modify a changefeed](#modify-a-changefeed).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/master/grammar_svg/alter_changefeed.html %}
</div>

<!--TODO this really needs to be updated -->

## Parameters

Parameter                               | Description
----------------------------------------+-------------------------------------------------------------------------------------------------------------------------
`job ID`                               | Include the `job ID` to specify the changefeed job to modify.
`WITH`                                 | Use `ADD <table> WITH initial_scan` to perform a scan when adding a target. By default, there is not an initial scan after an `ALTER CHANGEFEED` statement regardless of whether [`initial_scan`](create-changefeed.html#initial-scan) was set with the **original** `CREATE CHANGEFEED` statement. It is also possible to explicitly state `ADD <table> WITH no_initial_scan` (although the default makes this unnecessary). See further details in the [Options](#scan-details) section.
`ADD`                                  | Add a new target table to a changefeed. See the [example](#add-targets-to-a-changefeed).
`DROP`                                 | Drop a target table from a changefeed. It is **not** possible to drop all target tables from a changefeed. See the [example](#drop-targets-from-a-changefeed).
`SET`                                  | Set new options on a changefeed. `SET` uses the [`CREATE CHANGEFEED`](create-changefeed.html#options) options. The following [Options](#options) section provides more detail on these. **Note:** You cannot use `cursor` with `ALTER CHANGEFEED`. See the [example](#set-options-on-a-changefeed).
`UNSET`                                | Remove options that were set with the original `CREATE CHANGEFEED` statement. See the [example](#unset-options-on-a-changefeed).

When the listed parameters are used together in the same statement, all changes will apply at the same time—there is not a particular order of operations.

### Options

Consider the following when specifying options with `ALTER CHANGEFEED`:

- You can set a different [sink URI](changefeed-sinks.html#sink-uri) for an existing changefeed with the `sink` option. It is **not** possible to change the sink type. For example, you can use `SET sink = 'gs://{BUCKET NAME}?AUTH=IMPLICIT'` to use a different Google Cloud Storage bucket. However, you cannot use the `sink` option to move to Amazon S3 (`s3://`) or Kafka (`kafka://`). See the [Set options on a changefeed](#set-options-on-a-changefeed) example.

- The [`CREATE CHANGEFEED`](create-changefeed.html#options) options are compatible with `SET`/`UNSET`. This excludes the [`cursor`](create-changefeed.html#cursor-option) option, which you **cannot** use in an `ALTER CHANGEFEED` statement.  

- <a name="scan-details"></a>To use `initial_scan`or `no_initial_scan` with `ALTER CHANGEFEED`, it is necessary to define a `WITH` clause. This will set these options on a specific table when the table is included as a newly added target:

    ~~~ sql
    ALTER CHANGEFEED {job ID} ADD movr.rides WITH initial_scan SET updated UNSET resolved;
    ~~~

    Explicitly adding the `initial_scan` option will trigger an initial scan on the newly added table. Even though the default behavior during an `ALTER CHANGEFEED` statement is that there will be no initial scan, you can still explicitly define that there should be no initial scan by adding the `no_initial_scan` option in the same way.

## Required Privileges

To alter a changefeed, the user must be a member of the `admin` role or have the [`CREATECHANGEFEED`](create-user.html#create-a-user-that-can-control-changefeeds) parameter set.

## Examples

### Modify a changefeed

To use the `ALTER CHANGEFEED` statement to modify a changefeed, it is necessary to first pause the running changefeed. The following example demonstrates creating a changefeed, pausing the changefeed, modifying it, and then resuming the changefeed.

1. First, create the changefeed. This example changefeed will emit change messages to a cloud storage sink on two watched tables. The emitted messages will include the [`resolved`](create-changefeed.html#resolved-option), [`updated`](create-changefeed.html#updated-option), and [`schema_change_policy`](create-changefeed.html#schema-policy) options:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE movr.users, movr.vehicles INTO 's3://{BUCKET_NAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY={SECRET_ACCESS_KEY}'
        WITH resolved, updated, schema_change_policy = backfill;
    ~~~

    ~~~
           job_id
    ----------------------
    745448689649516545
    (1 row)
    ~~~

1. Use [`SHOW CHANGEFEED JOB`](show-jobs.html#show-changefeed-jobs) with the job ID to view the details of a changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW CHANGEFEED JOB 745448689649516545;
    ~~~

    ~~~
    job_id             |                                                                                                          description                                                                                       | user_name | status  |              running_status              |          created          |          started           | finished |          modified          |      high_water_timestamp      | error |                                                sink_uri                                                |             full_table_names             | topics | format
    -------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+---------+------------------------------------------+---------------------------+----------------------------+----------+----------------------------+--------------------------------+-------+--------------------------------------------------------------------------------------------------------+------------------------------------------+--------+---------
    745448689649516545 | CREATE CHANGEFEED FOR TABLE movr.users, movr.vehicles INTO 's3://{BUCKET_NAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY=redacted' WITH resolved, schema_change_policy = 'backfill', updated | root      | running | running: resolved=1647563286.239010012,0 | 2022-03-18 00:28:06.24559 | 2022-03-18 00:28:06.276709 | NULL     | 2022-03-18 00:28:37.250323 | 1647563313622679573.0000000000 |       | s3://{BUCKET_NAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY=redacted                    | {movr.public.vehicles,movr.public.users} | NULL   | json
    (1 row)
    ~~~

    To output a list of all changefeeds on the cluster, run the following:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW CHANGEFEED JOBS;
    ~~~

1. In preparation for modifying the created changefeed, use `PAUSE JOB`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    PAUSE JOB 745448689649516545;
    ~~~

1. With the changefeed paused, run the `ALTER CHANGEFEED` statement with `ADD`, `DROP`, `SET`, or `UNSET` to change the target tables or options:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER CHANGEFEED 745448689649516545 DROP movr.vehicles UNSET resolved SET diff;
    ~~~

    ~~~
    job_id             |                                                                                                                                                               job_description
    -------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    745448689649516545 | CREATE CHANGEFEED FOR TABLE users INTO 's3://{BUCKET_NAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY=redacted' WITH diff, envelope = 'wrapped', format = 'json', key_in_value, on_error = 'fail', schema_change_events = 'default', schema_change_policy = 'backfill', updated, virtual_columns = 'omitted'
    (1 row)
    ~~~

    <a name="show-output-post-alter"></a>The output from `ALTER CHANGEFEED` will show the `CREATE CHANGEFEED` statement with the options you've defined and implicit options that CockroachDB has used to create the changefeed.

    In this example, cloud storage is the downstream sink. Since the message format for [cloud storage sinks](changefeed-sinks.html#cloud-storage-sink) defaults to `json`, you'll see the `format = 'json'` option implicitly applied (even though this was not explicitly specified in the original `CREATE CHANGEFEED` statement). The remaining options in this output represent the other defaults that CockroachDB has applied to create the changefeed.

    For an explanation on each of these options, see [Options](create-changefeed.html#options) on the `CREATE CHANGEFEED` page.  

1. Resume the changefeed job with `RESUME JOB`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    RESUME JOB 745448689649516545;
    ~~~

### Add targets to a changefeed

The following statement adds the `vehicles` and `rides` tables as new table targets to the changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER CHANGEFEED {job ID} ADD movr.rides, movr.vehicles;
~~~

### Drop targets from a changefeed

The following statement removes the `rides` table from the changefeed's table targets:

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER CHANGEFEED {job ID} DROP movr.rides;
~~~

### Set options on a changefeed

Use `SET` to add a new option(s) to a changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER CHANGEFEED {job ID} SET resolved='10s', envelope=key_only;
~~~

`ALTER CHANGEFEED ... SET` can implement the options listed on the `CREATE CHANGEFEED` page. For details on the few exceptions to this, see the [Options](#options) section on this page.

<a name="sink-example"></a>Use the `sink` option to change the sink URI to which the changefeed emits messages:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER CHANGEFEED 747047191994826753
    SET sink = 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY={SECRET_ACCESS_KEY}'
    UNSET resolved;
~~~

The type (or scheme) of the sink **cannot** change. That is, if the changefeed was originally sending messages to `kafka://`, then you can change to a different Kafka URI. For cloud storage sinks, the cloud storage scheme must remain the same (e.g., `s3://`).

To change the [sink type](changefeed-sinks.html), create a new changefeed.

### Unset options on a changefeed

To remove options from a changefeed, use `UNSET`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER CHANGEFEED 747047191994826753 {job ID} UNSET resolved, diff;
~~~

## Known Limitations

- The `SHOW CHANGEFEED JOB` output after an `ALTER CHANGEFEED` statement will show the implicit options that CockroachDB uses to create the changefeed internally. [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/78420)
- It is necessary to pause the changefeed before performing any `ALTER CHANGEFEED` statement. [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/77171)
- `ALTER CHANGEFEED` will accept duplicate targets without sending an error. [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/78285)

## See also

- [Change Data Capture Overview](change-data-capture-overview.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Create and Configure Changefeeds](create-and-configure-changefeeds.html)
- [Changefeed Sinks](changefeed-sinks.html)
- [`SHOW JOBS`](show-jobs.html)
