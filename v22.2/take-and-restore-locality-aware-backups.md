---
title: Take and Restore Locality-aware Backups
summary: Learn about the advanced options you can use when you backup and restore a CockroachDB cluster.
toc: true
docs_area: manage
---

This page provides information about how to take and restore locality-aware backups.

{{site.data.alerts.callout_info}}
Locality-aware [`BACKUP`](backup.html) is an [Enterprise-only](https://www.cockroachlabs.com/product/cockroachdb/) feature. However, you can take [full backups](take-full-and-incremental-backups.html) without an Enterprise license.
{{site.data.alerts.end}}

You can create locality-aware backups such that each node writes files only to the backup destination that matches the [node locality](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) configured at [node startup](cockroach-start.html).

This is useful for:

- Reducing cloud storage data transfer costs by keeping data within cloud regions.
- Helping you comply with data domiciling requirements.

A locality-aware backup is specified by a list of URIs, each of which has a `COCKROACH_LOCALITY` URL parameter whose single value is either `default` or a single locality key-value pair such as `region=us-east`. At least one `COCKROACH_LOCALITY` must be the `default`. Given a list of URIs that together contain the locations of all of the files for a single locality-aware backup, [`RESTORE` can read in that backup](#restore-from-a-locality-aware-backup).

{{site.data.alerts.callout_info}}
The locality query string parameters must be [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding).
{{site.data.alerts.end}}

Every node involved in the backup is responsible for backing up the ranges for which it was the [leaseholder](architecture/replication-layer.html#leases) at the time the [distributed backup flow](architecture/sql-layer.html#distsql) was planned. The locality of the node running the distributed backup flow determines where the backup files will be placed in a locality-aware backup. The node running the backup flow, and the leaseholder node of the range being backed up are usually the same, but can differ when lease transfers have occurred during the execution of the backup. The leaseholder node returns the files to the node running the backup flow (usually a local transfer), which then writes the file to the external storage location with a locality that matches its own localities (with an overall preference for more specific values in the locality hierarchy). If there is no match, the `default` locality is used.

## Create a locality-aware backup

For example, to create a locality-aware backup where nodes with the locality `region=us-west` write backup files to `s3://us-west-bucket`, and all other nodes write to `s3://us-east-bucket` by default, run:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO
	  ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
~~~

You can restore the backup by running:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN ('s3://us-east-bucket', 's3://us-west-bucket');
~~~

Note that the first URI in the list has to be the URI specified as the `default` URI when the backup was created. If you have moved your backups to a different location since the backup was originally taken, the first URI must be the new location of the files originally written to the `default` location.

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`](restore.html#restore-a-specific-backup)

For guidance on how to identify the locality of a node to pass in a backup query, see [Show a node's locality](#show-a-nodes-locality).

{{site.data.alerts.callout_info}}
For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage](use-cloud-storage.html).
{{site.data.alerts.end}}

## Show a node's locality

To determine the locality that a node was started with, run [`SHOW LOCALITY`](show-locality.html):

{% include_cached copy-clipboard.html %}
~~~sql
SHOW LOCALITY;
~~~

~~~
	locality
+---------------------+
region=us-east,az=az1
(1 row)
~~~

The output shows the locality to which the node will write backup data. One of the single locality key-value pairs can be passed to `BACKUP` with the `COCKROACH_LOCALITY` parameter (e.g., `'s3://us-east-bucket?COCKROACH_LOCALITY=region%3Dus-east'`).

{{site.data.alerts.callout_info}}
Specifying both locality tier pairs (e.g., `region=us-east,az=az1`) from the output will cause the backup query to fail with: `tier must be in the form "key=value"`.
{{site.data.alerts.end}}

## Restore from a locality-aware backup

Given a list of URIs that together contain the locations of all of the files for a single [locality-aware backup](#create-a-locality-aware-backup), [`RESTORE`](restore.html) can read in that backup. Note that the list of URIs passed to [`RESTORE`](restore.html) may be different from the URIs originally passed to [`BACKUP`](backup.html). This is because it's possible to move the contents of one of the parts of a locality-aware backup (i.e., the files written to that destination) to a different location, or even to consolidate all the files for a locality-aware backup into a single location.

When restoring a [full backup](take-full-and-incremental-backups.html#full-backups), the cluster data is restored first, then the system table data "as is." This means that the restored zone configurations can point to regions that do not have active nodes in the new cluster. For example, if your full backup has the following [zone configurations](alter-partition.html#create-a-replication-zone-for-a-partition):

~~~ sql
ALTER PARTITION europe_west OF INDEX movr.public.rides@rides_pkey \
		CONFIGURE ZONE USING constraints = '[+region=europe-west1]';

ALTER PARTITION us_east OF INDEX movr.public.rides@rides_pkey \
		CONFIGURE ZONE USING constraints = '[+region=us-east1]';

ALTER PARTITION us_west OF INDEX movr.public.rides@rides_pkey \
		CONFIGURE ZONE USING constraints = '[+region=us-west1]';
~~~

And the restored cluster does not have [nodes with the locality](partitioning.html#node-attributes) `region=us-west1`, the restored cluster will still have a zone configuration for `us-west1`. This means that the cluster's data will **not** be reshuffled to `us-west1` because the region does not exist. The data will be distributed as if the zone configuration does not exist. For the data to be distributed correctly, you can [add node(s)](cockroach-start.html) with the missing region or [remove the zone configuration](configure-replication-zones.html#remove-a-replication-zone).

For example, use the following to create a locality-aware backup:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO
	  ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west')
~~~

Restore a locality-aware backup with:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN ('s3://us-east-bucket/', 's3://us-west-bucket/');
~~~

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`](restore.html#restore-a-specific-backup).

{{site.data.alerts.callout_info}}
[`RESTORE`](restore.html) is not truly locality-aware; while restoring from backups, a node may read from a store that does not match its locality. This can happen in the cases that either the [`BACKUP`](backup.html) or [`RESTORE`](restore.html) was not of a [full cluster](take-full-and-incremental-backups.html#full-backups). Note that during a locality-aware restore, some data may be temporarily located on another node before it is eventually relocated to the appropriate node. To avoid this, you can [manually restore zone configurations from a locality-aware backup](#manually-restore-zone-configurations-from-a-locality-aware-backup).
{{site.data.alerts.end}}

## Create an incremental locality-aware backup

If you backup to a destination already containing a [full backup](take-full-and-incremental-backups.html#full-backups), an [incremental backup](take-full-and-incremental-backups.html#incremental-backups) will be appended to the full backup in a subdirectory. When you're taking an incremental backup, you must ensure that the incremental backup localities match the full backup localities otherwise you will receive an error. Alternatively, take another full backup with the matching localities before running the incremental backup. 

There is different syntax for taking an incremental backup depending on where you need to store the backups:

- To append your incremental backup to the full backup in the [`incrementals` directory](take-full-and-incremental-backups.html#backup-collections):

	{% include_cached copy-clipboard.html %}
	~~~ sql
	BACKUP INTO LATEST IN
		('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
	~~~

	{{site.data.alerts.callout_info}}
	When [restoring from an incremental locality-aware backup](#restore-from-an-incremental-locality-aware-backup), you need to include **every** locality ever used, even if it was only used once. At least one `COCKROACH_LOCALITY` must be the `default`.
	{{site.data.alerts.end}}

- To explicitly control the subdirectory for your incremental backup:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	BACKUP INTO {subdirectory} IN
			('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
	~~~

	To view the available subdirectories, use [`SHOW BACKUPS`](restore.html#view-the-backup-subdirectories).

- To append your incremental backup to the full backup using the [`incremental_location`](backup.html#options) option to send your incremental backups to a different location, you must include the same number of locality-aware URIs for the full backup destination and the `incremental_location` option:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	BACKUP INTO LATEST IN
		('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west') WITH incremental_location = ('s3://us-east-bucket-2?COCKROACH_LOCALITY=default', 's3://us-west-bucket-2?COCKROACH_LOCALITY=region%3Dus-west');
	~~~

	For more detail on using the `incremental_location` option, see [Incremental backups with explicitly specified destinations](take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations).

## Restore from an incremental locality-aware backup

A locality-aware backup URI can also be used in place of any incremental backup URI in [`RESTORE`](restore.html).

For example, an incremental locality-aware backup created with

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO LATEST IN
	  ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west')
~~~

can be restored by running:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN ('s3://us-east-bucket/', 's3://us-west-bucket/');
~~~

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`](restore.html#restore-a-specific-backup).

{{site.data.alerts.callout_info}}
When [restoring from an incremental locality-aware backup](take-and-restore-locality-aware-backups.html#restore-from-an-incremental-locality-aware-backup), you need to include **every** locality ever used, even if it was only used once.
{{site.data.alerts.end}}

## Manually restore zone configurations from a locality-aware backup

During a [locality-aware restore](#restore-from-a-locality-aware-backup), some data may be temporarily located on another node before it is eventually relocated to the appropriate node. To avoid this, you need to manually restore [zone configurations](configure-replication-zones.html) first:

Once the locality-aware restore has started, [pause the restore](pause-job.html):

{% include_cached copy-clipboard.html %}
~~~ sql
PAUSE JOB 27536791415282;
~~~

The `system.zones` table stores your cluster's [zone configurations](configure-replication-zones.html), which will prevent the data from rebalancing. To restore them, you must restore the `system.zones` table into a new database because you cannot drop the existing `system.zones` table:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE TABLE system.zones FROM '2021/03/23-213101.37' IN
	'azure://acme-co-backup?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
	WITH into_db = 'newdb';
~~~

After it's restored into a new database, you can write the restored `zones` table data to the cluster's existing `system.zones` table:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO system.zones SELECT * FROM newdb.zones;
~~~

Then drop the temporary table you created:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TABLE newdb.zones;
~~~

Then, [resume the restore](resume-job.html):

{% include_cached copy-clipboard.html %}
~~~ sql
RESUME JOB 27536791415282;
~~~

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [`IMPORT`](migration-overview.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
