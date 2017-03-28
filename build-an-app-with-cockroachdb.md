---
title: Build an App with CockroachDB
summary: The tutorials in this section show you how to build a simple application with CockroachDB, using PostgreSQL-compatible client drivers and ORMs.
toc: false
---

The tutorials in this section show you how to build a simple application with CockroachDB using PostgreSQL-compatible client drivers and ORMs that we have tested and can recommend.

{{site.data.alerts.callout_info}}CockroachDB is actively working on ORM support across various languages, as indicated below. If you have problems with a recommended ORM, please <a href="https://github.com/cockroachdb/cockroach/issues/new">open an issue</a> with details. If you would like us to support additional ORMs, please let us know <a href="https://forum.cockroachlabs.com/t/orm-compatibility/49">here</a>.{{site.data.alerts.end}}

App Language | Featured Driver | Featured ORM
-------------|-----------------|-------------
[Go](build-a-go-app-with-cockroachdb.html) | pq | GORM
[Python](build-a-python-app-with-cockroachdb.html) | psycopg2 | SQLAlchemy
[Ruby](build-a-ruby-app-with-cockroachdb.html) | pg | Active Record support coming soon
[Java](build-a-java-app-with-cockroachdb.html) | jdbc | Hibernate
[Node.js](build-a-nodejs-app-with-cockroachdb.html) | pg | Sequelize
[C++](build-a-c++-app-with-cockroachdb.html) | libpqxx | No ORMs tested
[Clojure](build-a-clojure-app-with-cockroachdb.html) | java.jdbc | No ORMs tested
[PHP](build-a-php-app-with-cockroachdb.html) | php-pgsql | No ORMs tested
[Rust](build-a-rust-app-with-cockroachdb.html) | postgres | No ORMs tested
