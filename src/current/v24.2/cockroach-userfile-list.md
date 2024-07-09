---
title: cockroach userfile list
summary: List the files stored in the user-scoped file storage.
toc: true
docs_area: reference.cli
---

 The `cockroach userfile list` [command]({% link {{ page.version.version }}/cockroach-commands.md %}) lists the files stored in the [user-scoped file storage]({% link {{ page.version.version }}/use-userfile-storage.md %}) which match the [provided pattern]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}#file-destination), using a SQL connection. If no pattern is provided, all files in the specified (or default, if unspecified) user scoped file storage will be listed.

## Required privileges

The user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the target database. CockroachDB will proactively grant the user `GRANT`, `SELECT`, `INSERT`, `DROP`, `DELETE` on the metadata and file tables.

A user can only view files in their own user-scoped storage, which is accessed through the [userfile URI]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}#file-destination) used during the upload. CockroachDB will revoke all access from every other user in the cluster except users in the `admin` role.

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
`--certs-dir`    | The path to the [certificate directory]({% link {{ page.version.version }}/cockroach-cert.md %}) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--echo-sql`     | Reveal the SQL statements sent implicitly by the command-line utility.
`--url`          | A [connection URL]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--user`<br>`-u` | The [SQL user]({% link {{ page.version.version }}/create-user.md %}) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### List all files in the default storage

If the file or directory is not specified, all files in the default user-scoped storage (`userfile://defaultdb.public.userfiles_$user/`) will be listed:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile list test-data.csv --certs-dir=certs
~~~

~~~
userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

### List files that match the provided pattern

To list all files that match a pattern, use `*`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile list '*.csv' --certs-dir=certs
~~~

~~~
userfile://defaultdb.public.userfiles_root/test-data-2.csv
userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

### List files from a non-default userfile URI

If you [uploaded a file to a non-default userfile URI]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}#upload-a-file-to-a-non-default-userfile-uri) (e.g., `userfile://testdb.public.uploads`):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach userfile upload /Users/maxroach/Desktop/test-data.csv userfile://testdb.public.uploads/test-data.csv
~~~

Use the same URI to view it:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach userfile list userfile://testdb.public.uploads
~~~

## See also

- [`cockroach userfile upload`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %})
- [`cockroach userfile delete`]({% link {{ page.version.version }}/cockroach-userfile-delete.md %})
- [`cockroach userfile get`]({% link {{ page.version.version }}/cockroach-userfile-get.md %})
- [Use `userfile` storage]({% link {{ page.version.version }}/use-userfile-storage.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
