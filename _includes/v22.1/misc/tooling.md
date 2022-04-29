## Support levels

Cockroach Labs has partnered with open-source projects, vendors, and individuals to offer the following levels of support with third-party tools:

- **Full support** indicates that Cockroach Labs is committed to maintaining compatibility with the vast majority of the tool's features. CockroachDB is regularly tested against the latest version documented in the table below.
- **Beta support** indicates that Cockroach Labs is working towards full support for the tool. The primary features of the tool are compatible with CockroachDB (e.g., connecting and basic database operations), but full integration may require additional steps, lack support for all features, or exhibit unexpected behavior.

{{site.data.alerts.callout_info}}
Unless explicitly stated, support for a [driver](#drivers) or [data access framework](#data-access-frameworks-e-g-orms) does not include [automatic, client-side transaction retry handling](transactions.html#client-side-intervention). For client-side transaction retry handling samples, see [Example Apps](example-apps.html).
{{site.data.alerts.end}}

If you encounter problems using CockroachDB with any of the tools listed on this page, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward better support.

For a list of tools supported by the CockroachDB community, see [Third-Party Tools Supported by the Community](community-tooling.html).

## Drivers

| Language | Driver | Latest tested version | Support level | CockroachDB adapter | Tutorial |
|----------+--------+-----------------------+---------------------+---------------------+----------|
| C | [libpq](http://www.postgresql.org/docs/13/static/libpq.html)| PostgreSQL 13 | Beta | N/A | N/A |
| C# (.NET) | [Npgsql](https://www.nuget.org/packages/Npgsql/) | 4.1.3.1 | Beta | N/A | [Build a C# App with CockroachDB (Npgsql)](build-a-csharp-app-with-cockroachdb.html) |
| Go | [pgx](https://github.com/jackc/pgx/releases)<br><br><hr>[pq](https://github.com/lib/pq) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/pgx.go |var supportedPGXTag = "|"\n\n  %}<br>(use latest version of CockroachDB adapter)<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/libpq.go |var libPQSupportedTag = "|"\n\n %} | Full<br><br><hr>Full | [`crdbpgx`](https://pkg.go.dev/github.com/cockroachdb/cockroach-go/crdb/crdbpgx)<br>(includes client-side transaction retry handling)<hr>N/A | [Build a Go App with CockroachDB (pgx)](build-a-go-app-with-cockroachdb.html)<br><br><hr>[Build a Go App with CockroachDB (pq)](build-a-go-app-with-cockroachdb-pq.html) |
| Java | [JDBC](https://jdbc.postgresql.org/download.html#others) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/pgjdbc.go |var supportedPGJDBCTag = "|"\n\n %} | Full | N/A | [Build a Java App with CockroachDB (JDBC)](build-a-java-app-with-cockroachdb.html) |
| JavaScript | [pg](https://www.npmjs.com/package/pg) | 8.2.1 | Full | N/A | [Build a Node.js App with CockroachDB (pg)](build-a-nodejs-app-with-cockroachdb.html) |
| Python | [psycopg2](https://www.psycopg.org/docs/install.html) | 2.8.6 | Full | N/A | [Build a Python App with CockroachDB (psycopg2)](build-a-python-app-with-cockroachdb.html) |
| Ruby | [pg](https://rubygems.org/gems/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/ruby_pg.go |var rubyPGVersion = "|"\n\n %} | Full | N/A | [Build a Ruby App with CockroachDB (pg)](build-a-ruby-app-with-cockroachdb.html) |
| Rust | [rust-postgres](https://github.com/sfackler/rust-postgres) | 0.19.2 | Beta | N/A | [Build a Rust App with CockroachDB](build-a-rust-app-with-cockroachdb.html) |

## Data access frameworks (e.g., ORMs)

| Language | Framework | Latest tested version | Support level | CockroachDB adapter | Tutorial |
|----------+-----------+-----------------------+---------------+---------------------+----------|
| Go | [GORM](https://github.com/jinzhu/gorm/releases)<br><br><hr>[go-pg](https://github.com/go-pg/pg)<hr>[upper/db](https://github.com/upper/db) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/gorm.go |var gormSupportedTag = "|"\n\n %} <br><br><hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/gopg.go |var gopgSupportedTag = "|"\n\n %}<hr>v4 | Full<br><br><hr>Full<hr>Full | [`crdbgorm`](https://pkg.go.dev/github.com/cockroachdb/cockroach-go/crdb/crdbgorm)<br>(includes client-side transaction retry handling)<hr>N/A<hr>N/A | [Build a Go App with CockroachDB (GORM)](build-a-go-app-with-cockroachdb-gorm.html)<br><br><hr>N/A<hr>[Build a Go App with CockroachDB (upper/db)](build-a-go-app-with-cockroachdb-upperdb.html) |
| Java | [Hibernate](https://hibernate.org/orm/)<br>(including [Hibernate Spatial](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#spatial))<hr>[jOOQ](https://www.jooq.org/)<hr>[MyBatis](https://mybatis.org/mybatis-3/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/hibernate.go |var supportedHibernateTag = "|"\n\n %} (must be 5.4.19)<br><br><hr>3.13.2 (must be 3.13.0)<hr>3.5.5| Full<br><br><hr>Full<hr>Full | N/A<br><br><hr>N/A<hr>N/A | [Build a Java App with CockroachDB (Hibernate)](build-a-java-app-with-cockroachdb-hibernate.html)<br><br><hr>[Build a Java App with CockroachDB (jOOQ)](build-a-java-app-with-cockroachdb-jooq.html)<hr>[Build a Spring App with CockroachDB (MyBatis)](build-a-spring-app-with-cockroachdb-mybatis.html) |
| JavaScript/TypeScript | [Sequelize](https://www.npmjs.com/package/sequelize)<br><br><hr>[Knex.js](https://knexjs.org/)<hr>[Prisma](https://prisma.io)<hr>[TypeORM](https://www.npmjs.com/package/typeorm) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/sequelize.go |var supportedSequelizeCockroachDBRelease = "|"\n\n %}<br>(use latest version of CockroachDB adapter)<hr> 0.95.12 <hr> 3.9.0 <hr> {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/typeorm.go |var supportedTypeORMRelease = "|"\n\n %}  | Full<br><br><hr>Full<hr>Full<hr>Full | [`sequelize-cockroachdb`](https://www.npmjs.com/package/sequelize-cockroachdb)<br><br><hr>N/A<hr>N/A<hr>N/A | [Build a Node.js App with CockroachDB (Sequelize)](build-a-nodejs-app-with-cockroachdb-sequelize.html)<br><br><hr>[Build a Node.js App with CockroachDB (Knex.js)](build-a-nodejs-app-with-cockroachdb-knexjs.html)<hr>[Build a Node.js App with CockroachDB (Prisma)](build-a-nodejs-app-with-cockroachdb-prisma.html)<hr>[Build a TypeScript App with CockroachDB (TypeORM)](build-a-typescript-app-with-cockroachdb.html) |
| Ruby | [ActiveRecord](https://rubygems.org/gems/activerecord)<br>[RGeo/RGeo-ActiveRecord](https://github.com/cockroachdb/activerecord-cockroachdb-adapter#working-with-spatial-data) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/activerecord.go |var supportedRailsVersion = "|"\nvar %}<br>(use latest version of CockroachDB adapter) | Full | [`activerecord-cockroachdb-adapter`](https://rubygems.org/gems/activerecord-cockroachdb-adapter)<br>(includes client-side transaction retry handling) | [Build a Ruby App with CockroachDB (ActiveRecord)](build-a-ruby-app-with-cockroachdb-activerecord.html) |
| Python | [Django](https://pypi.org/project/Django/)<br>(including [GeoDjango](https://docs.djangoproject.com/en/3.1/ref/contrib/gis/))<hr>[peewee](https://github.com/coleifer/peewee/)<hr>[PonyORM](https://ponyorm.org/)<hr>[SQLAlchemy](https://www.sqlalchemy.org/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/django.go |var djangoSupportedTag = "cockroach-|"\nvar %}<br>(use latest version of CockroachDB adapter)<br><hr>3.13.3<hr>0.7.13<hr>1.4.17<br>(use latest version of CockroachDB adapter) | Full<br><br><hr>Full<hr>Full<hr>Full | [`django-cockroachdb`](https://pypi.org/project/django-cockroachdb/)<br><br><hr>N/A<hr>N/A<hr>[`sqlalchemy-cockroachdb`](https://pypi.org/project/sqlalchemy-cockroachdb)<br>(includes client-side transaction retry handling) | [Build a Python App with CockroachDB (Django)](build-a-python-app-with-cockroachdb-django.html)<br><br><hr>N/A (See [peewee docs](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database).)<hr>[Build a Python App with CockroachDB (PonyORM)](build-a-python-app-with-cockroachdb-pony.html)<hr>[Build a Python App with CockroachDB (SQLAlchemy)](build-a-python-app-with-cockroachdb-sqlalchemy.html) |

## Application frameworks

| Framework | Data access | Latest tested version | Support level | Tutorial |
|-----------+-------------+-----------------------+---------------+----------|
| Spring | [JDBC](build-a-spring-app-with-cockroachdb-jdbc.html)<hr>[JPA (Hibernate)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>[MyBatis](build-a-spring-app-with-cockroachdb-mybatis.html) | See individual Java ORM or [driver](#drivers) for data access version support. | See individual Java ORM or [driver](#drivers) for data access support level. | [Build a Spring App with CockroachDB (JDBC)](build-a-spring-app-with-cockroachdb-jdbc.html)<hr>[Build a Spring App with CockroachDB (JPA)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>[Build a Spring App with CockroachDB (MyBatis)](build-a-spring-app-with-cockroachdb-mybatis.html)

## Graphical user interfaces (GUIs)

| GUI | Latest tested version | Support level | Tutorial |
|-----+-----------------------+---------------+----------|
| [DBeaver](https://dbeaver.com/) | 5.2.3 | Full | [Visualize CockroachDB Schemas with DBeaver](dbeaver.html)

## Integrated development environments (IDEs)

| IDE | Latest tested version | Support level | Tutorial |
|-----+-----------------------+---------------+----------|
| [DataGrip](https://www.jetbrains.com/datagrip/) | 2021.1 | Full | N/A
| [IntelliJ IDEA](https://www.jetbrains.com/idea/) | 2021.1 | Full | [Use IntelliJ IDEA with CockroachDB](intellij-idea.html)

## Schema migration tools

| Tool | Latest tested version | Support level | Tutorial |
|-----+------------------------+----------------+----------|
| [Alembic](https://alembic.sqlalchemy.org/en/latest/) | 1.7 | Full | [Migrate CockroachDB Schemas with Alembic](alembic.html)
| [AWS DMS](https://aws.amazon.com/dms/) | 3.4.6 | Beta | [Migrate CockroachDB Schemas with AWS DMS](aws-dms.html)
| [Flyway](https://flywaydb.org/documentation/commandline/#download-and-installation) | 7.1.0 | Full | [Migrate CockroachDB Schemas with Flyway](flyway.html)
| [Liquibase](https://www.liquibase.org/download) | 4.2.0 | Full | [Migrate CockroachDB Schemas with Liquibase](liquibase.html)

## Other tools

| Tool | Latest tested version | Support level | Tutorial |
|-----+------------------------+---------------+----------|
| [Flowable](https://github.com/flowable/flowable-engine) | 6.4.2 | Full | [Getting Started with Flowable and CockroachDB (external)](https://blog.flowable.org/2019/07/11/getting-started-with-flowable-and-cockroachdb/)
