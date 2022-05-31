---
title: Use Userfile for Bulk Operations
summary: The IMPORT statement imports various types of data into CockroachDB.with user-scoped storage.
toc: true
---

 To put files on your CockroachDB cluster without external servers, use `userfile`, a per-user bulk file storage. To interact with `userfile`, use the following [commands](cockroach-commands.html):

- [`cockroach userfile upload`](#upload-a-file)
- [`cockroach userfile list`](#list-files)
- [`cockroach userfile get`](#get-files)
- [`cockroach userfile delete`](#delete-files)

Once a userfile is uploaded, you can run [`IMPORT`](#import-from-userfile).

{% include_cached new-in.html version="v21.1" %} For `PGDUMP` and `MYSQLDUMP` formats, you can use [`cockroach import`](#upload-and-import-from-a-dump-file) to upload a userfile, import its data, and delete the userfile in one command.

## Upload a file

{{site.data.alerts.callout_info}}
A userfile uses storage space in the cluster, and is replicated with the rest of the cluster's data. We recommend using [`cockroach userfile upload`](cockroach-userfile-upload.html) for quick uploads from your client (about 15MB or smaller).
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile upload /Users/maxroach/Desktop/test-data.csv /test-data.csv --certs-dir=certs
~~~

~~~
successfully uploaded to userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

For more information, see [`cockroach userfile upload`](cockroach-userfile-upload.html).

## List files

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile list '*.csv' --certs-dir=certs
~~~

~~~
userfile://defaultdb.public.userfiles_root/test-data-2.csv
userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

For more information, see [`cockroach userfile list`](cockroach-userfile-list.html).

## Get files

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile get test-data.csv --certs-dir=certs
~~~

For more information, see [`cockroach userfile get`](cockroach-userfile-get.html).

## Delete files

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile delete test-data.csv --certs-dir=certs
~~~

~~~
deleted userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

For more information, see [`cockroach userfile delete`](cockroach-userfile-delete.html).

## Upload and import from a dump file

{{site.data.alerts.callout_info}}
We recommend using [`cockroach import`](cockroach-import.html) for quick imports from your client (about 15MB or smaller). For larger imports, use the [IMPORT](import.html) statement.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ cockroach import db mysqldump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs
~~~

~~~
successfully imported mysqldump file /Users/maxroach/Desktop/test-db.sql
~~~

For more information, see [`cockroach import`](cockroach-import.html).

## Import from `userfile`

{% include {{ page.version.version }}/userfile-examples/import-into-userfile.md %}

## Backup and restore with `userfile`

{% include {{ page.version.version }}/userfile-examples/backup-userfile.md %}

## See also

- [`cockroach userfile upload`](cockroach-userfile-upload.html)
- [`cockroach userfile list`](cockroach-userfile-list.html)
- [`cockroach userfile get`](cockroach-userfile-get.html)
- [`cockroach userfile delete`](cockroach-userfile-delete.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
