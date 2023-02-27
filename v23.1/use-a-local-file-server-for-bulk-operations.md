---
title: Use a Local File Server for Bulk Operations
summary: Learn how to create a simple file server for use with bulk operations within CockroachDB
toc: true
docs_area: manage
---

If you need a location to store files for the [`IMPORT`](import.html) process, but do not have access to (or cannot use) [cloud storage providers](use-cloud-storage.html), you can run a local file server. You can then use this file server by leveraging support for our [HTTP Export Storage API](#http-export-storage-api).

This is especially useful for:

- Implementing a compatibility layer in front of custom or proprietary storage providers for which CockroachDB does not yet have built-in support
- Using on-premises storage

{{site.data.alerts.callout_info}}
HTTP file servers are not supported as storage for [backups](take-full-and-incremental-backups.html).
{{site.data.alerts.end}}

## HTTP export storage API

A CockroachDB [`IMPORT`](import.html) process that requires reading or writing external files can use the HTTP Export Storage API by prefacing the address with `http`, e.g., `http://fileserver/mnt/cockroach-exports`.

This API uses the `GET`, `PUT` and `DELETE` methods. This behaves like you would expect typical HTTP requests to work. After a `PUT` request to some path, a subsequent `GET` request should return the content sent in the `PUT` request body, at least until a `DELETE` request is received for that path.

## Examples

You can use any file server software that supports `GET`, `PUT` and `DELETE` methods, but we've included code samples for common ones:

- [Using PHP with `IMPORT`](#using-php-with-import)
- [Using Python with `IMPORT`](#using-python-with-import)
- [Using Ruby with `IMPORT`](#using-ruby-with-import)
- [Using nginx as a file server](#using-nginx-as-a-file-server)

{{site.data.alerts.callout_info}}We do not recommend using any machines running <code>cockroach</code> as file servers. Using machines that are running cockroach as file servers could negatively impact performance if I/O operations exceed capacity.{{site.data.alerts.end}}

### Using PHP with `IMPORT`

The PHP language has an HTTP server built in.  You can serve local files using the commands below.  For more information about how to import these locally served files, see the documentation for the [`IMPORT`][import] statement.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ php -S 127.0.0.1:3000 # files available at e.g., 'http://localhost:3000/data.sql'
~~~

### Using Python with `IMPORT`

The Python language has an HTTP server included in the standard library.  You can serve local files using the commands below.  For more information about how to import these locally served files, see the documentation for the [`IMPORT`][import] statement.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ python -m SimpleHTTPServer 3000 # files available at e.g., 'http://localhost:3000/data.sql'
~~~

If you use Python 3, try:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ python -m http.server 3000
~~~

### Using Ruby with `IMPORT`

The Ruby language has an HTTP server included in the standard library.  You can serve local files using the commands below.  For more information about how to import these locally served files, see the documentation for the [`IMPORT`][import] statement.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ ruby -run -ehttpd . -p3000 # files available at e.g., 'http://localhost:3000/data.sql'
~~~

### Using nginx as a file server

1. Install `nginx` with the `webdav` module (often included in `-full` or similarly named packages in various distributions).

1. In the `nginx.conf` file, add a `dav_methods PUT DELETE` directive. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ nginx
    events {
        worker_connections  1024;
    }
    http {
      server {
        listen 20150;
        location / {
          dav_methods  PUT DELETE;
          root /mnt/cockroach-exports;
          sendfile           on;
          sendfile_max_chunk 1m;
        }
      }
    }
    ~~~

## See also

- [`IMPORT`][import]
- [Use Cloud Storage](use-cloud-storage.html)

<!-- Reference Links -->

[import]: import.html
