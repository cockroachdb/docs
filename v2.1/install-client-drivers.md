---
title: Install Client Drivers
summary: CockroachDB supports the PostgreSQL wire protocol, so you can use any available PostgreSQL client drivers.
toc: false
---

CockroachDB supports the PostgreSQL wire protocol, so most available PostgreSQL client drivers should work with CockroachDB.

{{site.data.alerts.callout_info}}This page features drivers that we have tested enough to claim <strong>beta-level</strong> support. This means that applications using advanced or obscure features of a driver may encounter incompatibilities. If you encounter problems, please <a href="https://github.com/cockroachdb/cockroach/issues/new">open an issue</a> with details to help us make progress toward full support.</a>{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}For code samples using these drivers, see the <a href="build-an-app-with-cockroachdb.html">Build an App with CockroachDB</a> tutorials.{{site.data.alerts.end}}

App Language | Recommended Driver
-------------|-------------------
Go | [pq](https://godoc.org/github.com/lib/pq)
Python | [psycopg2](http://initd.org/psycopg/)
Ruby | [pg](https://rubygems.org/gems/pg)
Java | [jdbc](https://jdbc.postgresql.org)
Node.js | [pg](https://www.npmjs.com/package/pg)
C | [libpq](http://www.postgresql.org/docs/9.5/static/libpq.html)
C++ | [libpqxx](https://github.com/jtv/libpqxx)
C# (.NET) | [Npgsql](http://www.npgsql.org/)
Clojure | [java.jdbc](https://clojure-doc.org/articles/ecosystem/java_jdbc/home/)
PHP | [php-pgsql](https://www.php.net/manual/en/book.pgsql.php)
Rust | <a href="https://crates.io/crates/postgres/" data-proofer-ignore>postgres</a> {% comment %} This link is in HTML instead of Markdown because HTML proofer dies bc of https://github.com/rust-lang/crates.io/issues/163 {% endcomment %}
