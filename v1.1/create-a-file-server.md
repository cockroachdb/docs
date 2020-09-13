---
title: Create a File Server for Imports and Backups
summary: Learn how to create a simple file server for use with CockroachDB IMPORT and BACKUP
toc: true
---

If you need a location to store files for the [`IMPORT`](import.html) process or [CockroachDB enterprise backups](backup.html), but do not have access to (or simply cannot use) cloud storage providers, you can easily create your own file server. You can then use this file server by leveraging support for our HTTP Export Storage API.

This is especially useful for:

- Implementing a compatibility layer in front of custom or proprietary storage providers for which CockroachDB does not yet have built-in support
- Using on-premises storage


## HTTP Export Storage API

CockroachDB tasks that require reading or writing external files (such as [`IMPORT`](import.html) and [`BACKUP`](backup.html)) can use the HTTP Export Storage API by prefacing the address with `http`, e.g., `http://fileserver/mnt/cockroach-exports`.

This API uses the `GET`, `PUT` and `DELETE` methods. This behaves like you would expect typical HTTP requests to work. After a `PUT` request to some path, a subsequent `GET` request should return the content sent in the `PUT` request body, at least until a `DELETE` request is received for that path.

## Examples

You can use any file server software that supports `GET`, `PUT` and `DELETE` methods, but we've included code samples for common ones:

- [Caddy](#using-caddy-as-a-file-server)
- [nginx](#using-nginx-as-a-file-server)

{{site.data.alerts.callout_info}}We do not recommend using any machines running <code>cockroach</code> as file servers. Using machines that are running cockroach as file servers could negatively impact performance if I/O operations exceed capacity.{{site.data.alerts.end}}

### Using Caddy as a File Server

1. [Download a `caddy` binary](https://caddyserver.com/download) that includes the `http.upload` plugin.

2. Run `caddy` with an [`upload` directive](https://caddyserver.com/docs/http.upload), either in the command line or via [`Caddyfile`](https://caddyserver.com/docs/caddyfile).
    - Command line example (with no TLS):

        ~~~ shell
        caddy -root /mnt/cockroach-exports "upload / {" 'to "/mnt/cockroach-exports"' 'yes_without_tls' "}"
        ~~~
    - `Caddyfile` example (using a key and cert):

        ~~~ shell
        tls key cert
        root "/mnt/cockroach-exports"
        upload / {
          to "/mnt/cockroach-exports"
        }
        ~~~

### Using nginx as a File Server

1. Install `nginx` with the `webdav` module (often included in `-full` or similarly named packages in various distributions).

2. In the `nginx.conf` file, add a `dav_methods PUT DELETE` directive. For example:

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

## See Also

- [`IMPORT`](import.html)
- [`BACKUP`](backup.html) (*Enterprise only*)
- [`RESTORE`](restore.html) (*Enterprise only*)
