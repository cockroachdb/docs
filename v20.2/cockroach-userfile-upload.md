---
title: cockroach userfile upload
summary: Upload a file to the user-scoped file storage.
toc: true
---

<span class="version-tag">New in v20.2:</span> The `cockroach userfile upload` [command](cockroach-commands.html) uploads a file to the [user-scoped file storage](use-user-scoped-storage-for-bulk-operations.html) using a SQL connection.

This command takes in a source file to upload and a destination filename. It will then use a SQL connection to upload the file to the [destination](#file-destination)

{{site.data.alerts.callout_note}}
Userfile uses storage space in the cluster, and is replicated with the rest of the cluster's data. We recommended using `cockroach userfile upload` for quick imports from your client (about 15MB or smaller).
{{site.data.alerts.end}}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the target database. CockroachD will proactively grant the user `GRANT`, `SELECT`, `INSERT`, `DROP`, `DELETE` on the metadata and file tables. Each user can only access the subdirectory with the name matching their username.

## Synopsis

Upload a file:

~~~ shell
$ cockroach userfile upload <location/of/file> <destination/of/file> [flags]
~~~

{{site.data.alerts.callout_note}}
You must specify a source path.
{{site.data.alerts.end}}

View help:

~~~ shell
$ cockroach userfile upload --help
~~~

## File destination

When an file is uploaded to userfile, there are two tables created: `files` and `payload`. The default URI is `userfile://defaultdb.public.userfiles_$user/`.

- If you do not specify a destination URI/path, then CockroachDB will use the default URI scheme and host, and the basename from the source argument as the path.

    For example, if the `root` user runs `cockroach userfile upload /path/to/local`, CockroachDB will write a file named `/local` in the `userfile` tables created in the `defaultdb` database, `public` schema, and with a table with the default prefix: `userfile://defaultdb.public.userfiles_root/local`

- If the destination is a well-formed userfile URI (i.e., `userfile://db.schema.tablename_prefix/path/to/file`), then CockroachDB use use that as the final URI.

    For example, if the `root` user runs `cockroach userfile upload /path/to/local  userfile://foo.bar.baz/destination/path`, CockroachDB will write a file named `/destination/path` in the `userfile` tables created in the `foo` database, `bar` schema, and with table prefix `baz` + `root`: `userfile://foo.bar.baz_root/destination/path`

- If destination is not a well-formed userfile URI, then CockroachDB will use the default userfile URI schema and host (`userfile://defaultdb.public.userfiles_$user/`), and the destination as the path.

    For example, if the `root` user runs `cockroach userfile upload /path/to/local /destination/path` will write a file named `/destination/path` in the `userfile` tables created in the `defaultdb` database, `public` schema, and with a table with the default prefix: `userfile://defaultdb.public.userfiles_root/destination/path`

Note that:

- All destination paths must start with `/`.
- Destination paths cannot contain `..`.

{{site.data.alerts.callout_danger}}
Userfile is **not** a filesystem and does not support filesystem semantics. The destination string is taken as-is, and CockroachDB will use that as a file name.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Files are uploaded with a `.tmp` suffix and are renamed once the userfile upload transaction has committed (i.e, the process ends gracefully). Therefore, a file with a `.tmp` prefix indicates that the upload may have only partially succeeded, and that the upload should be retried.
{{site.data.alerts.end}}

## Flags

 Flag            | Description
-----------------+-----------------------------------------------------
`--cert-principal-map` | A comma separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--echo-sql`     | Reveal the SQL statements sent implicitly by the command-line utility.
`--url`          | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### Upload a file

To upload a file to the default storage (`userfile://defaultdb.public.userfiles_$user/`):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data.csv /test-data.csv --certs-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

Also, a file can be uploaded to to the default storage if the destination is not specified:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data2.csv --certs-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-data2.csv
~~~

Then, you can use the file to [`IMPORT`](import.html) or [`IMPORT INTO`](import-into.html) data.

### Upload a file to a specific directory

To upload a file to a specific destination, include the destination in the command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data.csv /test-upload/test-data.csv --cert-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-upload/test-data.csv
~~~

Then, you can use the file to [`IMPORT`](import.html) or [`IMPORT INTO`](import-into.html) data.

### Upload a file to a non-default userfile URI

{% include copy-clipboard.html %}
~~~ shell
cockroach userfile upload /Users/maxroach/Desktop/test-data.csv userfile://testdb.public.uploads/test-data.csv
~~~

~~~
successfully uploaded to userfile://testdb.public.uploads/test-data.csv
~~~

## See also

- [`cockroach userfile list`](cockroach-userfile-list.html)
- [`cockroach userfile delete`](cockroach-userfile-delete.html)
- [Use `userfile` for Bulk Operations](use-user-scoped-storage-for-bulk-operations.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
