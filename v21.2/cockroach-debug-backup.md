---
title: cockroach debug backup
summary: Display backup metadata outside of the sql shell and perform other backup inspection tasks.
toc: true
---

{{site.data.alerts.danger}}
**This is a beta feature.** It is currently undergoing continued testing. Please [file a Github issue](https://www.cockroachlabs.com/docs/stable/file-an-issue.html) with us if you identify a bug.
{{site.data.alerts.end}}

<span class="version-tag">New in v21.2:</span> The `cockroach debug backup` command provides a tool for inspecting a [backup's](take-full-and-incremental-backups.html) metadata and loading single backup files outside of the SQL shell for debugging purposes. With `cockroach debug backup` you can do the following without an active cluster:

- List backups in a collection and incremental backups in a specific storage location.
- Combine the command with the `--as-of` flag to review historical data at a specific timestamp.
- Validate and verify backups without having to complete a restore.
- Export table data from a backup in CSV format.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/debug-subcommands.md %}
{{site.data.alerts.end}}

## Synopsis

Use the [subcommands](#subcommands) followed by your storage location to inspect your backups:

~~~shell
cockroach debug backup {command} {location}
~~~

Use the `cockroach debug backup` [flags](#flags) to modify the output from the command:

~~~shell
cockroach debug backup {command} {location} {flag}
~~~

See [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html#example-file-urls) for example file URLs.

{{site.data.alerts.callout_info}}
`cockroach debug backup` does not support access to [encrypted backups](take-and-restore-encrypted-backups.html). See [Known Limitations](#known-limitations) for more details.
{{site.data.alerts.end}}

## Subcommands

The `cockroach debug backup` command uses the following subcommands to inspect backups offline:

Flag | Description
-----|-----------
`show` | Show a backup summary. See the [Show a backup summary](#show-a-backup-summary) example for more detail on the output provided with `show`.
`list-backups` | List the backups in a collection in your storage location. See [List a backup collection](#list-a-backup-collection) for usage.
`list-incremental` | List the [incremental backups](take-full-and-incremental-backups.html#incremental-backups) in your storage location.
<a name="export-sub"></a>`export` | Export table data from a backup. See [Export backup table data](#export-backup-table-data) for usage. **Note**: CSV data is the only exportable format.

## Flags

Flag | Description
-----|-----------
`--as-of` | Use with the [`export`](#export-sub) subcommand to read the data as of the specified timestamp, for example `--as-of='2021-09-24T15:15:32Z'`. See the [`TIMESTAMP`](timestamp.html) type for supported formats.
<a name="destination-flag"></a>`--destination` | Use with the [`export`](#export-sub) subcommand to specify a destination to export data to. Note that if the `export` format is readable and the `--desination` flag is not specified, `export` defaults to display the data in the terminal output.
`--external-io-dir` | Specify the file path of the external IO directory to which the `nodelocal` file paths resolve. The `external-io-dir` is the path that remotely initiated operations such as `BACKUP`, `RESTORE`, or `IMPORT` can access. <br></br>For example, to view data outputted to the `external-io-dir`, you could use: <br>`cockroach debug backup export {backup_location} --destination="nodelocal://{node_id}/backup_inspect" --external-io-dir="{location for nodelocal to write}"`. <br>Here, `--external-io-dir` will configure which [directory or NFS drive](use-cloud-storage-for-bulk-operations.html#nfs-local) the data will be written to, and `--destination` determines where in the external IO directory the data will be written. <br></br> See the [`external-io-dir` option at cluster startup](cockroach-start.html#flags-external-io-dir) for further detail on setup.
`-h`, `--help` | Display help text for the `debug backup {command}`.
`--max-rows` | Use with the [`export`](#export-sub) subcommand to set the maximum number of rows to return. Default: `0` (unlimited rows)
`--nullas` | Use with the [`export`](#export-sub) subcommand to set the string that should be used to represent `NULL` values. Default: `NULL`
`--start-key` | Use with the [`export`](#export-sub) subcommand to set the start key and its format as `<format>:<key>`. Supported formats: `raw,` `hex`, `bytekey`.  The `raw` format supports escaped text. For example, `raw:\x01k` is the prefix for range local keys. The `bytekey` format does not require the table-key prefix. See [known limitations](#known-limitations) for more details.
<a name="table-flag"></a>`--table` | **Required** when using the [`export`](#export-sub) subcommand to specify the backup table to export from. The fully qualified table name must be passed here. For example: `--table=database.schema.table`.
`--up-to` | [Export](#export-sub) revisions of data from a backup table up to a specific timestamp.
`--with-revisions` | [Export](#export-sub) revisions of data from a backup table since the last schema change.

## Examples

{{site.data.alerts.callout_info}}
The following examples use a connection string to Amazon S3 cloud storage for demonstration. For guidance on connecting to other storage options or using alternative authentication parameters, read [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html).
{{site.data.alerts.end}}

### Show a backup summary

To review a summary of a specific backup, you can run the following `show` command with the storage location of your backup and its path (in this case `/2021/09/24-151532.23`):

~~~shell
cockroach debug backup show 's3://cockroach-bucket/2021/09/24-151532.23?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
~~~

You'll receive a summary of the backup in JSON format that can be used for debugging. This includes information about the cluster from which the backup was taken, metadata about the data files within the backup, the schema, and tables within the database:

~~~
{
	"StartTime": "1970-01-01T00:00:00Z",
	"EndTime": "2021-09-24T15:15:32Z",
	"DataSize": "1.1 MiB",
	"Rows": 11778,
	"IndexEntries": 1776,
	"FormatVersion": 1,
	"ClusterID": "1005bac4-87bf-432c-aa54-ec59627bb4ae",
	"NodeID": 0,
	"BuildInfo": "CockroachDB CCL v21.2.0-alpha.00000000-4456-g6994559251 (x86_64-unknown-linux-gnu, built 2021/09/24 10:42:46, go1.16.6)",
	"Files": [
		{
			"Path": "data/696077958550355969.sst",
			"Span": "/Table/53/1{-/\"amsterdam\"/\"\\xb333333@\\x00\\x80\\x00\\x00\\x00\\x00\\x00\\x00#\"}",
			"DataSize": "2.0 KiB",
			"IndexEntries": 0,
			"Rows": 23
		},
		{
			"Path": "data/696077958545408002.sst",
			"Span": "/Table/53/1/\"{amsterdam\"/\"\\xb333333@\\x00\\x80\\x00\\x00\\x00\\x00\\x00\\x00#\"-boston\"/\"333333D\\x00\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\n\"}",
			"DataSize": "2.5 KiB",
			"IndexEntries": 0,
			"Rows": 28
		},

. . .

	],
	"Spans": "[/Table/53/{1-2} /Table/54/{1-3} /Table/55/{1-4} /Table/56/{1-2} /Table/57/{1-2} /Table/58/{1-2}]",
	"DatabaseDescriptors": {
		"52": "movr"
	},
	"TableDescriptors": {
		"53": "movr.public.users",
		"54": "movr.public.vehicles",
		"55": "movr.public.rides",
		"56": "movr.public.vehicle_location_histories",
		"57": "movr.public.promo_codes",
		"58": "movr.public.user_promo_codes"
	},
	"TypeDescriptors": {},
	"SchemaDescriptors": {
		"29": "public"
	}
}
~~~

### List a backup collection

To review all full (and incremental) backups in your storage location, use `list-backups` with the path to your backup collection:

~~~shell
cockroach debug backup list-backups 's3://cockroach-bucket/backup-path?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
~~~

You'll receive output listing the backup paths by timestamp:

~~~
path
./2021/09/24-161940.44
./2021/09/24-162033.59
~~~

### Export backup table data

Use the `export` subcommand to review backup table data from the command line. The [`--table`](#table-flag) flag is required to define the table for export:

~~~shell
cockroach debug backup export 's3://cockroach-bucket/2021/09/24-151532.23?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' --table=movr.public.users
~~~

Without using the [`--destination`](#destination-flag) flag to specify a file for the data, you'll receive the table data on the command line in CSV format:

~~~
'0781e581-40e2-4ae7-b436-0449fdc139fc','amsterdam','Michael Jimenez','13579 Campbell Camp','9453598890'
'0f7da338-2bd9-4033-be4c-8523e175a1ab','amsterdam','Kyle Galvan','20606 Cheryl Field','5213315177'
'11569226-48f7-49d8-9d49-326fa905aa37','amsterdam','Rebecca Maxwell','11907 Stephen Union','3580898555'
'15175e67-51d7-48ec-b5e4-057c146d03dd','amsterdam','Daniel Turner','37387 Angel Point','1114454946'
'1aeb46c6-9665-4539-b368-3bb7089d3d8f','amsterdam','Tracy Kirby','83883 Rasmussen Parkways','8046889122'
'27ffe621-4956-4e0a-89d3-762b816bf242','amsterdam','Robert Williams','93464 Gabriel Village','5231692453'
'2b79917e-4b5b-4c33-b239-0b4838b3d082','amsterdam','Matthew Gordon','69574 Tricia Alley','6188820427'
'35af4a5b-8c61-452b-a963-771e2d3d3a2f','amsterdam','Lisa Sandoval','77153 Donald Road Apt. 62','7531160744'
'393f7a3b-6260-421d-a765-a56685e2f5f7','amsterdam','Ashley Bailey','67445 James Centers','8750129902'
'39625926-2f65-4696-97fc-a2730bfd476d','amsterdam','Alexis Shelton','60376 Jordan Walk','0202218241'
'48cfd73a-6c04-446b-be03-f99b237176fc','amsterdam','Emily Baldwin','34649 Cody Mountain','9083704248'
'599371b8-fd87-4f62-80c1-e086c5266e45','amsterdam','Carolyn Bell','34392 Timothy Squares Suite 84','5215261260'
'5b024ced-9d89-4ad1-a6e5-3ad35334aa55','amsterdam','Jennifer Davis','31952 Joshua Glen Suite 8','4350108331'
. . .
~~~

## Known limitations

{% include {{ page.version.version }}/backups/cockroach-debug-backup.md %}

## See also

- [`BACKUP`](backup.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [`SHOW BACKUP`](show-backup.html)
- [Cockroach Commands](cockroach-commands.html)
- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
