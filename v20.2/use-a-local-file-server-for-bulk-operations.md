---
title: Use a Local File Server for Bulk Operations
summary: Learn how to create a simple file server for use with bulk operations within CockroachDB
toc: true
redirect_from:
- create-a-file-server.html
---

If you need a location to store files for the [`IMPORT`](import.html) process or [CockroachDB backups](backup.html), but do not have access to (or cannot use) [cloud storage providers](use-cloud-storage-for-bulk-operations.html), you can run a local file server. You can then use this file server by leveraging support for our [HTTP Export Storage API](#http-export-storage-api).

This is especially useful for:

- Implementing a compatibility layer in front of custom or proprietary storage providers for which CockroachDB does not yet have built-in support
- Using on-premises storage

## HTTP export storage API

CockroachDB tasks that require reading or writing external files (such as [`IMPORT`](import.html) and [`BACKUP`](backup.html)) can use the HTTP Export Storage API by prefacing the address with `http`, e.g., `http://fileserver/mnt/cockroach-exports`.

This API uses the `GET`, `PUT` and `DELETE` methods. This behaves like you would expect typical HTTP requests to work. After a `PUT` request to some path, a subsequent `GET` request should return the content sent in the `PUT` request body, at least until a `DELETE` request is received for that path.

## Examples

You can use any file server software that supports `GET`, `PUT` and `DELETE` methods, but we've included code samples for common ones:

- [Using PHP with `IMPORT`](#using-php-with-import)
- [Using Python with `IMPORT`](#using-python-with-import)
- [Using Ruby with `IMPORT`](#using-ruby-with-import)
- [Using Caddy as a file server](#using-caddy-as-a-file-server)
- [Using nginx as a file server](#using-nginx-as-a-file-server)

{{site.data.alerts.callout_info}}We do not recommend using any machines running <code>cockroach</code> as file servers. Using machines that are running cockroach as file servers could negatively impact performance if I/O operations exceed capacity.{{site.data.alerts.end}}

### Using PHP with `IMPORT`

The PHP language has an HTTP server built in.  You can serve local files using the commands below.  For more information about how to import these locally served files, see the documentation for the [`IMPORT`][import] statement.

{% include copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ php -S 127.0.0.1:3000 # files available at e.g., 'http://localhost:3000/data.sql'
~~~

### Using Python with `IMPORT`

The Python language has an HTTP server included in the standard library.  You can serve local files using the commands below.  For more information about how to import these locally served files, see the documentation for the [`IMPORT`][import] statement.

{% include copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ python -m SimpleHTTPServer 3000 # files available at e.g., 'http://localhost:3000/data.sql'
~~~

If you use Python 3, try:

{% include copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ python -m http.server 3000
~~~

### Using Ruby with `IMPORT`

The Ruby language has an HTTP server included in the standard library.  You can serve local files using the commands below.  For more information about how to import these locally served files, see the documentation for the [`IMPORT`][import] statement.

{% include copy-clipboard.html %}
~~~ shell
$ cd /path/to/data
$ ruby -run -ehttpd . -p3000 # files available at e.g., 'http://localhost:3000/data.sql'
~~~

### Using Caddy as a file server

1. [Download the Caddy web server](https://caddyserver.com/download).  Before downloading, in the **Customize your build** step, open the list of **Plugins** and make sure to check the `http.upload` option.

2. Copy the `caddy` binary to the directory containing the files you want to serve, and run it [with an upload directive](https://caddyserver.com/docs/http.upload), either in the command line or via [Caddyfile](https://caddyserver.com/docs/caddyfile).

- Command line example (with no TLS):
    {% include copy-clipboard.html %}
    ~~~ shell
    $ caddy -root /mnt/cockroach-exports "upload / {" 'to "/mnt/cockroach-exports"' 'yes_without_tls' "}"
    ~~~
- `Caddyfile` example (using a key and cert):
    {% include copy-clipboard.html %}
    ~~~ shell
    tls key cert
    root "/mnt/cockroach-exports"
    upload / {
      to "/mnt/cockroach-exports"
    }
    ~~~

For more information about Caddy, see [its documentation](https://caddyserver.com/docs).

### Using nginx as a file server

1. Install `nginx` with the `webdav` module (often included in `-full` or similarly named packages in various distributions).

2. In the `nginx.conf` file, add a `dav_methods PUT DELETE` directive. For example:

    {% include copy-clipboard.html %}
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
- [`BACKUP`](backup.html) (*Enterprise only*)
- [`RESTORE`](restore.html) (*Enterprise only*)

<!-- Reference Links -->

[import]: import.html
