## Support levels

Cockroach Labs has partnered with open-source projects, vendors, and individuals to offer the following levels of support with third-party tools:

- **Full support** indicates that Cockroach Labs is committed to maintaining compatibility with the vast majority of the tool's features. CockroachDB is regularly tested against the recommended version documented here.
- **Beta support** indicates that Cockroach Labs is working towards full support for the tool. The primary features of the tool are compatible with CockroachDB (e.g., connecting and basic database operations), but full integration may require additional steps, lack support for all features, or exhibit unexpected behavior.

If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward better support.

For a list of tools supported by the CockroachDB community, see [Third-Party Tools Supported by the Community](community-tooling.html).

## Drivers

| Language | Driver | Latest tested version | Support level | Tutorial |
|----------+--------+---------------------+---------------+------------|
| C | [libpq](http://www.postgresql.org/docs/13/static/libpq.html) | [PostgreSQL 13](http://www.postgresql.org/docs/13/static/libpq.html) | Beta | N/A |
| C# (.NET) | [Npgsql](https://www.nuget.org/packages/Npgsql/) | 4.1.3.1 or later | Beta | [Build a C# App with CockroachDB (Npgsql)](build-a-csharp-app-with-cockroachdb.html) |
| Go | [pgx](https://github.com/jackc/pgx/releases)<hr>[pq](https://github.com/lib/pq)<hr>[go-pg](https://github.com/go-pg/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/pgx.go |var supportedPGXTag = "|"\n\n  %} or later<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/libpq.go |var libPQSupportedTag = "|"\n\n %} or later<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/gopg.go |var gopgSupportedTag = "|"\n\n %} or later| Full<hr>Full<hr>Full | [Build a Go App with CockroachDB (pgx)](build-a-go-app-with-cockroachdb.html)<hr>[Build a Go App with CockroachDB (pq)](build-a-go-app-with-cockroachdb-pq.html)<hr>N/A |
| Java | [JDBC](https://jdbc.postgresql.org/download.html#others) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/pgjdbc.go |var supportedPGJDBCTag = "|"\n\n %} or later | Full | [Build a Java App with CockroachDB (JDBC)](build-a-java-app-with-cockroachdb.html) |
| JavaScript | [pg](https://www.npmjs.com/package/pg) | 8.2.1 or later | Beta | [Build a Node.js App with CockroachDB (pg)](build-a-nodejs-app-with-cockroachdb.html) |
| Python | [psycopg2](https://www.psycopg.org/docs/install.html) | 2.8.6 or later | Full | [Build a Python App with CockroachDB (psycopg2)](build-a-python-app-with-cockroachdb.html) |
| Ruby | [pg](https://rubygems.org/gems/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/ruby_pg.go |var rubyPGVersion = "|"\n\n %} or later | Full | [Build a Ruby App with CockroachDB (pg)](build-a-ruby-app-with-cockroachdb.html) |

## Data access frameworks (e.g., ORMs)

| Language | Framework | Latest tested version | Support level | Tutorial |
|----------+-----+---------------------+---------------------+------------|
| Go | [GORM](https://github.com/jinzhu/gorm/releases)<hr>[upper/db](https://github.com/upper/db) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/gorm.go |var gormSupportedTag = "|"\n\n %} or later <hr>v4 | Full<hr>Full | [Build a Go App with CockroachDB (GORM)](build-a-go-app-with-cockroachdb-gorm.html)<hr>[Build a Go App with CockroachDB (upper/db)](build-a-go-app-with-cockroachdb-upperdb.html) |
| Java | [Hibernate](https://hibernate.org/orm/)<br>(including [Hibernate Spatial](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#spatial))<hr>[jOOQ](https://www.jooq.org/)<hr>[MyBatis](https://mybatis.org/mybatis-3/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/hibernate.go |var supportedHibernateTag = "|"\n\n %} or later (must be 5.4.19 or higher)<br><br><hr>3.13.2 (must be 3.13.0 or higher)<hr>3.5.5 or higher | Full<br><br><hr>Full<hr>Full | [Build a Java App with CockroachDB (Hibernate)](build-a-java-app-with-cockroachdb-hibernate.html)<br><br><hr>[Build a Java App with CockroachDB (jOOQ)](build-a-java-app-with-cockroachdb-jooq.html)<hr>[Build a Spring App with CockroachDB (MyBatis)](build-a-spring-app-with-cockroachdb-mybatis.html) |
| JavaScript/TypeScript | [Sequelize](https://www.npmjs.com/package/sequelize)<br><br><hr>[TypeORM](https://www.npmjs.com/package/typeorm) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/sequelize.go |var supportedSequelizeRelease = "|"\n\n %} or later <br>[sequelize-cockroachdb](https://www.npmjs.com/package/sequelize-cockroachdb) (latest)<hr> {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/typeorm.go |var supportedTypeORMRelease = "|"\n\n %} or later  | Beta<br><br><hr>Full | [Build a Node.js App with CockroachDB (Sequelize)](build-a-nodejs-app-with-cockroachdb-sequelize.html)<br><br><hr>[Build a TypeScript App with CockroachDB (TypeORM)](build-a-typescript-app-with-cockroachdb.html) |
| Ruby | [ActiveRecord](https://rubygems.org/gems/activerecord)<br>[RGeo/RGeo-ActiveRecord](https://github.com/cockroachdb/activerecord-cockroachdb-adapter#working-with-spatial-data) | [activerecord 5.2](https://rubygems.org/gems/activerecord/versions) or later<br>[activerecord-cockroachdb-adpater 5.2.2](https://rubygems.org/gems/activerecord-cockroachdb-adapter/versions) or later <hr>activerecord 6.0 or later <br>activerecord-cockroachdb-adapter v6.0 or later  | Full<br><br><hr>Full | [Build a Ruby App with CockroachDB (ActiveRecord)](build-a-ruby-app-with-cockroachdb-activerecord.html) |
| Python | [Django](https://pypi.org/project/Django/)<br>(including [GeoDjango](https://docs.djangoproject.com/en/3.1/ref/contrib/gis/))<hr>[peewee](https://github.com/coleifer/peewee/)<hr>[PonyORM](https://ponyorm.org/)<hr>[SQLAlchemy](https://www.sqlalchemy.org/) | Django {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/django.go |var djangoCockroachDBSupportedTag = "|"\n\n %} or later <br>[django-cockroachdb](https://pypi.org/project/django-cockroachdb/) {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/django.go |var djangoSupportedTag = "cockroach-|"\nvar %}<hr>3.13.3<hr>0.7.13<hr>SQLAlchemy 1.3.17<br>[sqlalchemy-cockroachdb](https://pypi.org/project/sqlalchemy-cockroachdb/) 1.3.0 | Full<br><br> <hr>Full<hr>Full<hr>Full | [Build a Python App with CockroachDB (Django)](build-a-python-app-with-cockroachdb-django.html)<br><br><hr>N/A (See [peewee docs](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database).)<hr>[Build a Python App with CockroachDB (PonyORM)](build-a-python-app-with-cockroachdb-pony.html)<hr>[Build a Python App with CockroachDB (SQLAlchemy)](build-a-python-app-with-cockroachdb-sqlalchemy.html) |

## Application frameworks

| Framework | Data access | Latest tested version | Support level | Tutorial |
|-----------+-------------+---------------------+---------------+----------|
| Spring | [JDBC](build-a-spring-app-with-cockroachdb-jdbc.html)<hr>[JPA (Hibernate)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>[MyBatis](build-a-spring-app-with-cockroachdb-mybatis.html) | See individual Java ORM or [driver](#drivers) for data access version support. | See individual Java ORM or [driver](#drivers) for data access support level. | [Build a Spring App with CockroachDB (JDBC)](build-a-spring-app-with-cockroachdb-jdbc.html)<hr>[Build a Spring App with CockroachDB (JPA)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>[Build a Spring App with CockroachDB (MyBatis)](build-a-spring-app-with-cockroachdb-mybatis.html)

## Graphical user interfaces (GUIs)

| GUI | Latest tested version | Support level | Tutorial |
|-----+---------------------+---------------+----------|
| [DBeaver](https://dbeaver.com/) | 5.2.3 or higher | Full | [Visualize CockroachDB Schemas with DBeaver](dbeaver.html)

## Integrated development environments (IDEs)

| IDE | Latest tested version | Support level | Tutorial |
|-----+---------------------+---------------+----------|
| [DataGrip](https://www.jetbrains.com/datagrip/) | 2021.1 or higher | Full | N/A
| [IntelliJ IDEA](https://www.jetbrains.com/idea/) | 2021.1 or higher | Full | [Use IntelliJ IDEA with CockroachDB](intellij-idea.html)

## Schema migration tools

| Tool | Latest tested version | Support level | Tutorial |
|-----+---------------------+----------------+----------|
| [Flyway](https://flywaydb.org/documentation/commandline/#download-and-installation) | 7.1.0 or higher | Full | [Migrate CockroachDB Schemas with Flyway](flyway.html)
| [Liquibase](https://www.liquibase.org/download) | 4.2.0 or higher | Full | [Migrate CockroachDB Schemas with Liquibase](liquibase.html)

## Other tools

| Tool | Latest tested version | Support level | Tutorial |
|-----+---------------------+----------------+----------|
| [Flowable](https://github.com/flowable/flowable-engine) | 6.4.2 or higher | Full | [Getting Started with Flowable and CockroachDB (external)](https://blog.flowable.org/2019/07/11/getting-started-with-flowable-and-cockroachdb/)
