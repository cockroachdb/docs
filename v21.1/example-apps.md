---
title: Example Apps
summary: Examples that show you how to build simple applications with CockroachDB
tags: golang, python, java
toc: true
redirect_from: hello-world-example-apps.html
---

The examples in this section show you how to build simple applications using CockroachDB.

Click the links in the tables below to see simple but complete example applications for each supported language and library combination.

If you are looking to do a specific task such as connect to the database, insert data, or run multi-statement transactions, see [this list of tasks](#tasks).

{{site.data.alerts.callout_info}}
Applications may encounter incompatibilities when using advanced or obscure features of a driver or ORM with **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

Note that tools with [**community-level** support](community-tooling.html) have been tested or developed by the CockroachDB community, but are not officially supported by Cockroach Labs. If you encounter problems with using these tools, please contact the maintainer of the tool with details.
{{site.data.alerts.end}}

## JavaScript/TypeScript

| Driver/ORM Framework                                    | Support level  | Example apps                                            |
|---------------------------------------------------------+----------------+--------------------------------------------------------|
| [node-postgres](https://www.npmjs.com/package/pg)       | Full           | [Simple CRUD](build-a-nodejs-app-with-cockroachdb.html)
| [Sequelize](https://www.npmjs.com/package/sequelize)    | Full           | [Simple CRUD](build-a-nodejs-app-with-cockroachdb-sequelize.html)
| [Knex.js](https://knexjs.org/)                          | Full           | [Simple CRUD](build-a-nodejs-app-with-cockroachdb-knexjs.html)
| [Prisma](https://prisma.io)                    | Full           | [Simple CRUD](build-a-nodejs-app-with-cockroachdb-prisma.html)
| [TypeORM](https://www.npmjs.com/package/typeorm)        | Full           | [Simple CRUD](build-a-typescript-app-with-cockroachdb.html)

## Python

| Driver/ORM Framework                                            | Support level  | Example apps                                            |
|-----------------------------------------------------------------+----------------+--------------------------------------------------------|
| [psycopg2](https://www.psycopg.org/docs/install.html)           | Full           | [Simple CRUD](build-a-python-app-with-cockroachdb.html)<br>[AWS Lambda](deploy-lambda-function.html)
| [SQLAlchemy](https://www.sqlalchemy.org/)                       | Full           | [Simple CRUD](build-a-python-app-with-cockroachdb-sqlalchemy.html)<br>[MovR-Flask (Global Web App)](movr-flask-overview.html)
| [Django](https://pypi.org/project/Django/)                      | Full           | [Simple CRUD](build-a-python-app-with-cockroachdb-django.html)
| [PonyORM](https://ponyorm.org/)                                 | Full           | [Simple CRUD](build-a-python-app-with-cockroachdb-pony.html)

## Go

| Driver/ORM Framework                             | Support level  | Example apps                                            |
|--------------------------------------------------+----------------+--------------------------------------------------------|
| [pgx](https://github.com/jackc/pgx/releases)     | Full           | [Simple CRUD](build-a-go-app-with-cockroachdb.html)
| [GORM](https://github.com/jinzhu/gorm/releases)  | Full           | [Simple CRUD](build-a-go-app-with-cockroachdb-gorm.html)
| [pq](https://github.com/lib/pq)                  | Full           | [Simple CRUD](build-a-go-app-with-cockroachdb-pq.html)
| [upper/db](https://github.com/upper/db)          | Full           | [Simple CRUD](build-a-go-app-with-cockroachdb-upperdb.html)

## Java

| Driver/ORM Framework                       | Support level  | Example apps                                            |
|--------------------------------------------+----------------+--------------------------------------------------------|
| [JDBC](https://jdbc.postgresql.org/)       | Full           | [Simple CRUD](build-a-java-app-with-cockroachdb.html)<br>[Roach Data (Spring Boot App)](build-a-spring-app-with-cockroachdb-jdbc.html)
| [Hibernate](https://hibernate.org/orm/)    | Full           | [Simple CRUD](build-a-java-app-with-cockroachdb-hibernate.html)<br>[Roach Data (Spring Boot App)](build-a-spring-app-with-cockroachdb-jpa.html)
| [jOOQ](https://www.jooq.org/)              | Full           | [Simple CRUD](build-a-java-app-with-cockroachdb-jooq.html)

## Ruby

| Driver/ORM Framework                                      | Support level  | Example apps                                            |
|-----------------------------------------------------------+----------------+--------------------------------------------------------|
| [pg](https://rubygems.org/gems/pg)                        | Full           | [Simple CRUD](build-a-ruby-app-with-cockroachdb.html)
| [ActiveRecord](https://rubygems.org/gems/activerecord)    | Full           | [Simple CRUD](build-a-ruby-app-with-cockroachdb-activerecord.html)

## C# 

| Driver/ORM Framework                                      | Support level  | Example apps                                           |
|-----------------------------------------------------------+----------------+--------------------------------------------------------|
| [Npgsql](https://www.npgsql.org/)                         | Beta           | [Simple CRUD](build-a-csharp-app-with-cockroachdb.html)

## Rust

| Driver/ORM Framework                           | Support level  | Example apps                                           |
|------------------------------------------------+----------------+--------------------------------------------------------|
| [Rust-Postgres](https://github.com/sfackler/rust-postgres) | Beta      | [Simple CRUD](build-a-rust-app-with-cockroachdb.html)

## See also

Reference information:

- [Client drivers](install-client-drivers.html)
- [Third-Party Tools Supported by Cockroach Labs](third-party-database-tools.html)
- [Third-Party Tools Supported by the Community](community-tooling.html)
- [Connection parameters](connection-parameters.html)
- [Transactions](transactions.html)
- [Performance best practices](performance-best-practices-overview.html)

<a name="tasks"></a>

Specific tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [Optimize Statement Performance](make-queries-fast.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
