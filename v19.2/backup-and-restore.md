---
title: Back up and Restore Data
summary: Learn how to back up and restore a CockroachDB database.
toc: true
---

Because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (i.e., if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention. However, as an operational best practice, we recommend taking regular backups of your data.

Based on your [license type](https://www.cockroachlabs.com/pricing/), CockroachDB offers two methods to back up and restore your cluster's data: Enterprise and Core.

## Perform Enterprise backup and restore

If you have an [Enterprise license](enterprise-licensing.html), you can use the [`BACKUP`][backup] statement to efficiently back up your cluster's schemas and data to popular cloud services such as AWS S3, Google Cloud Storage, or NFS, and the [`RESTORE`][restore] statement to efficiently restore schema and data as necessary.

### Manual full backups

In most cases, it's recommended to use the [`BACKUP`][backup] command to take full nightly backups of each database in your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE <database_name> TO '<full_backup_location>';
~~~

If it's ever necessary, you can then use the [`RESTORE`][restore] command to restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE <database_name> FROM '<full_backup_location>';
~~~

### Manual full and incremental backups

If a database increases to a size where it is no longer feasible to take nightly full backups, you might want to consider taking periodic full backups (e.g., weekly) with nightly incremental backups. Incremental backups are storage efficient and faster than full backups for larger databases.

Periodically run the [`BACKUP`][backup] command to take a full backup of your database:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE <database_name> TO '<full_backup_location>';
~~~

Then create nightly incremental backups based off of the full backups you've already created.

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE <database_name> TO 'incremental_backup_location'
INCREMENTAL FROM '<full_backup_location>', '<list_of_previous_incremental_backup_location>';
~~~

If it's ever necessary, you can then use the [`RESTORE`][restore] command to restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE <database_name> FROM '<full_backup_location>', '<list_of_previous_incremental_backup_locations>';
~~~

{{site.data.alerts.callout_success}}
[Restoring from incremental backups](restore.html#restore-from-incremental-backups) requires previous full and incremental backups.
{{site.data.alerts.end}}

### Automated full and incremental backups

You can automate your backups using scripts and your preferred method of automation, such as cron jobs.

For your reference, we have created this [sample backup script](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/backup.sh) that you can customize to automate your backups.

In the sample script, configure the day of the week for which you want to create full backups. Running the script daily will create a full backup on the configured day, and on other days, it'll create incremental backups. The script tracks the recently created backups in a separate file titled `backup.txt` and uses this file as a base for the subsequent incremental backups.

1. Download the [sample backup script](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/backup.sh):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/backup.sh
    ~~~

    Alternatively, you can create the file yourself and copy the script into it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    #!/bin/bash

    set -euo pipefail

    # This script creates full backups when run on the configured
    # day of the week and incremental backups when run on other days, and tracks
    # recently created backups in a file to pass as the base for incremental backups.

    full_day="<day_of_the_week>"                      # Must match (including case) the output of `LC_ALL=C date +%A`.
    what="DATABASE <database_name>"                   # The name of the database you want to back up.
    base="<storage_URL>/backups"                      # The URL where you want to store the backup.
    extra="<storage_parameters>"                      # Any additional parameters that need to be appended to the BACKUP URI (e.g., AWS key params).
    recent=recent_backups.txt                         # File in which recent backups are tracked.
    backup_parameters=<additional backup parameters>  # e.g., "WITH revision_history"

    # Customize the `cockroach sql` command with `--host`, `--certs-dir` or `--insecure`, and additional flags as needed to connect to the SQL client.
    runsql() { cockroach sql --insecure -e "$1"; }

    destination="${base}/$(date +"%Y%m%d-%H%M")${extra}"

    prev=
    while read -r line; do
        [[ "$prev" ]] && prev+=", "
        prev+="'$line'"
    done < "$recent"

    if [[ "$(LC_ALL=C date +%A)" = "$full_day" || ! "$prev" ]]; then
        runsql "BACKUP $what TO '$destination' AS OF SYSTEM TIME '-1m' $backup_parameters"
        echo "$destination" > "$recent"
    else
        destination="${base}/$(date +"%Y%m%d-%H%M")-inc${extra}"
        runsql "BACKUP $what TO '$destination' AS OF SYSTEM TIME '-1m' INCREMENTAL FROM $prev $backup_parameters"
        echo "$destination" >> "$recent"
    fi

    echo "backed up to ${destination}"
    ~~~

2. In the sample backup script, customize the values for the following variables:

    Variable | Description
    -----|------------
    `full_day` | The day of the week on which you want to take a full backup.
    `what` | The name of the database you want to back up (i.e., create backups of all tables and views in the database).
    `base` | The URL where you want to store the backup.<br/><br/>URL format: `[scheme]://[host]/[path]` <br/><br/>For information about the components of the URL, see [Backup File URLs](backup.html#backup-file-urls).
    `extra`| The parameters required for the storage.<br/><br/>Parameters format: `?[parameters]` <br/><br/>For information about the storage parameters, see [Backup File URLs](backup.html#backup-file-urls).
    `backup_parameters` | Additional [backup parameters](backup.html#parameters) you might want to specify.

    Also customize the `cockroach sql` command with `--host`, `--certs-dir` or `--insecure`, and [additional flags](cockroach-sql.html#flags) as required.

3. Change the file permissions to make the script executable:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ chmod +x backup.sh
    ~~~

4. Run the backup script:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./backup.sh
    ~~~

{{site.data.alerts.callout_info}}
If you miss an incremental backup, delete the `recent_backups.txt` file and run the script. It'll take a full backup for that day and incremental backups for subsequent days.
{{site.data.alerts.end}}

### Locality-aware backup and restore

<span class="version-tag">New in v19.2:</span> You can create locality-aware backups such that each node writes files only to the backup destination that matches the [node locality](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) configured at [node startup](cockroach-start.html).

This is useful for:

- Reducing cloud storage data transfer costs by keeping data within cloud regions.
- Helping you comply with data domiciling requirements.

#### How it works

A locality-aware backup is specified by a list of URIs, each of which has a `COCKROACH_LOCALITY` URL parameter whose single value is either `default` or a single locality key-value pair such as `region=us-east`. At least one `COCKROACH_LOCALITY` must be the `default`. Given a list of URIs that together contain the locations of all of the files for a single locality-aware backup, [`RESTORE`][restore] can read in that backup.

During locality-aware backups, backup file placement is determined by leaseholder placement, as each node is responsible for backing up the ranges for which it is the leaseholder.  Nodes write files to the backup storage location whose locality matches their own node localities, with a preference for more specific values in the locality hierarchy.  If there is no match, the `default` locality is used.

{{site.data.alerts.callout_info}}
The list of URIs passed to [`RESTORE`][restore] may be different from the URIs originally passed to [`BACKUP`][backup]. This is because the files of a locality-aware backup can be moved to different locations, or even consolidated into the same location. The only restriction is that all the files originally written to the same location must remain together. In order for [`RESTORE`][restore] to succeed, all of the files originally written during [`BACKUP`][backup] must be accounted for in the list of location URIs provided.
{{site.data.alerts.end}}

#### Usage

For example, to create a locality-aware backup where nodes with the locality `region=us-west` write backup files to `s3://us-west-bucket`, and all other nodes write to `s3://us-east-bucket` by default, run:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE foo TO ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
~~~

To restore the backup created above, run the statement below. Note that the first URI in the list has to be the URI specified as the `default` URI when the backup was created. If you have moved your backups to a different location since the backup was originally taken, the first URI must be the new location of the files originally written to the `default` location.

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE foo FROM ('s3://us-east-bucket', 's3://us-west-bucket');
~~~

A list of multiple URIs (surrounded by parentheses) specifying a locality-aware backup can also be used in place of any incremental backup URI in [`RESTORE`][restore]. If the original backup was an incremental backup, it can be restored using:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE foo FROM 's3://other-full-backup-uri', ('s3://us-east-bucket', 's3://us-west-bucket');
~~~

For more detailed examples, see [Create locality-aware backups](backup.html#create-locality-aware-backups) and [Restore from a locality-aware backup based on node locality](restore.html#restore-from-a-locality-aware-backup).

{{site.data.alerts.callout_info}}
The locality query string parameters must be [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding) as shown below.

[`RESTORE`][restore] is not truly locality-aware; while restoring from backups, a node may read from a store that does not match its locality. This can happen because [`BACKUP`][backup] does not back up [zone configurations](configure-replication-zones.html), so [`RESTORE`][restore] has no way of knowing how to take node localities into account when restoring data from a backup.
{{site.data.alerts.end}}

## Perform Core backup and restore

In case you do not have an Enterprise license, you can perform a Core backup. Run the [`cockroach dump`](cockroach-dump.html) command to dump all the tables in the database to a new file (`backup.sql` in the following example):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach dump <database_name> <flags> > backup.sql
~~~

To restore a database from a Core backup, [use the `cockroach sql` command to execute the statements in the backup file](cockroach-dump.html#restore-a-table-from-a-backup-file):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --database=[database name] < backup.sql
~~~

{{site.data.alerts.callout_success}}
If you created a backup from another database and want to import it into CockroachDB, see [Import data](migration-overview.html).
{{site.data.alerts.end}}

## See also

- [`BACKUP`][backup]
- [`RESTORE`][restore]
- [`SQL DUMP`](cockroach-dump.html)
- [`IMPORT`](migration-overview.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
