---
title: cockroach userfile delete
summary: Delete a file to the user-scoped file storage.
toc: true
---

 The `cockroach userfile delete` [command](cockroach-commands.html) deletes the files stored in the [user-scoped file storage](use-userfile-for-bulk-operations.html) which match the [provided pattern](cockroach-userfile-upload.html#file-destination), using a SQL connection. If the pattern `'*'` is passed, all files in the specified (or default, if unspecified) user-scoped file storage will be deleted. Deletions are not atomic, and all deletions prior to the first failure will occur.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the target database. CockroachDB will proactively grant the user `GRANT`, `SELECT`, `INSERT`, `DROP`, `DELETE` on the metadata and file tables.

A user can only delete files from their own user-scoped storage, which is accessed through the [userfile URI](cockroach-userfile-upload.html#file-destination) used during the upload. CockroachDB will revoke all access from every other user in the cluster except users in the `admin` role. Users in the `admin` role can delete from any user's storage.

## Synopsis

Delete a file:

~~~ shell
$ cockroach userfile delete <file | dir> [flags]
~~~

View help:

~~~ shell
$ cockroach userfile delete --help
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

Note that because a fully qualified userfile URI was not specified, files in the default user-scoped storage (`userfile://defaultdb.public.userfiles_$user/`) were deleted.

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
$ cockroach userfile delete '*.csv' --certs-dir=certs
~~~

~~~
deleted userfile://defaultdb.public.userfiles_root/test-data-2.csv
deleted userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

### Delete files from a non-default userfile URI

If you [uploaded a file to a non-default userfile URI](cockroach-userfile-upload.html#upload-a-file-to-a-non-default-userfile-uri) (e.g., `userfile://testdb.public.uploads`):

{% include copy-clipboard.html %}
~~~ shell
cockroach userfile upload /Users/maxroach/Desktop/test-data.csv userfile://testdb.public.uploads/test-data.csv
~~~

Use the same URI to delete it:

{% include copy-clipboard.html %}
~~~ shell
cockroach userfile delete userfile://testdb.public.uploads
~~~

## See also

- [`cockroach userfile upload`](cockroach-userfile-upload.html)
- [`cockroach userfile list`](cockroach-userfile-list.html)
- [Use `userfile` for Bulk Operations](use-userfile-for-bulk-operations.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
