---
title: cockroach userfile delete
summary: Delete a file to the user-scoped file storage.
toc: true
---

<span class="version-tag">New in v20.2:</span> The `cockroach userfile delete` [command](cockroach-commands.html) deletes the files stored in the [user-scoped file storage](use-user-scoped-storage-for-bulk-operations.html) which match the provided pattern, using a SQL connection. If passed the pattern `'*'`, all files in the specified (or default, if unspecified) user-scoped file storage will be deleted. Deletions are not atomic, and all deletions prior to the first failure will occur.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the target database. CockroachD will proactively grant the user `GRANT`, `SELECT`, `INSERT`, `DROP`, `DELETE` on the metadata and file tables. Each user can only access the subdirectory with the name matching their username.

## Synopsis

Upload a file:

~~~ shell
$ cockroach userfile list <file | dir> [flags]
~~~

View help:

~~~ shell
$ cockroach userfile list --help
~~~

## Flags

 Flag            | Description
-----------------+-----------------------------------------------------
`--cert-principal-map` | A comma separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--echo-sql`     | Reveal the SQL statements sent implicitly by the command-line utility.
`--url`          | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### Delete all files in the default storage

To delete all files in the directory, pass the `'*'` pattern:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile delete '*' --certs-dir=certs
~~~

~~~
deleted userfile://defaultdb.public.userfiles_root/test-data-2.csv
deleted userfile://defaultdb.public.userfiles_root/test-data.csv
deleted userfile://defaultdb.public.userfiles_root/test-upload/test-data.csv
~~~

Note that because the directory was not specified, files in the default user-scoped storage (`userfile://defaultdb.public.userfiles_$user/`) were deleted.

### Delete a specific file

To delete a specific file, include the file destination in the command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile delete test-data.csv --certs-dir=certs
~~~

~~~
deleted userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

### Delete files that match the provided pattern

To delete all files that match a pattern, use `*`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile delete *.csv --certs-dir=certs
~~~

~~~
deleted userfile://defaultdb.public.userfiles_root/test-data-2.csv
deleted userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

## See also

- [`cockroach userfile upload`](cockroach-userfile-upload.html)
- [`cockroach userfile list`](cockroach-userfile-list.html)
- [Use `userfile` for Bulk Operations](use-userfile-storage-for-bulk-operations.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
