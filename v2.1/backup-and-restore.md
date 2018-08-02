---
title: Backup and Restore Data
summary: Learn how to back up and restore a CockroachDB database.
toc: true
---

CockroachDB offers the following methods to backup your cluster's data:

License | Backup Type | Description
------------|-----------------|-----------------
Core | [`cockroach dump`](sql-dump.html) | A CLI command to dump/export your database's schema and table data.
Enterprise | [`BACKUP`](backup.html) (*[enterprise license](https://www.cockroachlabs.com/pricing/) only*) | A SQL statement that backs up your cluster to cloud or network file storage.

How you restore your cluster's data depends on how you backed up the data:

License | Backup Type | Restore using...
------------|-----------------|-----------------
Core | [`cockroach dump`](sql-dump.html) | [Import data](import-data.html#import-from-generic-sql-dump)
Enterprise | [`BACKUP`](backup.html) (*[enterprise license](https://www.cockroachlabs.com/pricing/) only*) | [`RESTORE`](restore.html)

If you created a backup from another database and want to import it into CockroachDB, see [Import data](import-data.html).

### Operational best practice

Because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (i.e., if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention. However, as an operational best practice, we recommend taking regular backups of your data.

## Perform Core backup and restore

Run the [`cockroach dump`](sql-dump.html) command to dump all the tables in the database to a new file titled `backup.sql`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach dump <database_name> <flags> > backup.sql
~~~

To restore the database, run the [`IMPORT`](import-data.html) command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --database=[database name] < backup.sql
~~~

## Perform Enterprise backup and restore

### Perform manual full backups

For most use cases, you can take full backups nightly. Run the [`BACKUP`](backup.html) command every night to take full backups of your database:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE <database_name> TO '<full_backup_location>';
~~~

You can then restore your database by running the [`RESTORE`](restore.html) command:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE <database_name> FROM '<full_backup_location>';
~~~

### Perform full and incremental backups manually

If the database increases to a size where it is no longer feasible to take nightly full backups, you might want to consider taking regular full backups and nightly incremental backups. Incremental backups are storage efficient and faster than full backups for larger databases.

Run the [`BACKUP`](backup.html) command to take a full backup of your database:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE <database_name> TO '<full_backup_location>';
~~~

Then create nightly incremental backups based off of full backups you've already created.

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE <database_name> TO 'incremental_backup_location'
INCREMENTAL FROM '<full_backup_location>', '<previous_incremental_backup_location>';
~~~

You can restore your database by running the [`RESTORE`](restore.html) command:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE <database_name> FROM '<full_backup_location>', '<list_of_previous_incremental_backup_locations>';
~~~

### Automate full and incremental backups

You can automate your regular backups using scripts and your preferred method of automation, such as cron jobs.

For your reference, we have created this [sample backup script](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/backup.sh) that you can customize to automate your backups.

In the sample script, configure the day of the week for which you want to create full backups. Running the script daily will create a full backup on the configured day, and on other days, it'll create incremental backups. The script tracks the recently created backups in a separate file titled `recent_backups.txt` and uses this file as a base for the subsequent incremental backups.

1. Download the [sample backup script](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/backup.sh):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/backup.sh
    ~~~

    Alternatively, you can create the file yourself and copy the script into it:

    {% include copy-clipboard.html %}
    ~~~ shell
    #!/bin/bash

    set -euo pipefail

    # This script creates full backups when run on the configured
    # day of the week and incremental backups when run on other days, and tracks
    # recently created backups in a file to pass as the base for incremental backups.

    full_day=<day_of_the_week>                        # Must match (including case) the output of `LC_ALL=C date +%A`.
    what="DATABASE <database_name>"                   # The name of the database you want to backup.
    base="<storage_URL>/backups"                      # The URL where you want to store the backup.
    extra="<storage_parameters>"                      # Any additional parameters that need to be appended to the BACKUP URI e.g. AWS key params.
    recent=recent_backups.txt                         # File in which recent backups are tracked.
    backup_parameters=<additional backup parameters>  # e.g. "WITH revision_history"

    # Customize with additional flags for certificates/hosts/etc. as needed to connect.
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

2. In the sample backup script, customize the values for the following flags:

    Flag | Description
    -----|------------
    `day_of_the_week` | The day of the week on which you want to take a full backup.
    `database_name` | The name of the database you want to backup (i.e., create backups of all tables and views in the database).
    `storage_URL` | The URL where you want to store the backup.<br/><br/>URL format: `[scheme]://[host]/[path]` <br/><br/>For information about the components of the URL, see [Backup File URLs](backup.html#backup-file-urls).
    `storage_parameters`| The parameters required for the storage.<br/><br/>Parameters format: `?[parameters]` <br/><br/>For information about the storage parameters, see [Backup File URLs](backup.html#backup-file-urls).
    `additional_backup_parameters` | Additional [backup parameters](backup.html#parameters) you might want to specify.

    Also customize the `cockroach sql` command with [additional flags](use-the-built-in-sql-client.html#flags) (if required).

3. Change the file permissions to make the script executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ chmod +x backup.sh
    ~~~

4. Run the backup script:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./backup.sh
    ~~~

{{site.data.alerts.callout_info}}If you miss an incremental backup, delete the `recent_backups.txt` file and run the script. It'll take a full backup for that day and incremental backups for subsequent days.{{site.data.alerts.end}}

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SQL DUMP`](sql-dump.html)
- [`IMPORT`](import-data.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
