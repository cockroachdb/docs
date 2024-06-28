---
title: Use Userfile Storage
summary: Store data from CockroachDB operations in your cluster's userfile storage.
toc: true
key: use-userfile-for-bulk-operations.html
docs_area: manage
---

 To put files on your CockroachDB cluster without external servers, use `userfile`, a per-user file storage. To interact with `userfile`, use the following [commands]({% link {{ page.version.version }}/cockroach-commands.md %}):

- [`cockroach userfile upload`](#upload-a-file)
- [`cockroach userfile list`](#list-files)
- [`cockroach userfile get`](#get-files)
- [`cockroach userfile delete`](#delete-files)

Once a userfile is uploaded, you can run [`IMPORT`](#import-from-userfile).

 For `PGDUMP` and `MYSQLDUMP` formats, you can use [`cockroach import`](#upload-and-import-from-a-dump-file) to upload a userfile, import its data, and delete the userfile in one command.

 {% include {{ page.version.version }}/misc/external-connection-note.md %}

## Upload a file

{{site.data.alerts.callout_info}}
A userfile uses storage space in the cluster, and is replicated with the rest of the cluster's data. We recommend using [`cockroach userfile upload`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}) for quick uploads from your client (about 15MB or smaller).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data.csv /test-data.csv --certs-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

For more information, see [`cockroach userfile upload`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}).

## List files

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile list '*.csv' --certs-dir=certs
~~~

~~~
userfile://defaultdb.public.userfiles_root/test-data-2.csv
userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

For more information, see [`cockroach userfile list`]({% link {{ page.version.version }}/cockroach-userfile-list.md %}).

## Get files

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile get test-data.csv --certs-dir=certs
~~~

For more information, see [`cockroach userfile get`]({% link {{ page.version.version }}/cockroach-userfile-get.md %}).

## Delete files

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach userfile delete test-data.csv --certs-dir=certs
~~~

~~~
deleted userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

For more information, see [`cockroach userfile delete`]({% link {{ page.version.version }}/cockroach-userfile-delete.md %}).

## Upload and import from a dump file

{{site.data.alerts.callout_info}}
We recommend using [`cockroach import`]({% link {{ page.version.version }}/cockroach-import.md %}) for quick imports from your client (about 15MB or smaller). For larger imports, use the [IMPORT]({% link {{ page.version.version }}/import.md %}) statement.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach import db mysqldump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs
~~~

~~~
successfully imported mysqldump file /Users/maxroach/Desktop/test-db.sql
~~~

For more information, see [`cockroach import`]({% link {{ page.version.version }}/cockroach-import.md %}).

## Import from `userfile`

{% include {{ page.version.version }}/userfile-examples/import-into-userfile.md %}

## Backup and restore with `userfile`

{% include {{ page.version.version }}/userfile-examples/backup-userfile.md %}

## See also

- [`cockroach userfile upload`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %})
- [`cockroach userfile list`]({% link {{ page.version.version }}/cockroach-userfile-list.md %})
- [`cockroach userfile get`]({% link {{ page.version.version }}/cockroach-userfile-get.md %})
- [`cockroach userfile delete`]({% link {{ page.version.version }}/cockroach-userfile-delete.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [`IMPORT`]({% link {{ page.version.version }}/import.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
