---
title: Advanced Example Applications Overview
summary: Examples that show you how to build simple applications with CockroachDB
tags: golang, python, java
toc: true
docs_area: develop
key: build-an-app-with-cockroachdb.html
---

The examples in this section show you how to build simple applications using CockroachDB.

Click the links in the tables below to see simple but complete example applications for each supported language and library combination.

If you are looking to do a specific task such as connect to the database, insert data, or run multi-statement transactions, see [this list of tasks](#tasks).

{{site.data.alerts.callout_info}}
Applications may encounter incompatibilities when using advanced or obscure features of a driver or ORM with **partial** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

Note that tools with [**community-level** support]({{ page.version.version }}/community-tooling.md) have been tested or developed by the CockroachDB community, but are not officially supported by Cockroach Labs. If you encounter problems with using these tools, please contact the maintainer of the tool with details.
{{site.data.alerts.end}}

## JavaScript/TypeScript

| Driver/ORM Framework                                    | Support level  | Example apps                                            |
|---------------------------------------------------------+----------------+--------------------------------------------------------|
| [node-postgres](https://www.npmjs.com/package/pg)       | Full           | [AWS Lambda]({{ page.version.version }}/deploy-lambda-function.md)<br>[Simple CRUD]({{ page.version.version }}/build-a-nodejs-app-with-cockroachdb.md)
| [Sequelize](https://www.npmjs.com/package/sequelize)    | Full           | [Simple CRUD]({{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-sequelize.md)
| [Knex.js](https://knexjs.org/)                          | Full           | [Simple CRUD]({{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-knexjs.md)
| [Prisma](https://prisma.io)                             | Full           | [Simple CRUD]({{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-prisma.md)<br>[React Web App (Netlify)](deploy-app-netlify.html)<br>[React Web App (Next.js/Vercel)](deploy-app-vercel.html)
| [TypeORM](https://www.npmjs.com/package/typeorm)        | Full           | [Simple CRUD]({{ page.version.version }}/build-a-typescript-app-with-cockroachdb.md)

## Python

| Driver/ORM Framework                                            | Support level  | Example apps                                            |
|-----------------------------------------------------------------+----------------+--------------------------------------------------------|
| [psycopg2](https://www.psycopg.org/docs/install.html) | Full  | [Simple CRUD]({{ page.version.version }}/build-a-python-app-with-cockroachdb.md)<br>[AWS Lambda]({{ page.version.version }}/deploy-lambda-function.md)
| [psycopg3](https://www.psycopg.org/psycopg3/docs/)           | Full           | [Simple CRUD]({{ page.version.version }}/build-a-python-app-with-cockroachdb-psycopg3.md)
| [asyncpg](https://magicstack.github.io/asyncpg/current/index.html) | Partial  | [Simple CRUD]({{ page.version.version }}/build-a-python-app-with-cockroachdb-asyncpg.md)
| [SQLAlchemy](https://www.sqlalchemy.org/)                       | Full           | [Simple CRUD]({{ page.version.version }}/build-a-python-app-with-cockroachdb-sqlalchemy.md)<br>[Multi-region Flask Web App]({{ page.version.version }}/movr.md)
| [Django](https://pypi.org/project/Django/)                      | Full           | [Simple CRUD]({{ page.version.version }}/build-a-python-app-with-cockroachdb-django.md)

## Go

| Driver/ORM Framework                             | Support level  | Example apps                                            |
|--------------------------------------------------+----------------+--------------------------------------------------------|
| [pgx](https://github.com/jackc/pgx/releases)     | Full           | [Simple CRUD]({{ page.version.version }}/build-a-go-app-with-cockroachdb.md)
| [GORM](https://github.com/jinzhu/gorm/releases)  | Full           | [Simple CRUD]({{ page.version.version }}/build-a-go-app-with-cockroachdb-gorm.md)
| [pq](https://github.com/lib/pq)                  | Full           | [Simple CRUD]({{ page.version.version }}/build-a-go-app-with-cockroachdb-pq.md)
| [upper/db](https://github.com/upper/db)          | Full           | [Simple CRUD]({{ page.version.version }}/build-a-go-app-with-cockroachdb-upperdb.md)

## Java

| Driver/ORM Framework                       | Support level  | Example apps                                            |
|--------------------------------------------+----------------+--------------------------------------------------------|
| [JDBC](https://jdbc.postgresql.org/)       | Full           | [Quickstart](quickstart.md)<br>[Simple CRUD]({{ page.version.version }}/build-a-java-app-with-cockroachdb.md)<br>[Roach Data (Spring Boot App)](build-a-spring-app-with-cockroachdb-jdbc.html)
| [Hibernate](https://hibernate.org/orm/)    | Full           | [Simple CRUD]({{ page.version.version }}/build-a-java-app-with-cockroachdb-hibernate.md)<br>[Roach Data (Spring Boot App)](build-a-spring-app-with-cockroachdb-jpa.html)
| [jOOQ](https://www.jooq.org/)              | Full           | [Simple CRUD]({{ page.version.version }}/build-a-java-app-with-cockroachdb-jooq.md)

## Ruby

| Driver/ORM Framework                                      | Support level  | Example apps                                            |
|-----------------------------------------------------------+----------------+--------------------------------------------------------|
| [pg](https://rubygems.org/gems/pg)                        | Full           | [Simple CRUD]({{ page.version.version }}/build-a-ruby-app-with-cockroachdb.md)
| [Active Record](https://rubygems.org/gems/activerecord)    | Full           | [Simple CRUD]({{ page.version.version }}/build-a-ruby-app-with-cockroachdb-activerecord.md)

## C# 

| Driver/ORM Framework                                      | Support level  | Example apps                                           |
|-----------------------------------------------------------+----------------+--------------------------------------------------------|
| [Npgsql](https://www.npgsql.org/)                         | Full           | [Simple CRUD]({{ page.version.version }}/build-a-csharp-app-with-cockroachdb.md)

## Rust

| Driver/ORM Framework                           | Support level  | Example apps                                           |
|------------------------------------------------+----------------+--------------------------------------------------------|
| [Rust-Postgres](https://github.com/sfackler/rust-postgres) | Partial      | [Simple CRUD]({{ page.version.version }}/build-a-rust-app-with-cockroachdb.md)

## See also

Reference information:

- [Client drivers]({{ page.version.version }}/install-client-drivers.md)
- [Third-Party Tools Supported by Cockroach Labs]({{ page.version.version }}/third-party-database-tools.md)
- [Third-Party Tools Supported by the Community]({{ page.version.version }}/community-tooling.md)
- [Connection parameters]({{ page.version.version }}/connection-parameters.md)
- [Transactions]({{ page.version.version }}/transactions.md)
- [Performance best practices]({{ page.version.version }}/performance-best-practices-overview.md)

<a name="tasks"></a>

Specific tasks:

- [Connect to the Database]({{ page.version.version }}/connect-to-the-database.md)
- [Insert Data]({{ page.version.version }}/insert-data.md)
- [Query Data]({{ page.version.version }}/query-data.md)
- [Update Data]({{ page.version.version }}/update-data.md)
- [Delete Data]({{ page.version.version }}/delete-data.md)
- [Optimize Statement Performance]({{ page.version.version }}/make-queries-fast.md)
- [Run Multi-Statement Transactions]({{ page.version.version }}/run-multi-statement-transactions.md)
- [Troubleshoot SQL Statements]({{ page.version.version }}/query-behavior-troubleshooting.md)