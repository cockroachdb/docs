---
title: cockroach userfile get
summary: Fetch files stored in the user-scoped file storage.
toc: true
docs_area: reference.cli
---

 The `cockroach userfile get` [command]({% link {{ page.version.version }}/cockroach-commands.md %}) fetches the files stored in the [user-scoped file storage]({% link {{ page.version.version }}/use-userfile-storage.md %}) which match the provided pattern, using a SQL connection. If no pattern is provided, all files in the specified (or default, if unspecified) user-scoped file storage will be fetched.

## Required privileges

The user must have `CONNECT` [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the target database.

A user can only fetch files from their own user-scoped storage, which is accessed through the [userfile URI]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}#file-destination) used during the upload. CockroachDB will revoke all access from every other user in the cluster except users in the `admin` role and users explicitly granted access.

{{site.data.alerts.callout_info}}
If this is your first interaction with user-scoped file storage, you may see an error indicating that you need `CREATE` privileges on the database. You must first [upload a file]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}) or run a [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) to `userfile` before attempting to `get` a file.
{{site.data.alerts.end}}

## Synopsis

Fetch a file:

~~~ shell
$ cockroach userfile get <file> [flags]
~~~

View help:

~~~ shell
$ cockroach userfile get --help
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

### Get a specific file

To get the file named test-data.csv from the default user-scoped storage location for the current user:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile get test-data.csv --certs-dir=certs
~~~

### Get a file saved to an explicit local file name

To get a file named test-data.csv from a local directory:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile get test-data.csv /Users/maxroach/Desktop/test-data.csv --certs-dir=certs
~~~

### Get a file from a non-default userfile URI

If you [uploaded a file to a non-default userfile URI]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}#upload-a-file-to-a-non-default-userfile-uri) (e.g., `userfile://testdb.public.uploads`), use the same URI to fetch it:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach userfile get userfile://testdb.public.uploads/test-data.csv --certs-dir=certs
~~~

### Get files that match the provided pattern

To get all files that match a pattern, use *:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile get '*.csv' --certs-dir=certs
~~~

## See also

- [`cockroach userfile upload`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %})
- [`cockroach userfile delete`]({% link {{ page.version.version }}/cockroach-userfile-delete.md %})
- [`cockroach userfile list`]({% link {{ page.version.version }}/cockroach-userfile-list.md %})
- [Use `userfile` storage]({% link {{ page.version.version }}/use-userfile-storage.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
