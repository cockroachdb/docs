---
title: Take and Restore Locality-aware Backups
summary: Learn about the advanced options you can use when you backup and restore a CockroachDB cluster.
toc: true
docs_area: manage
---

Locality-aware backups allow you to partition and store backup data in a way that is optimized for locality. When you run a locality-aware backup, nodes write backup data to the [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) bucket that is closest to the node locality configured at [node startup]({% link {{ page.version.version }}/cockroach-start.md %}).

{{site.data.alerts.callout_danger}}
While a locality-aware backup will always match the node locality and storage bucket locality, a [range's]({% link {{ page.version.version }}/architecture/overview.md %}#range) locality will not necessarily match the node's locality. The backup job will attempt to back up ranges through nodes matching that range's locality, however this is not always possible. As a result, **Cockroach Labs cannot guarantee that all ranges will be backed up to a cloud storage bucket with the same locality.** You should consider this as you plan a backup strategy that must comply with [data domiciling]({% link {{ page.version.version }}/data-domiciling.md %}) requirements.
{{site.data.alerts.end}}

A locality-aware backup is specified by a list of URIs, each of which has a `COCKROACH_LOCALITY` URL parameter whose single value is either `default` or a single locality key-value pair such as `region=us-east`. At least one `COCKROACH_LOCALITY` must be the `default`. [Restore jobs can read from a locality-aware backup](#restore-from-a-locality-aware-backup) when you provide the list of URIs that together contain the locations of all of the files for a single locality-aware backup.

{% include {{ page.version.version }}/backups/locality-aware-access.md %}

## Technical overview

For a technical overview of how a locality-aware backup works, refer to [Job coordination and export of locality-aware backups]({% link {{ page.version.version }}/backup-architecture.md %}#job-coordination-and-export-of-locality-aware-backups).

## Supported products

Locality-aware backups are available in **CockroachDB {{ site.data.products.advanced }}**, **CockroachDB {{ site.data.products.standard }}**, **CockroachDB {{ site.data.products.basic }}**, and **CockroachDB {{ site.data.products.core }}** clusters when you are running [self-managed backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}). For a full list of features on CockroachDB Cloud, refer to [Backup and Restore Overview]({% link cockroachcloud/backup-and-restore-overview.md %}).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/backups/locality-aware-multi-tenant.md %}
{{site.data.alerts.end}}

CockroachDB also supports _locality-restricted backup execution_, which allows you to specify a set of locality filters for a backup job to restrict the nodes that can participate in the backup process to that locality. This allows only nodes to execute a backup that meet certain requirements, such as being located in a specific region or having access to a certain storage bucket. Refer to [Take Locality-restricted Backups]({% link {{ page.version.version }}/take-locality-restricted-backups.md %}) for more detail.

## Create a locality-aware backup

For example, to create a locality-aware backup where nodes with the locality `region=us-west` write backup files to `s3://us-west-bucket`, and all other nodes write to `s3://us-east-bucket` by default, run:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO
	  ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
~~~

When you run the `BACKUP` statement for a locality-aware backup, check the following:

- The locality query string parameters must be [URL-encoded](https://wikipedia.org/wiki/Percent-encoding).
- {% include {{ page.version.version }}/backups/cap-parameter-ext-connection.md %}
- {% include {{ page.version.version }}/backups/locality-aware-access.md %}

You can restore the backup by running:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN ('s3://us-east-bucket', 's3://us-west-bucket');
~~~

Note that the first URI in the list has to be the URI specified as the `default` URI when the backup was created. If you have moved your backups to a different location since the backup was originally taken, the first URI must be the new location of the files originally written to the `default` location.

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`]({% link {{ page.version.version }}/restore.md %}#restore-a-specific-full-or-incremental-backup)

For guidance on how to identify the locality of a node to pass in a backup query, see [Show a node's locality](#show-a-nodes-locality).

{{site.data.alerts.callout_info}}
For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}).
{{site.data.alerts.end}}

## Show a node's locality

To determine the locality that a node was started with, run [`SHOW LOCALITY`]({% link {{ page.version.version }}/show-locality.md %}):

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

## Show locality-aware backups

{% include {{ page.version.version }}/backups/locality-aware-backups.md %}

## Restore from a locality-aware backup

Given a list of URIs that together contain the locations of all of the files for a single [locality-aware backup](#create-a-locality-aware-backup), [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) can read in that backup. Note that the list of URIs passed to [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) may be different from the URIs originally passed to [`BACKUP`]({% link {{ page.version.version }}/backup.md %}). This is because it's possible to move the contents of one of the parts of a locality-aware backup (i.e., the files written to that destination) to a different location, or even to consolidate all the files for a locality-aware backup into a single location.

When restoring a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups), the cluster data is restored first, then the system table data "as is." This means that the restored  [zone configurations]({% link {{ page.version.version }}/alter-partition.md %}#create-a-replication-zone-for-a-partition) can point to regions that do not have active nodes in the new cluster. For example, if your full backup has the following zone configurations:

~~~ sql
ALTER PARTITION europe_west OF INDEX movr.public.rides@rides_pkey \
		CONFIGURE ZONE USING constraints = '[+region=europe-west1]';

ALTER PARTITION us_east OF INDEX movr.public.rides@rides_pkey \
		CONFIGURE ZONE USING constraints = '[+region=us-east1]';

ALTER PARTITION us_west OF INDEX movr.public.rides@rides_pkey \
		CONFIGURE ZONE USING constraints = '[+region=us-west1]';
~~~

And the restored cluster does not have [nodes with the locality]({% link {{ page.version.version }}/partitioning.md %}#node-attributes) `region=us-west1`, the restored cluster will still have a zone configuration for `us-west1`. This means that the cluster's data will **not** be reshuffled to `us-west1` because the region does not exist. The data will be distributed as if the zone configuration does not exist. For the data to be distributed correctly, you can [add node(s)]({% link {{ page.version.version }}/cockroach-start.md %}) with the missing region or [remove the zone configuration]({% link {{ page.version.version }}/configure-replication-zones.md %}#remove-a-replication-zone).

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

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`]({% link {{ page.version.version }}/restore.md %}#restore-a-specific-full-or-incremental-backup).

{{site.data.alerts.callout_info}}
[`RESTORE`]({% link {{ page.version.version }}/restore.md %}) is not truly locality-aware; while restoring from backups, a node may read from a store that does not match its locality. This can happen in the cases that either the [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) or [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) was not of a [full cluster]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups). Note that during a locality-aware restore, some data may be temporarily located on another node before it is eventually relocated to the appropriate node.
{{site.data.alerts.end}}

## Create an incremental locality-aware backup

If you back up to a destination already containing a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups), an [incremental backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups) will be appended to the full backup in a subdirectory. To take a locality-aware incremental backup and restore from it successfully, you must maintain the same storage URI to `COCKROACH_LOCALITY` query parameter mappings for all incrementals in the backup collection. Alternatively, take another full backup with the necessary storage URI to `COCKROACH_LOCALITY` mapping before running an incremental backup.

There is different syntax for taking an incremental backup depending on where you need to store the backups:

- To append your incremental backup to the full backup in the [`incrementals` directory]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections):

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

	To view the available subdirectories, use [`SHOW BACKUPS`]({% link {{ page.version.version }}/restore.md %}#view-the-backup-subdirectories).

- To append your incremental backup to the full backup using the [`incremental_location`]({% link {{ page.version.version }}/backup.md %}#options) option to send your incremental backups to a different location, you must include the same number of locality-aware URIs for the full backup destination and the `incremental_location` option:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	BACKUP INTO LATEST IN
		('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west') WITH incremental_location = ('s3://us-east-bucket-2?COCKROACH_LOCALITY=default', 's3://us-west-bucket-2?COCKROACH_LOCALITY=region%3Dus-west');
	~~~

	For more detail on using the `incremental_location` option, see [Incremental backups with explicitly specified destinations]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups-with-explicitly-specified-destinations).

	{% include common/sql/incremental-location-warning.md %}

## Restore from an incremental locality-aware backup

A locality-aware backup URI can also be used in place of any incremental backup URI in [`RESTORE`]({% link {{ page.version.version }}/restore.md %}).

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

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`]({% link {{ page.version.version }}/restore.md %}#restore-a-specific-full-or-incremental-backup).

{{site.data.alerts.callout_info}}
When [restoring from an incremental locality-aware backup]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}#restore-from-an-incremental-locality-aware-backup), you need to include **every** locality ever used, even if it was only used once.
{{site.data.alerts.end}}

## See also

- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Take and Restore Encrypted Backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %})
- [Take Backups with Revision History and Restore from a Point-in-time]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
