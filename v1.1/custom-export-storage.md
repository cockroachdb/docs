---
title: Storing Backups and Exported Data
summary: Use one of the supported cloud storage options or run your own.
toc: false
---

[`BACKUP`](backup.html) and [`RESTORE`](restore.html) support writing to or reading from a variety of cloud storage providers like Amazon's S3. In addition to these, any HTTP service that supports GET, PUT and DELETE can also be used for storing exported data.

This can be used to implement a compatibility layer in front of custom or proprietary storage providers, for which CockroachDB does not yet have native support, or to utilize some existing on-premisis storage via an off-the-shelf HTTP server like nginx or Caddy.

<div id="toc"></div>

## HTTP Export Storage API

HTTP Storage uses the `GET`, `PUT` and `DELETE` methods. After a PUT request to some path, a subsequent GET request should return the content sent in the PUT request body, at least until a DELETE request is received for that path.

## Using Caddy as an Export Storage provider

[Download a caddy binary](https://caddyserver.com/download) that includes the `http.upload` plugin and run it with an [an `upload` directive](https://caddyserver.com/docs/http.upload), either in the command-line or via `Caddyfile`.

For example, on the command-line, with no TLS:
  ```
  caddy -root /tmp/cockroach-exports "upload / {" 'to "/tmp/cockroach-exports"' 'yes_without_tls' "}"
  ```
  or via [`Caddyfile`](https://caddyserver.com/tutorial/caddyfile) using a key and cert:
  ```
  tls key cert
  root "/tmp/cockroach-export"
  upload / {
    to "/tmp/cockroach-export"
  }
```

## Using nginx as an Export Storage provider

Install nginx with the webdav module (often included in `-full` or similarly named packages in various distributions). Add a `dav_methods PUT` directive to your nginx.conf, for example:
```
events {
    worker_connections  1024;
}
http {
  server {
    listen 20150;
    location / {
      dav_methods  PUT;
      root /tmp/cockroach-exports;
      sendfile           on;
      sendfile_max_chunk 1m;
    }
  }
}
```