## Support levels

Cockroach Labs has partnered with open-source projects, vendors, and individuals to offer the following levels of support with third-party tools:

- **Full support** indicates that Cockroach Labs is committed to maintaining compatibility with the vast majority of the tool's features. CockroachDB is regularly tested against the recommended version documented here.
- **Beta support** indicates that Cockroach Labs is working towards full support for the tool. The primary features of the tool are compatible with CockroachDB (e.g., connecting and basic database operations), but full integration may require additional steps, lack support for all features, or exhibit unexpected behavior.

If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward better support.

For a list of tools supported by the CockroachDB community, see [Third-Party Tools Supported by the Community](community-tooling.html).

## Drivers

| Language | Driver | Recommended version | Support level |
|----------+--------+---------------------+---------------|
| C | [libpq](http://www.postgresql.org/docs/13/static/libpq.html) | [PostgreSQL 13](http://www.postgresql.org/docs/13/static/libpq.html) | Beta |
| C# (.NET) | [Npgsql](build-a-csharp-app-with-cockroachdb.html) | [4.1.3.1](https://www.nuget.org/packages/Npgsql/) or later | Beta |
| Go | [pgx](https://github.com/jackc/pgx/releases)<hr>[pq](https://github.com/lib/pq)<hr>[go-pg](https://github.com/go-pg/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/pgx.go |var supportedPGXTag = "|"\n\n  %} or later<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/libpq.go |var libPQSupportedTag = "|"\n\n %} or later<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/gopg.go |var gopgSupportedTag = "|"\n\n %} or later| Full<hr>Full<hr>Full |
| Java | [JDBC](https://jdbc.postgresql.org/download.html#others) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/pgjdbc.go |var supportedPGJDBCTag = "|"\n\n %} or later | Full |
| JavaScript | [pg](build-a-nodejs-app-with-cockroachdb.html) | [8.2.1](https://www.npmjs.com/package/pg) or later | Beta |
| Python | [psycopg2](build-a-python-app-with-cockroachdb.html) | [2.8.6](https://www.psycopg.org/docs/install.html) or later | Full |
| Ruby | [pg](https://rubygems.org/gems/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/ruby_pg.go |var rubyPGVersion = "|"\n\n %} or later | Full |

## Data access frameworks (e.g., ORMs)

| Language | Framework | Recommended version | Support level |
|----------+-----+---------------------+---------------|
| Go | [GORM](https://github.com/jinzhu/gorm/releases)<hr>[upper/db](build-a-go-app-with-cockroachdb-upperdb.html) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/gorm.go |var gormSupportedTag = "|"\n\n %} or later <hr>[v4](https://github.com/upper/db/releases) | Full<hr>Full |
| Java | [Hibernate](build-a-java-app-with-cockroachdb-hibernate.html)<br>(including [Hibernate Spatial](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#spatial))<hr>[jOOQ](build-a-java-app-with-cockroachdb-jooq.html)<hr>[MyBatis](build-a-spring-app-with-cockroachdb-mybatis.html) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/hibernate.go |var supportedHibernateTag = "|"\n\n %} or later (must be 5.4.19 and higher)<br><br><hr>[3.13.2](https://www.jooq.org/download/versions) (must be 3.13.0 or higher)<hr>[3.5.5 and higher](https://mybatis.org/mybatis-3/) | Full<br><br><hr>Full<hr>Full |
| JavaScript/TypeScript | [Sequelize](https://www.npmjs.com/package/sequelize)<br><br><hr>[TypeORM](https://www.npmjs.com/package/typeorm) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/sequelize.go |var supportedSequelizeRelease = "|"\n\n %} or later <br>[sequelize-cockroachdb](https://www.npmjs.com/package/sequelize-cockroachdb) (latest)<hr> {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/typeorm.go |var supportedTypeORMRelease = "|"\n\n %} or later  | Beta<br><br><hr>Full |
| Ruby | [ActiveRecord](https://rubygems.org/gems/activerecord)<br>[RGeo/RGeo-ActiveRecord](https://github.com/cockroachdb/activerecord-cockroachdb-adapter#working-with-spatial-data) | [activerecord 5.2](https://rubygems.org/gems/activerecord/versions) or later<br>[activerecord-cockroachdb-adpater 5.2.2](https://rubygems.org/gems/activerecord-cockroachdb-adapter/versions) or later <hr>activerecord {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/activerecord.go |var supportedRailsVersion = "|"\nvar %} or later <br>activerecord-cockroachdb-adapter {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/activerecord.go |var activerecordAdapterVersion = "|"\n\n %} or later  | Full<br><br><hr>Full |
| Python | [Django](https://pypi.org/project/Django/)<br>(including [GeoDjango](https://docs.djangoproject.com/en/3.1/ref/contrib/gis/))<hr>[peewee](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database)<hr>[PonyORM](build-a-python-app-with-cockroachdb-pony.html)<hr>[SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html) | Django {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/django.go |var djangoCockroachDBSupportedTag = "|"\n\n %} or later <br>[django-cockroachdb](https://pypi.org/project/django-cockroachdb/) {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/django.go |var djangoSupportedTag = "cockroach-|"\nvar %}<hr>[3.13.3](https://pypi.org/project/peewee/)<hr>[0.7.13](https://pypi.org/project/pony/)<hr>[SQLAlchemy 1.3.17](https://pypi.org/project/SQLAlchemy/)<br>[sqlalchemy-cockroachdb 1.3.0](https://pypi.org/project/sqlalchemy-cockroachdb/) | Full<br><br> <hr>Full<hr>Full<hr>Full |

## Application frameworks

| Framework | Data access | Recommended version | Support level |
|-----------+-------------+---------------------+---------------|
| Spring | [JDBC](build-a-spring-app-with-cockroachdb-jdbc.html)<hr>[JPA (Hibernate)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>jOOQ<hr>[MyBatis](build-a-spring-app-with-cockroachdb-mybatis.html) | See individual Java ORM or [driver](#drivers) for data access version support. | See individual Java ORM or [driver](#drivers) for data access support level. |

## Graphical user interfaces (GUIs)

| GUI | Recommended version | Support level |
|-----+---------------------+---------------|
| [DBeaver](https://dbeaver.com/) | [5.2.3 or higher](https://dbeaver.com/download/) | Full |

## Integrated development environments (IDEs)

| IDE | Recommended version | Support level |
|-----+---------------------+---------------|
| [DataGrip](https://www.jetbrains.com/datagrip/) | [2021.1 or higher](https://www.jetbrains.com/datagrip/download) | Full |
| [IntelliJ IDEA](https://www.jetbrains.com/idea/) | [2021.1 or higher](https://www.jetbrains.com/idea/download) | Full |

## Schema migration tools

| Tool | Recommended version | Support level |
|-----+---------------------+---------------|
| [Flyway](flyway.html) | [7.1.0](https://flywaydb.org/documentation/commandline/#download-and-installation) or higher | Full |
| [Liquibase](liquibase.html) | [4.2.0](https://www.liquibase.org/download) or higher | Full |

## Other tools

| Tool | Recommended version | Support level |
|-----+---------------------+---------------|
| [Flowable](https://blog.flowable.org/2019/07/11/getting-started-with-flowable-and-cockroachdb/) | [6.4.2](https://github.com/flowable/flowable-engine/releases/tag/flowable-6.4.2) or higher | Full |
