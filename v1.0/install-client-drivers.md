---
title: Install Client Drivers
summary: CockroachDB supports the PostgreSQL wire protocol, so you can use any available PostgreSQL client drivers.
toc: false
---

CockroachDB supports the PostgreSQL wire protocol, so you can use any available PostgreSQL client drivers. We’ve tested and can recommend the following drivers.

For code samples using these drivers, see the [Build an App with CockroachDB](build-an-app-with-cockroachdb.html) tutorials.

Language | Recommended Driver
---------|--------
Go | [pq](https://godoc.org/github.com/lib/pq)
Python | [psycopg2](http://initd.org/psycopg/)
Ruby | [pg](https://rubygems.org/gems/pg)
Java | [jdbc](https://jdbc.postgresql.org)
Node.js | [pg](https://www.npmjs.com/package/pg)
C | [libpq](http://www.postgresql.org/docs/9.5/static/libpq.html)
C++ | [libpqxx](https://github.com/jtv/libpqxx)
Clojure | [java.jdbc](https://clojure-doc.org/articles/ecosystem/java_jdbc/home/)
PHP | [php-pgsql](https://www.php.net/manual/en/book.pgsql.php)
Rust | <a href="https://crates.io/crates/postgres/" data-proofer-ignore>postgres</a> {% comment %} This link is in HTML instead of Markdown because HTML proofer dies bc of https://github.com/rust-lang/crates.io/issues/163 {% endcomment %}
