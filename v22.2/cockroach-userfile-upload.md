---
title: cockroach userfile upload
summary: The cockroach userfile upload command uploads a file to user-scoped file storage.
toc: true
docs_area: reference.cli
---

 The `cockroach userfile upload` [command](cockroach-commands.html) uploads a file to the [user-scoped file storage](use-userfile.html) using a SQL connection.

This command takes in a source file to upload and a destination filename. It will then use a SQL connection to upload the file to the [destination](#file-destination).

{{site.data.alerts.callout_info}}
A userfile uses storage space in the cluster, and is replicated with the rest of the cluster's data. We recommended using `cockroach userfile upload` for quick uploads from your client (about 15MB or smaller).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
If you would like to upload and import data from a dump file, consider using [`cockroach import`](cockroach-import.html) instead.
{{site.data.alerts.end}}

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the target database. CockroachDB will proactively grant the user `GRANT`, `SELECT`, `INSERT`, `DROP`, `DELETE` on the metadata and file tables.

A user can only upload files to their own user-scoped storage, which is accessed through the [userfile URI](#file-destination). CockroachDB will revoke all access from every other user in the cluster except users in the `admin` role.

## Synopsis

Upload a file:

~~~ shell
$ cockroach userfile upload <location/of/file> <destination/of/file> [flags]
~~~

Upload a directory recursively:

~~~ shell
cockroach userfile upload --recursive <location/of/dir> <destination/of/file> [flags]
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
`--recursive`<br>`-r` |  Upload a directory and its contents rooted at a specified directory recursively to user-scoped file storage. For example: `cockroach userfile upload -r <location/of/file> <userfile destination/of/file>` <br><br> See [File Destination](#file-destination) for detail on forming the destination URI and this [usage example](#upload-a-directory-recursively) for working with the `--recursive` flag.

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

### Upload a directory recursively

 To upload the contents of a directory to userfile storage, specify a source directory and destination. For example, to upload a [backup](backup.html) directory to userfile storage:

~~~ shell
cockroach userfile upload -r /Users/maxroach/movr-backup userfile:///backup-data --certs-dir=certs
~~~

~~~
uploading: BACKUP-CHECKPOINT-698053706999726081-CHECKSUM
successfully uploaded to userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/BACKUP-CHECKPOINT-698053706999726081-CHECKSUM
uploading: BACKUP-CHECKPOINT-CHECKSUM
successfully uploaded to userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/BACKUP-CHECKPOINT-CHECKSUM
uploading: BACKUP-STATISTICS
successfully uploaded to userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/BACKUP-STATISTICS
uploading: BACKUP_MANIFEST
successfully uploaded to userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/BACKUP_MANIFEST
uploading: BACKUP_MANIFEST-CHECKSUM
successfully uploaded to userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/BACKUP_MANIFEST-CHECKSUM
uploading: data/698053715875692545.sst
successfully uploaded to userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/data/698053715875692545.sst
uploading: data/698053717178744833.sst
successfully uploaded to userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/data/698053717178744833.sst
. . .
~~~

When the source directory does not have a trailing slash, the last element of the source path will be appended to the destination path. In this example the source path `/Users/maxroach/movr-backup` does not have a trailing slash, as a result `movr-backup` appends to the destination path—originally `userfile:///backup-data`—to become `userfile://defaultdb.public.userfiles_root/backup-data/movr-backup/`.

It is important to note that userfile is **not** a filesystem and does not support filesystem semantics. The destination file path must be the same after normalization (i.e., if you pass any path that results in a different path after normalization, it will be rejected).

See the [file destination](#file-destination) section for more detail on forming userfile URIs.

### Upload a file to a non-default userfile URI

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach userfile upload /Users/maxroach/Desktop/test-data.csv userfile://testdb.public.uploads/test-data.csv
~~~

~~~
successfully uploaded to userfile://testdb.public.uploads/test-data.csv
~~~

## See also

- [`cockroach userfile list`](cockroach-userfile-list.html)
- [`cockroach userfile delete`](cockroach-userfile-delete.html)
- [`cockroach userfile get`](cockroach-userfile-get.html)
- [Use `userfile`](use-userfile.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
