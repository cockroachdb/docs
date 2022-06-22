---
title: Back up and Restore Data
summary: Learn how to back up and restore a CockroachDB database.
toc: true
---

Because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (i.e., if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention. However, as an operational best practice, we recommend taking regular backups of your data.

Based on your [license type](https://www.cockroachlabs.com/pricing/), CockroachDB offers two methods to back up and restore your cluster's data: Enterprise and Core.

## Perform Enterprise backup and restore

If you have an [Enterprise license](enterprise-licensing.html), you can use the [`BACKUP`](backup.html) statement to efficiently back up your cluster's schemas and data to popular cloud services such as AWS S3, Google Cloud Storage, or NFS, and the [`RESTORE`](restore.html) statement to efficiently restore schema and data as necessary.

### Manual full backups

In most cases, it's recommended to use the [`BACKUP`](backup.html) command to take full nightly backups of each database in your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE <database_name> TO '<full_backup_location>';
~~~

If it's ever necessary, you can then use the [`RESTORE`](restore.html) command to restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE <database_name> FROM '<full_backup_location>';
~~~

### Manual full and incremental backups

If a database increases to a size where it is no longer feasible to take nightly full backups, you might want to consider taking periodic full backups (e.g., weekly) with nightly incremental backups. Incremental backups are storage efficient and faster than full backups for larger databases.

Periodically run the [`BACKUP`](backup.html) command to take a full backup of your database:

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

If it's ever necessary, you can then use the [`RESTORE`](restore.html) command to restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE <database_name> FROM '<full_backup_location>', '<list_of_previous_incremental_backup_locations>';
~~~

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

    Also customize the `cockroach sql` command with `--host`, `--certs-dir` or `--insecure`, and [additional flags](use-the-built-in-sql-client.html#flags) as required.

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

## Perform Core backup and restore

In case you do not have an Enterprise license, you can perform a Core backup. Run the [`cockroach dump`](sql-dump.html) command to dump all the tables in the database to a new file (`backup.sql` in the following example):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach dump <database_name> <flags> > backup.sql
~~~

To restore a database from a Core backup, [use the `cockroach sql` command to execute the statements in the backup file](sql-dump.html#restore-a-table-from-a-backup-file):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --database=[database name] < backup.sql
~~~

{{site.data.alerts.callout_success}}
If you created a backup from another database and want to import it into CockroachDB, see [Import data](migration-overview.html).
{{site.data.alerts.end}}

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SQL DUMP`](sql-dump.html)
- [`IMPORT`](migration-overview.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
