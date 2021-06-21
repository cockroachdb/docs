## Support levels

Cockroach Labs has partnered with open-source projects, vendors, and individuals to offer the following levels of support with third-party tools:

- **Full support** indicates that Cockroach Labs is committed to maintaining compatibility with the vast majority of the tool's features. CockroachDB is regularly tested against the latest version documented in the table below.
- **Beta support** indicates that Cockroach Labs is working towards full support for the tool. The primary features of the tool are compatible with CockroachDB (e.g., connecting and basic database operations), but full integration may require additional steps, lack support for all features, or exhibit unexpected behavior.

We recommend that you use the latest version of tools with CockroachDB, even if that version is higher than the latest tested version listed below. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward better support.

For a list of tools supported by the CockroachDB community, see [Third-Party Tools Supported by the Community](community-tooling.html).

## Drivers

| Language | Driver | Latest tested version | Support level | Tutorial   |
|----------+--------+-----------------------+---------------+------------|
| C | [libpq](http://www.postgresql.org/docs/13/static/libpq.html) | PostgreSQL 13 | Beta | N/A |
| C# (.NET) | [Npgsql](https://www.nuget.org/packages/Npgsql/) | 4.1.3.1 | Beta | [Build a C# App with CockroachDB (Npgsql)](build-a-csharp-app-with-cockroachdb.html) |
| Go | [pgx](https://github.com/jackc/pgx/releases)<hr>[pq](https://github.com/lib/pq)<hr>[go-pg](https://github.com/go-pg/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/pgx.go |var supportedPGXTag = "|"\n\n  %}<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/libpq.go |var libPQSupportedTag = "|"\n\n %}<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/gopg.go |var gopgSupportedTag = "|"\n\n %}| Full<hr>Full<hr>Full | [Build a Go App with CockroachDB (pgx)](build-a-go-app-with-cockroachdb.html)<hr>[Build a Go App with CockroachDB (pq)](build-a-go-app-with-cockroachdb-pq.html)<hr>N/A |
| Java | [JDBC](https://jdbc.postgresql.org/download.html#others) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/pgjdbc.go |var supportedPGJDBCTag = "|"\n\n %} | Full | [Build a Java App with CockroachDB (JDBC)](build-a-java-app-with-cockroachdb.html) |
| JavaScript | [pg](https://www.npmjs.com/package/pg) | 8.2.1 | Full | [Build a Node.js App with CockroachDB (pg)](build-a-nodejs-app-with-cockroachdb.html) |
| Python | [psycopg2](https://www.psycopg.org/docs/install.html) | 2.8.6 | Full | [Build a Python App with CockroachDB (psycopg2)](build-a-python-app-with-cockroachdb.html) |
| Ruby | [pg](https://rubygems.org/gems/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/ruby_pg.go |var rubyPGVersion = "|"\n\n %} | Full | [Build a Ruby App with CockroachDB (pg)](build-a-ruby-app-with-cockroachdb.html) |

## Data access frameworks (e.g., ORMs)

| Language | Framework | Latest tested version | Support level | Tutorial |
|----------+-----------+-----------------------+---------------+----------|
| Go | [GORM](https://github.com/jinzhu/gorm/releases)<hr>[upper/db](https://github.com/upper/db) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/gorm.go |var gormSupportedTag = "|"\n\n %} <hr>v4 | Full<hr>Full | [Build a Go App with CockroachDB (GORM)](build-a-go-app-with-cockroachdb-gorm.html)<hr>[Build a Go App with CockroachDB (upper/db)](build-a-go-app-with-cockroachdb-upperdb.html) |
| Java | [Hibernate](https://hibernate.org/orm/)<br>(including [Hibernate Spatial](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#spatial))<hr>[jOOQ](https://www.jooq.org/)<hr>[MyBatis](https://mybatis.org/mybatis-3/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/hibernate.go |var supportedHibernateTag = "|"\n\n %} (must be 5.4.19)<br><br><hr>3.13.2 (must be 3.13.0)<hr>3.5.5| Full<br><br><hr>Full<hr>Full | [Build a Java App with CockroachDB (Hibernate)](build-a-java-app-with-cockroachdb-hibernate.html)<br><br><hr>[Build a Java App with CockroachDB (jOOQ)](build-a-java-app-with-cockroachdb-jooq.html)<hr>[Build a Spring App with CockroachDB (MyBatis)](build-a-spring-app-with-cockroachdb-mybatis.html) |
| JavaScript/TypeScript | [Sequelize](https://www.npmjs.com/package/sequelize)<br>[sequelize-cockroachdb](https://www.npmjs.com/package/sequelize-cockroachdb)<br><hr>[TypeORM](https://www.npmjs.com/package/typeorm) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/sequelize.go |var supportedSequelizeRelease = "|"\n\n %}<br>(Use latest version of [sequelize-cockroachdb](https://www.npmjs.com/package/sequelize-cockroachdb) adapter.) <hr> {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/typeorm.go |var supportedTypeORMRelease = "|"\n\n %}  | Full<br><br><hr>Full | [Build a Node.js App with CockroachDB (Sequelize)](build-a-nodejs-app-with-cockroachdb-sequelize.html)<br><br><hr>[Build a TypeScript App with CockroachDB (TypeORM)](build-a-typescript-app-with-cockroachdb.html) |
| Ruby | [ActiveRecord](https://rubygems.org/gems/activerecord)<br>[RGeo/RGeo-ActiveRecord](https://github.com/cockroachdb/activerecord-cockroachdb-adapter#working-with-spatial-data)<br>[activerecord-cockroachdb-adapter](https://rubygems.org/gems/activerecord-cockroachdb-adapter) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/activerecord.go |var supportedRailsVersion = "|"\nvar %}<br>(Use latest version of [activerecord-cockroachdb-adapter](https://rubygems.org/gems/activerecord-cockroachdb-adapter/versions) adapter.) | Full<br><br><hr>Full | [Build a Ruby App with CockroachDB (ActiveRecord)](build-a-ruby-app-with-cockroachdb-activerecord.html) |
| Python | [Django](https://pypi.org/project/Django/)<br>(including [GeoDjango](https://docs.djangoproject.com/en/3.1/ref/contrib/gis/))<br>[django-cockroachdb](https://pypi.org/project/django-cockroachdb/)<hr>[peewee](https://github.com/coleifer/peewee/)<hr>[PonyORM](https://ponyorm.org/)<hr>[SQLAlchemy](https://www.sqlalchemy.org/)<br>[sqlalchemy-cockroachdb](https://pypi.org/project/sqlalchemy-cockroachdb/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/django.go |var djangoSupportedTag = "cockroach-|"\nvar %}<br>(Use latest version of [django-cockroachdb](https://pypi.org/project/django-cockroachdb/#history) adapter.)<br><br><hr>3.13.3<hr>0.7.13<hr>1.4.17<br>(Use latest version of [sqlalchemy-cockroachdb](https://pypi.org/project/sqlalchemy-cockroachdb/#history) adapter.) | Full<br><br> <hr>Full<hr>Full<hr>Full | [Build a Python App with CockroachDB (Django)](build-a-python-app-with-cockroachdb-django.html)<br><br><hr>N/A (See [peewee docs](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database).)<hr>[Build a Python App with CockroachDB (PonyORM)](build-a-python-app-with-cockroachdb-pony.html)<hr>[Build a Python App with CockroachDB (SQLAlchemy)](build-a-python-app-with-cockroachdb-sqlalchemy.html) |

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
| [Flyway](https://flywaydb.org/documentation/commandline/#download-and-installation) | 7.1.0 | Full | [Migrate CockroachDB Schemas with Flyway](flyway.html)
| [Liquibase](https://www.liquibase.org/download) | 4.2.0 | Full | [Migrate CockroachDB Schemas with Liquibase](liquibase.html)

## Other tools

| Tool | Latest tested version | Support level | Tutorial |
|-----+------------------------+---------------+----------|
| [Flowable](https://github.com/flowable/flowable-engine) | 6.4.2 | Full | [Getting Started with Flowable and CockroachDB (external)](https://blog.flowable.org/2019/07/11/getting-started-with-flowable-and-cockroachdb/)
