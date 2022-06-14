---
title: cockroach userfile upload
summary: The cockroach userfile upload command uploads a file to user-scoped file storage.
toc: true
---

 The `cockroach userfile upload` [command](cockroach-commands.html) uploads a file to the [user-scoped file storage](use-userfile-for-bulk-operations.html) using a SQL connection.

This command takes in a source file to upload and a destination filename. It will then use a SQL connection to upload the file to the [destination](#file-destination).

{{site.data.alerts.callout_info}}
A userfile uses storage space in the cluster, and is replicated with the rest of the cluster's data. We recommended using `cockroach userfile upload` for quick uploads from your client (about 15MB or smaller).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
If you would like to upload and import data from a dump file, consider using [`cockroach import`](cockroach-import.html) instead.
{{site.data.alerts.end}}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the target database. CockroachDB will proactively grant the user `GRANT`, `SELECT`, `INSERT`, `DROP`, `DELETE` on the metadata and file tables.

A user can only upload files to their own user-scoped storage, which is accessed through the [userfile URI](#file-destination). CockroachDB will revoke all access from every other user in the cluster except users in the `admin` role.

## Synopsis

Upload a file:

~~~ shell
$ cockroach userfile upload <location/of/file> <destination/of/file> [flags]
~~~

{{site.data.alerts.callout_info}}
You must specify a source path.
{{site.data.alerts.end}}

View help:

~~~ shell
$ cockroach userfile upload --help
~~~

## File destination

Userfile operations are backed by two tables: `files` (which holds file metadata) and `payload` (which holds the file payloads). To reference these tables, you can:

- Use the default URI: `userfile://defaultdb.public.userfiles_$user/`.
- Provide a fully qualified userfile URI that specifies the database, schema, and table name prefix you want to use.

    - If you do not specify a destination URI/path, then CockroachDB will use the default URI scheme and host, and the basename from the source argument as the path. For example: `userfile://defaultdb.public.userfiles_root/local`
    - If the destination is a well-formed userfile URI (i.e., `userfile://db.schema.tablename_prefix/path/to/file`), then CockroachDB will use that as the final URI. For example: `userfile://foo.bar.baz_root/destination/path`
    - If destination is not a well-formed userfile URI, then CockroachDB will use the default userfile URI schema and host (`userfile://defaultdb.public.userfiles_$user/`), and the destination as the path. For example: `userfile://defaultdb.public.userfiles_root/destination/path`



{{site.data.alerts.callout_danger}}
Userfile is **not** a filesystem and does not support filesystem semantics. The destination file path must be the same after normalization (i.e., if you pass any path that results in a different path after normalization, it will be rejected).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Files are uploaded with a `.tmp` suffix and are renamed once the userfile upload transaction has committed (i.e, the process ends gracefully). Therefore, if a file you believed had finished uploading has a `.tmp` suffix, then the upload should be retried.
{{site.data.alerts.end}}

## Flags

 Flag            | Description
-----------------+-----------------------------------------------------
`--cert-principal-map` | A comma-separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--echo-sql`     | Reveal the SQL statements sent implicitly by the command-line utility.
`--url`          | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### Upload a file

To upload a file to the default storage (`userfile://defaultdb.public.userfiles_$user/`):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data.csv /test-data.csv --certs-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

Also, a file can be uploaded to the default storage if the destination is not specified:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data2.csv --certs-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-data2.csv
~~~

Then, you can use the file to [`IMPORT`](import.html) or [`IMPORT INTO`](import-into.html) data.

### Upload a file to a specific directory

To upload a file to a specific destination, include the destination in the command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data.csv /test-upload/test-data.csv --cert-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-upload/test-data.csv
~~~

Then, you can use the file to [`IMPORT`](import.html) or [`IMPORT INTO`](import-into.html) data.

### Upload a file to a non-default userfile URI

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach userfile upload /Users/maxroach/Desktop/test-data.csv userfile://testdb.public.uploads/test-data.csv
~~~

~~~
successfully uploaded to userfile://testdb.public.uploads/test-data.csv
~~~

### Upload a backup directory recursively

Currently in v21.1 and prior, it's [not possible to use `cockroach userfile upload` recursively](#known-limitation) when uploading a directory of files. When you need to upload a directory (such as a backup) to `userfile` storage, it is possible to programmatically upload your files.

The following example uses `userfile` storage and its features to backup a database and then restore it to a cluster. This workflow provides a way to recover backup data when using `userfile` as your storage option.

{{site.data.alerts.callout_info}}
Only database and table-level backups are possible when using `userfile` as storage. Restoring [cluster-level backups](backup.html#backup-a-cluster) will not work because `userfile` data is stored in the `defaultdb` database, and you cannot restore a cluster with existing table data.
{{site.data.alerts.end}}

After connecting to the cluster that contains the data you would like to backup, run the [`BACKUP`](backup.html) statement:

~~~sql
BACKUP DATABASE movr TO 'userfile://defaultdb.public.userfiles_$user/database-backup' AS OF SYSTEM TIME '-10s';
~~~

This will make a backup of the database under `database-backup` in the default `userfile` space.

~~~
job_id             |  status   | fraction_completed | rows | index_entries | bytes
-------------------+-----------+--------------------+------+---------------+---------
679645548255936513 | succeeded |                  1 | 2997 |          1060 | 492713
(1 row)
~~~

Next, on the command line, use the following [`cockroach userfile get`](cockroach-userfile-get.html) command to fetch the files stored in the `userfile` storage and download them to your local directory:

~~~shell
cockroach userfile get 'userfile://defaultdb.public.userfiles_$user/database-backup' --url {CONNECTION STRING}
~~~

Note that without passing a specific directory this command will fetch all files stored within the default user space in `userfile`.

The output will show the files downloading:

~~~
downloaded database-backup/BACKUP-CHECKPOINT-679645548255936513-CHECKSUM to database-backup/BACKUP-CHECKPOINT-679645548255936513-CHECKSUM (4 B)
downloaded database-backup/BACKUP-CHECKPOINT-CHECKSUM to database-backup/BACKUP-CHECKPOINT-CHECKSUM (4 B)
downloaded database-backup/BACKUP-STATISTICS to database-backup/BACKUP-STATISTICS (53 KiB)
downloaded database-backup/BACKUP_MANIFEST to database-backup/BACKUP_MANIFEST (2.6 KiB)
downloaded database-backup/BACKUP_MANIFEST-CHECKSUM to database-backup/BACKUP_MANIFEST-CHECKSUM (4 B)
downloaded database-backup/data/679645557047099393.sst to database-backup/data/679645557047099393.sst (5.8 KiB)
. . .
downloaded database-backup/data/679645558404448257.sst to database-backup/data/679645558404448257.sst (5.8 KiB)
downloaded database-backup/data/679645558408249345.sst to database-backup/data/679645558408249345.sst (41 KiB)
~~~

At this point, you have two copies of the data:

* One in the database's `userfile` storage
* One on your local machine

Your backup will contain files similar to the following structure:

~~~
database-backup/
├── BACKUP-CHECKPOINT-679645548255936513-CHECKSUM
├── BACKUP-CHECKPOINT-CHECKSUM
├── BACKUP-STATISTICS
├── BACKUP_MANIFEST
├── BACKUP_MANIFEST-CHECKSUM
└── data
    ├── 679645557047099393.sst
    ├── 679645557048475649.sst
    ├── 679645557048868865.sst
    ├── 679645558151741442.sst
. . .
~~~

Use [`DROP`](drop-database.html) to remove the `movr` database:

~~~sql
DROP DATABASE movr CASCADE;
~~~

Next, use [`cockroach userfile delete`](cockroach-userfile-delete.html) to remove this from `userfile`:

~~~shell
cockroach userfile delete 'userfile://defaultdb.public.userfiles_$user/database-backup' --url 'postgresql://root@localhost:26257?sslmode=disable'
~~~

~~~
successfully deleted database-backup/BACKUP-CHECKPOINT-679645548255936513-CHECKSUM
successfully deleted database-backup/BACKUP-CHECKPOINT-CHECKSUM
successfully deleted database-backup/BACKUP-STATISTICS
successfully deleted database-backup/BACKUP_MANIFEST
successfully deleted database-backup/BACKUP_MANIFEST-CHECKSUM
successfully deleted database-backup/data/679645557047099393.sst
. . .
successfully deleted database-backup/data/679645558154264579.sst
~~~

`cockroach userfile upload` will not recursively upload files from a directory. It is possible to programmatically upload your files from the command line.

For example, the following command finds all files under `database-backup` and runs `cockroach userfile upload` on each file:

~~~shell
find database-backup -type f | xargs -I{} cockroach userfile upload {} {} --url='postgresql://root@localhost:26257?sslmode=disable'
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/BACKUP_MANIFEST-CHECKSUM
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/BACKUP-CHECKPOINT-CHECKSUM
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/BACKUP-STATISTICS
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/BACKUP-CHECKPOINT-679678586269007873-CHECKSUM
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/BACKUP_MANIFEST
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/data/679678597597560835.sst
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/data/679678594426601474.sst
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/data/679678592925335554.sst
. . .
successfully uploaded to userfile://defaultdb.public.userfiles_root/database-backup/data/679678594438758403.sst
~~~

Now, with the backup files present in `userfile` storage, you can `RESTORE` the database to the cluster:

~~~sql
RESTORE DATABASE movr FROM 'userfile:///database-backup';
~~~

Note that `userfile:///` refers to the default path `userfile://defaultdb.public.userfiles_$user/`.

## Known limitation

{% include {{ page.version.version }}/known-limitations/userfile-upload-non-recursive.md %}

## See also

- [`cockroach userfile list`](cockroach-userfile-list.html)
- [`cockroach userfile delete`](cockroach-userfile-delete.html)
- [`cockroach userfile get`](cockroach-userfile-get.html)
- [Use `userfile` for Bulk Operations](use-userfile-for-bulk-operations.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
