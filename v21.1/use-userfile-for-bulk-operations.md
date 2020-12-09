---
title: Use Userfile for Bulk Operations
summary: Import data into your CockroachDB cluster with user-scoped storage.
toc: true
---

 To put files on your CockroachDB cluster without external servers, use `userfile`, a per-user bulk file storage. To interact with `userfile`, use the following [commands](cockroach-commands.html):

- [`cockroach userfile upload`](#upload-a-file)
- [`cockroach userfile list`](#list-files)
- [`cockroach userfile delete`](#delete-files)

Once a userfile is uploaded, you can run [`IMPORT`](#import-from-userfile).

## Upload a file

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

## Delete files

{% include copy-clipboard.html %}
~~~ shell
$ cockroach userfile delete test-data.csv --certs-dir=certs
~~~

~~~
deleted userfile://defaultdb.public.userfiles_root/test-data.csv
~~~

For more information, see [`cockroach userfile delete`](cockroach-userfile-delete.html).

## Import from `userfile`

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id INT,
		dob DATE,
		first_name STRING,
    last_name STRING,
    joined DATE
)
CSV DATA (
    'userfile:///test-data.csv'
);
~~~

{{site.data.alerts.callout_info}}
`userfile:///` references the default path (`userfile://defaultdb.public.userfiles_$user/`).
{{site.data.alerts.end}}

~~~
        job_id       |  status   | fraction_completed |  rows  | index_entries |  bytes
---------------------+-----------+--------------------+--------+---------------+-----------
  599865027685613569 | succeeded |                  1 | 300024 |             0 | 13389972
(1 row)
~~~

For more import options, see [`IMPORT`](import.html) or [`IMPORT INTO`](import-into.html).

## See also

- [`cockroach userfile upload`](cockroach-userfile-upload.html)
- [`cockroach userfile list`](cockroach-userfile-list.html)
- [`cockroach userfile delete`](cockroach-userfile-delete.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
