---
title: ALTER CHANGEFEED
summary: Use the ALTER CHANGEFEED statement to add and drop changefeed targets, as well as set and unset options.
toc: true
docs_area: reference.sql
---



The `ALTER CHANGEFEED` statement modifies an existing [changefeed]({% link {{ page.version.version }}/change-data-capture-overview.md %}). You can use `ALTER CHANGEFEED` to do the following:

- Add new target tables to a changefeed.
- Remove target tables from a changefeed.
- Set new options on a changefeed.
- Remove existing options from a changefeed.

The statement will return a job ID and the new job description.

It is necessary to [**pause**]({% link {{ page.version.version }}/pause-job.md %}) a changefeed before running the `ALTER CHANGEFEED` statement against it. For an example of a changefeed modification using `ALTER CHANGEFEED`, see [Modify a changefeed](#modify-a-changefeed).

## Required privileges

To alter a changefeed, the user must have one of the following:

- `CHANGEFEED` privilege on the table.
- `admin` role.
- `CONTROLCHANGEFEED` role option + `SELECT` on the table. (**Deprecated**) The `CONTROLCHANGEFEED` role option will be removed in a future release. We recommend using the system-level privilege [`CHANGEFEED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

For more details on the required privileges for changefeeds generally, refer to the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) page.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_changefeed.html %}
</div>

## Parameters

Parameter                               | Description
----------------------------------------+-------------------------------------------------------------------------------------------------------------------------
`job_ID`                               | Specify the changefeed `job_ID` to modify.
`WITH` | Use `ADD {tables} WITH initial_scan = 'yes'` to perform a scan when adding a target table or multiple target tables. The `ALTER CHANGEFEED` statement does not perform an initial scan by default, regardless of whether [`initial_scan = 'yes'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) was set with the **original** `CREATE CHANGEFEED` statement. It is also possible to explicitly state `ADD {tables} WITH initial_scan = 'no'`, although the default makes this unnecessary. See further details in the [Options](#scan-details) section.
`ADD`                                  | Add a new target table to a changefeed. See the [example](#add-targets-to-a-changefeed).
`DROP`                                 | Drop a target table from a changefeed. It is **not** possible to drop all target tables from a changefeed. See the [example](#drop-targets-from-a-changefeed).
`SET`                                  | Set new options on a changefeed. `ALTER CHANGEFEED ... SET ...` uses the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#options) options with some [exceptions](#option-exceptions). See the [example](#set-options-on-a-changefeed).
`UNSET`                                | Remove options that were set with the original `CREATE CHANGEFEED` statement with some [exceptions](#option-exceptions). See the [example](#unset-options-on-a-changefeed).

When the listed parameters are used together in the same statement, all changes will apply at the same time with no particular order of operations.

### Options

Consider the following when specifying options with `ALTER CHANGEFEED`:

- You can set a different [sink URI]({% link {{ page.version.version }}/changefeed-sinks.md %}#sink-uri) for an existing changefeed with the `sink` option. It is **not** possible to change the sink type. For example, you can use `SET sink = 'gs://{BUCKET NAME}?AUTH=IMPLICIT'` to use a different Google Cloud Storage bucket. However, you cannot use the `sink` option to move to Amazon S3 (`s3://`) or Kafka (`kafka://`). See the [Set options on a changefeed](#set-options-on-a-changefeed) example.

- <a name="option-exceptions"></a> The majority of [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#options) options are compatible with `SET`/`UNSET`. This excludes the following options, which you **cannot** use in an `ALTER CHANGEFEED` statement:
  - [`cursor`]({% link {{ page.version.version }}/create-changefeed.md %}#cursor)
  - [`end_time`]({% link {{ page.version.version }}/create-changefeed.md %}#end-time)
  - [`full_table_name`]({% link {{ page.version.version }}/create-changefeed.md %}#full-table-name): This option will not apply to existing tables. To use the fully qualified table name, it is necessary to create a new changefeed.
  - [`initial_scan = 'only'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan)

- <a name="scan-details"></a> To use [`initial_scan`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) with `ALTER CHANGEFEED`, it is necessary to define a `WITH` clause when running `ADD`. This will set these options on the specific table(s):

    ~~~ sql
    ALTER CHANGEFEED {job ID} ADD movr.rides, movr.vehicles WITH initial_scan = 'yes' SET updated UNSET resolved;
    ~~~

    Setting `initial_scan = 'yes'` will trigger an initial scan on the newly added table. You may also explicitly define `initial_scan = 'no'`, though this is already the default behavior. The changefeed does not track the application of this option post scan. This means that you will not see the option listed in output or after a `SHOW CHANGEFEED JOB` statement.


## Examples

### Modify a changefeed

To use the `ALTER CHANGEFEED` statement to modify a changefeed, it is necessary to first pause the running changefeed. The following example demonstrates creating a changefeed, pausing the changefeed, modifying it, and then resuming the changefeed.

{{site.data.alerts.callout_info}}
For more information on enabling changefeeds, see [Create and Configure Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}).
{{site.data.alerts.end}}

1. Create the changefeed. This example changefeed will emit change messages to a cloud storage sink on two watched tables. The emitted messages will include the [`resolved`]({% link {{ page.version.version }}/create-changefeed.md %}#resolved), [`updated`]({% link {{ page.version.version }}/create-changefeed.md %}#updated), and [`schema_change_policy`]({% link {{ page.version.version }}/create-changefeed.md %}#schema-change-policy) options:

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

1. Use [`SHOW CHANGEFEED JOB`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) with the job_ID to view the details of a changefeed:

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

1. In preparation for modifying the created changefeed, use [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}):

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
    job_id             |                                                                     job_description
    -------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    745448689649516545 | CREATE CHANGEFEED FOR TABLE movr.public.users INTO 's3://{BUCKET_NAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY=redacted' WITH diff, schema_change_policy = 'backfill', updated
    (1 row)
    ~~~

    The output from `ALTER CHANGEFEED` will show the `CREATE CHANGEFEED` statement with the options you've defined. After modifying a changefeed with `ALTER CHANGEFEED`, the `CREATE` description will show the fully qualified table name.

    For an explanation on each of these options, see the `CREATE CHANGEFEED` [options]({% link {{ page.version.version }}/create-changefeed.md %}#options).

1. Resume the changefeed job with `RESUME JOB`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    RESUME JOB 745448689649516545;
    ~~~

### Add targets to a changefeed

The following statement adds the `vehicles` and `rides` tables as new table targets to the changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER CHANGEFEED {job_ID} ADD movr.rides, movr.vehicles;
~~~

To add a table that has [column families]({% link {{ page.version.version }}/column-families.md %}), see the [example](#modify-a-changefeed-targeting-tables-with-column-families).

### Drop targets from a changefeed

The following statement removes the `rides` table from the changefeed's table targets:

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER CHANGEFEED {job_ID} DROP movr.rides;
~~~

### Set options on a changefeed

Use `SET` to add a new option(s) to a changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER CHANGEFEED {job_ID} SET resolved='10s', envelope=key_only;
~~~

`ALTER CHANGEFEED ... SET` can implement the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#options) options with some [exceptions](#options).

<a name="sink-example"></a>Use the `sink` option to change the sink URI to which the changefeed emits messages:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER CHANGEFEED {job_ID}
    SET sink = 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY={SECRET_ACCESS_KEY}'
    UNSET resolved;
~~~

The type (or scheme) of the sink **cannot** change. That is, if the changefeed was originally sending messages to `kafka://`, for example, then you can only change to a different Kafka URI. Similarly, for cloud storage sinks, the cloud storage scheme must remain the same (e.g., `s3://`), but you can change to a different storage sink on the same cloud provider.

To change the [sink type]({% link {{ page.version.version }}/changefeed-sinks.md %}), create a new changefeed.

### Unset options on a changefeed

To remove options from a changefeed, use `UNSET`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER CHANGEFEED {job_ID} UNSET resolved, diff;
~~~

### Modify a changefeed targeting tables with column families

To add a table with [column families]({% link {{ page.version.version }}/column-families.md %}) when modifying a changefeed, perform one of the following:

- Use the `FAMILY` keyword to define specific families:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER CHANGEFEED {job_ID} ADD database.table FAMILY f1, database.table FAMILY f2;
    ~~~

- Or, set the [`split_column_families`]({% link {{ page.version.version }}/create-changefeed.md %}#split-column-families) option:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER CHANGEFEED {job_ID} ADD database.table SET split_column_families;
    ~~~

To remove a table with column families as a target from the changefeed, you must `DROP` it in the same way that you added it originally as a changefeed target. For example:

- If you used `FAMILY` to add the table to the changefeed, use `FAMILY` when removing it:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER CHANGEFEED {job_ID} DROP database.table FAMILY f1, database.table FAMILY f2;
    ~~~

    When using the `FAMILY` keyword, it is possible to remove only one family at a time as needed. You will receive an error if you try to remove a table without specifying the `FAMILY` keyword.

- Or, if you originally added the whole table and its column families with `split_column_families`, then remove it without using the `FAMILY` keyword:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER CHANGEFEED {job_ID} DROP database.table;
    ~~~

For further discussion on using the `FAMILY` keyword and `split_column_families`, see [Tables with column families in changefeeds]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %}).

## Known limitations

{% include {{ page.version.version }}/known-limitations/alter-changefeed-limitations.md %}
- {% include {{ page.version.version }}/known-limitations/alter-changefeed-cdc-queries.md %}

## See also

- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Create and Configure Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %})
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
