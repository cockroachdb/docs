---
title: Third-Party Tools
summary: Learn more about tools that work with CockroachDB, including GUIs, ORMs, drivers, IDEs, and schema migration tools.
toc: true
---

Because CockroachDB supports the Postgres wire protocol and Postgres SQL dialect, it works with a variety of third-party tools.

This page lists third-party tools that work with CockroachDB and for each tool:

- Links to documentation for that tool
- Lists the version we tested
- Describes the level of support based on our internal testing

The levels of support are:

- <font color="green"><strong>Full</strong></font>: All major features of the tool are supported.
- <font color="orange"><strong>Beta</strong></font>: Most major features of the tool are supported.  Some features are unimplemented, or there may be bugs.

{{site.data.alerts.callout_info}}
Please [file a Github issue with us](file-an-issue.html) if you identify a bug in any of these tools.
{{site.data.alerts.end}}

## Schema migration

| Tool                                                 | Version                 | Level of Support                 |
|------------------------------------------------------+-------------------------+----------------------------------|
| [Flyway](https://flywaydb.org/)                      | Community Edition 5.2.0 | <font color="green">Full</font>  |
| [Migrate](https://github.com/golang-migrate/migrate) | 4.0.1                   | <font color="orange">Beta</font> |

## Database GUIs

| Tool                    | Version                 | Level of Support                |
|-------------------------+-------------------------+---------------------------------|
| [DBeaver](dbeaver.html) | Community Edition 5.2.2 | <font color="green">Full</font> |

<!-- Note: Removed Postico from this list because it crashes every time I try to click into a table.  -->

## ORMs

| Tool                                                                |                                  Version | Level of Support                 |
|---------------------------------------------------------------------+------------------------------------------+----------------------------------|
| [Hibernate](build-a-java-app-with-cockroachdb-hibernate.html)       | org.hibernate:hibernate-core:5.2.4.Final | <font color="green">Full</font>  |
| [SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html)   |                                      1.2 | <font color="green">Full</font>  |
| [GORM](build-a-go-app-with-cockroachdb-gorm.html)                   |                                    1.9.1 | <font color="orange">Beta</font> |
| [ActiveRecord](build-a-ruby-app-with-cockroachdb-activerecord.html) |                                      5.0 | <font color="orange">Beta</font> |
| [Sequelize](build-a-nodejs-app-with-cockroachdb-sequelize.html)     |                                   4.38.0 | <font color="orange">Beta</font> |
| [TypeORM](http://typeorm.io) (via Postgres support)                 |                                    0.2.6 | <font color="orange">Beta</font> |

## Drivers

| Library                                                      |               Version | Level of Support                 |
|--------------------------------------------------------------+-----------------------+----------------------------------|
| [JDBC](build-a-java-app-with-cockroachdb.html)               | postgresql.jar 42.2.2 | <font color="green">Full</font>  |
| [node-postgres](build-a-nodejs-app-with-cockroachdb.html)    |                 7.4.3 | <font color="green">Full</font>  |
| [PHP](build-a-php-app-with-cockroachdb.html)                 |           libpq 5.6.0 | <font color="green">Full</font>  |
| [psycopg (Python)](build-a-python-app-with-cockroachdb.html) |                 2.7.5 | <font color="green">Full</font>  |
| [Npgsql (C#)](build-a-csharp-app-with-cockroachdb.html)      |                   4.1 | <font color="green">Full</font>  |
| [pq (Go)](build-a-go-app-with-cockroachdb.html)              |                 1.0.0 | <font color="green">Full</font>  |
| [Pg (Ruby)](build-a-ruby-app-with-cockroachdb.html)          |                 1.0.0 | <font color="green">Full</font>  |
| [pgx (Go)](https://godoc.org/github.com/jackc/pgx)           |                 3.2.0 | <font color="orange">Beta</font> |
| [DBD::Pg (Perl)](https://metacpan.org/pod/DBD::Pg)           |                 3.7.4 | <font color="orange">Beta</font> |

<!--

## IDEs

| Tool                                                                                         | Version | Level of Support                 |
|----------------------------------------------------------------------------------------------+---------+----------------------------------|
| [IntelliJ](https://www.jetbrains.com/help/idea/connecting-to-a-database.html) (via Postgres) |         | <font color="orange">Beta</font> |
| [Eclipse](https://wiki.postgresql.org/wiki/Working_with_Eclipse) (via Postgres)              |         | <font color="orange">Beta</font> |

 -->

## See Also

+ [Build an App with CockroachDB](build-an-app-with-cockroachdb.html)
+ [Install client drivers](install-client-drivers.html)
