---
title: Third-Party Tools Supported by the Community
summary: Learn about third-party software that works with CockroachDB.
toc: true
---

The following tools have been tested or developed by the CockroachDB community, but are not officially supported by Cockroach Labs.

If you encounter problems with using these tools, please contact the maintainer of the tool with details.

{{site.data.alerts.callout_success}}
If you have a tested or developed a third-party tool with CockroachDB, and would like it listed on this page, please [open a pull request to our docs GitHub repository](https://github.com/cockroachdb/docs/edit/master/v21.1/community-tooling.md).
{{site.data.alerts.end}}

## Drivers and data access frameworks

- [sqlx (for Go)](http://jmoiron.github.io/sqlx/)
- [clojure.java.jdbc](build-a-clojure-app-with-cockroachdb.html)
- [libpqxx](build-a-c++-app-with-cockroachdb.html)
- [Npgsql (for Powershell)](https://blog.ervits.com/2020/03/exploring-cockroachdb-with-jupyter.html)
- [php-pgsql](build-a-php-app-with-cockroachdb.html)
- [RPostgres](https://blog.ervits.com/2020/02/exploring-cockroachdb-with-r-and.html)
- [Rust-Postgres](build-a-rust-app-with-cockroachdb.html)

## Visualization tools

- [Beekeeper Studio](https://www.beekeeperstudio.io/db/cockroachdb-client/)
- [DbVisualizer](https://www.cdata.com/kb/tech/cockroachdb-jdbc-dbv.rst)
- [Navicat for PostgreSQL](https://www.navicat.com/en/products/navicat-for-postgresql)/[Navicat Premium](https://www.navicat.com/en/products/navicat-premium)
- [Pgweb](http://sosedoff.github.io/pgweb/)
- [Postico](https://eggerapps.at/postico/)
- [TablePlus](https://tableplus.com/blog/2018/06/best-cockroachdb-gui-client-tableplus.html)
- [Vault](https://www.vaultproject.io/docs/configuration/storage/cockroachdb)
- [Apache-hop Incubating](https://hop.apache.org)

## Schema migration tools

- [SchemaHero](https://schemahero.io/databases/cockroachdb/connecting/)
- [DbUp](https://github.com/DbUp/DbUp/issues/464#issuecomment-895503849)
- [golang-migrate](https://github.com/golang-migrate/migrate/tree/master/database/cockroachdb)
- [db-migrate](https://db-migrate.readthedocs.io/en/latest/)

## Connection pooling tools

- [PGBouncer](https://dzone.com/articles/using-pgbouncer-with-cockroachdb)

## See also

- [Build an App with CockroachDB](hello-world-example-apps.html)
- [Install a Postgres Client](install-client-drivers.html)
- [Third-Party Tools Supported by Cockroach Labs](third-party-database-tools.html)
