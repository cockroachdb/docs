---
title: Back up and Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: true
---

Because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (i.e., if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention. However, as an operational best practice, **we recommend taking regular backups of your data**.

Based on your [license type](https://www.cockroachlabs.com/pricing/), CockroachDB offers two methods to backup and restore your cluster's data: [Enterprise](#perform-enterprise-backup-and-restore) and [Core](#perform-core-backup-and-restore).

## Watch the demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/RGuya_SYfY8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Perform Enterprise backup and restore

If you have an [Enterprise license](enterprise-licensing.html), you can use the [`BACKUP`][backup] statement to efficiently back up your cluster's schemas and data to popular cloud services such as AWS S3, Google Cloud Storage, or NFS, and the [`RESTORE`][restore] statement to efficiently restore schema and data as necessary.

{{site.data.alerts.callout_success}}
We recommend [automating daily backups of your cluster](#automated-full-and-incremental-backups). To automate backups, you must have a client send the `BACKUP` statement to the cluster. Once the backup is complete, your client will receive a `BACKUP` response.
{{site.data.alerts.end}}

### Full backups

In most cases, **it's recommended to take full nightly backups of your cluster**. A cluster backup allows you to do the following:

- Restore table(s) from the cluster
- Restore database(s) from the cluster
- Restore a full cluster

To do a cluster backup, use the [`BACKUP`](backup.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP TO '<backup_location>';
~~~

If it's ever necessary, you can use the [`RESTORE`][restore] statement to restore a table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM '<backup_location>';
~~~

Or to restore a  database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM '<backup_location>';
~~~

Or to restore your full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM '<backup_location>';
~~~

{{site.data.alerts.callout_info}}
A full cluster restore can only be run on a target cluster that has _never_ had user-created databases or tables.
{{site.data.alerts.end}}

### Full and incremental backups

If your cluster grows too large for nightly full backups, you can take less frequent full backups (e.g., weekly) with nightly incremental backups. Incremental backups are storage efficient and faster than full backups for larger clusters.

Periodically run the [`BACKUP`][backup] command to take a full backup of your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP TO '<backup_location>';
~~~

Then, create nightly incremental backups based off of the full backups you've already created. If you backup to a destination already containing a full backup, an incremental backup will be appended to the full backup in a subdirectory:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP TO '<backup_location>';
~~~

{{site.data.alerts.callout_info}}
For an example on how to specify the destination of an incremental backup, see [Backup and Restore - Advanced Options](backup-and-restore.html)
{{site.data.alerts.end}}

If it's ever necessary, you can then use the [`RESTORE`][restore] command to restore your cluster, database(s), and/or table(s). [Restoring from incremental backups](restore.html#restore-from-incremental-backups) requires previous full and incremental backups. To restore from a destination containing the full backup, as well as the automatically appended incremental backups (that are stored as subdirectories, like in the example above):

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM '<backup_location>';
~~~

### Examples

#### Automated full and incremental backups

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
    what=""                                           # Leave empty fo cluster backup, or add "DATABASE database_name" to backup a database.
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
    `what` | Leave empty for a cluster backup. Otherwise, add `DATABASE <db_name>` to back up a database (i.e., create backups of all tables and views in the database).
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

#### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

## Perform Core backup and restore

If you do not have an Enterprise license, you can perform a core backup. Run the [`cockroach dump`](cockroach-dump.html) command to dump all the tables in the database to a new file (e.g., `backup.sql`):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach dump <database_name> <flags> > backup.sql
~~~

To restore a database from a core backup, use the [`IMPORT PGDUMP`](import.html#import-a-cockroachdb-dump-file) statement:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --execute="IMPORT PGDUMP 's3://your-external-storage/backup.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'" \
 <flags>
~~~

You can also [use the `cockroach sql` command](cockroach-dump.html#restore-a-table-from-a-backup-file) to execute the [`CREATE  TABLE`](create-table.html) and [`INSERT`](insert.html) statements in the backup file:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --database=[database name] < backup.sql
~~~

{{site.data.alerts.callout_success}}
If you created a backup from another database and want to import it into CockroachDB, see the [Migration Overview](migration-overview.html).
{{site.data.alerts.end}}

## See also

- [Back up and Restore Data - Advanced Options](backup-and-restore.html)
- [`BACKUP`][backup]
- [`RESTORE`][restore]
- [`SQL DUMP`](cockroach-dump.html)
- [`IMPORT`](migration-overview.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
