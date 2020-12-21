---
title: cockroach userfile list
summary: List the files stored in the user-scoped file storage.
toc: true
---

 The `cockroach userfile list` [command](cockroach-commands.html) lists the files stored in the [user-scoped file storage](use-userfile-for-bulk-operations.html) which match the [provided pattern](cockroach-userfile-upload.html#file-destination), using a SQL connection. If no pattern is provided, all files in the specified (or default, if unspecified) user scoped file storage will be listed.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the target database. CockroachDB will proactively grant the user `GRANT`, `SELECT`, `INSERT`, `DROP`, `DELETE` on the metadata and file tables.

A user can only view files in their own user-scoped storage, which is accessed through the [userfile URI](cockroach-userfile-upload.html#file-destination) used during the upload. CockroachDB will revoke all access from every other user in the cluster except users in the `admin` role.

## Synopsis

View files:

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
`--cert-principal-map` | A comma-separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--echo-sql`     | Reveal the SQL statements sent implicitly by the command-line utility.
`--url`          | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### List all files in the default storage

If the file or directory is not specified, all files in the default user-scoped storage (`userfile://defaultdb.public.userfiles_$user/`) will be listed:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile list --certs-dir=certs
~~~

~~~
userfile://defaultdb.public.userfiles_root/test-data-2.csv
userfile://defaultdb.public.userfiles_root/test-data.csv
userfile://defaultdb.public.userfiles_root/test-upload/test-data.csv
~~~

### List a specific file

To list all files in a specified directory:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile list test-data.csv --certs-dir=certs
~~~

~~~
userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

### List files that match the provided pattern

To list all files that match a pattern, use `*`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile list '*.csv' --certs-dir=certs
~~~

~~~
userfile://defaultdb.public.userfiles_root/test-data-2.csv
userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

### List files from a non-default userfile URI

If you [uploaded a file to a non-default userfile URI](cockroach-userfile-upload.html#upload-a-file-to-a-non-default-userfile-uri) (e.g., `userfile://testdb.public.uploads`):

{% include copy-clipboard.html %}
~~~ shell
cockroach userfile upload /Users/maxroach/Desktop/test-data.csv userfile://testdb.public.uploads/test-data.csv
~~~

Use the same URI to view it:

{% include copy-clipboard.html %}
~~~ shell
cockroach userfile list userfile://testdb.public.uploads
~~~

## See also

- [`cockroach userfile upload`](cockroach-userfile-upload.html)
- [`cockroach userfile delete`](cockroach-userfile-delete.html)
- [Use `userfile` for Bulk Operations](use-userfile-for-bulk-operations.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
