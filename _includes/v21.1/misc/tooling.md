## Support levels

We’ve partnered with open-source projects, vendors, and individuals to offer the following levels of support with third-party tools.

- **Full support** indicates that the vast majority of the tool's features should work without issue with CockroachDB. CockroachDB is regularly tested against the recommended version documented here.
- **Beta support** indicates that the tool has been tried with CockroachDB, but its integration might require additional steps, lack support for all features, or exhibit unexpected behavior.

If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward better support.

## Drivers

| Language | Driver | Recommended version | Support level |
|----------+--------+---------------------+---------------|
| C | [libpq](http://www.postgresql.org/docs/9.5/static/libpq.html) | [PostgreSQL 9.5](http://www.postgresql.org/docs/9.5/static/libpq.html) | Beta |
| C++ | [libpqxx](build-a-c++-app-with-cockroachdb.html) | [7.1.1](https://github.com/jtv/libpqxx/releases) (Windows)<br>[4.0.1](https://github.com/jtv/libpqxx/releases) or higher (macOS) | Beta |
| C# (.NET) | [Npgsql](build-a-csharp-app-with-cockroachdb.html) | [4.1.3.1](https://www.nuget.org/packages/Npgsql/) | Beta |
| Clojure | [java.jdbc](build-a-clojure-app-with-cockroachdb.html) | [0.7.11](https://search.maven.org/search?q=g:org.clojure%20AND%20a:java.jdbc) | Beta |
| Go | [pgx](build-a-go-app-with-cockroachdb.html)<hr>[pq](build-a-go-app-with-cockroachdb-pq.html) | [4.6.0](https://github.com/jackc/pgx/releases)<hr>[1.5.2](https://github.com/lib/pq/releases) | Full<hr>Full |
| Java | [JDBC](build-a-java-app-with-cockroachdb.html) | [42.2.9](https://jdbc.postgresql.org/download.html#others) | Full |
| Node.js | [pg](build-a-nodejs-app-with-cockroachdb.html) | [8.2.1](https://www.npmjs.com/package/pg) | Beta |
| PHP | [php-pgsql](build-a-php-app-with-cockroachdb.html) | [PHP 7.4.6](https://www.php.net/downloads) | Beta |
| Python | [psycopg2](build-a-python-app-with-cockroachdb.html) | [2.8.6](https://www.psycopg.org/docs/install.html) | Full |
| Ruby | [pg](build-a-ruby-app-with-cockroachdb.html) | [1.2.3](https://rubygems.org/gems/pg) | Full |
| Rust | <a href="https://crates.io/crates/postgres/" data-proofer-ignore>postgres</a> {% comment %} This link is in HTML instead of Markdown because HTML proofer dies bc of https://github.com/rust-lang/crates.io/issues/163 {% endcomment %} | [0.17.3](https://crates.io/crates/postgres/) | Beta |

## Data access frameworks (e.g., ORMs)

| Language | Framework | Recommended version | Support level |
|----------+-----+---------------------+---------------|
| Go | [GORM](build-a-go-app-with-cockroachdb-gorm.html)<hr>[upper/db](build-a-go-app-with-cockroachdb-upperdb.html) | [1.9.11](https://github.com/jinzhu/gorm/releases)<hr>[v4](https://github.com/upper/db/releases) | Full<hr>Full |
| Java | [Hibernate](build-a-java-app-with-cockroachdb-hibernate.html)<hr>[jOOQ](build-a-java-app-with-cockroachdb-jooq.html)<hr>[MyBatis](build-a-spring-app-with-cockroachdb-mybatis.html) | [5.4.19](https://hibernate.org/orm/releases/)<hr>[3.13.2](https://www.jooq.org/download/versions) (must be 3.13.0 or higher)<hr>[3.5.5 and higher](https://mybatis.org/mybatis-3/) | Full<hr>Full |
| Node.js | [Sequelize](build-a-nodejs-app-with-cockroachdb-sequelize.html) | [sequelize 5.21.9](https://www.npmjs.com/package/sequelize)<br>[sequelize-cockroachdb 1.1.0](https://www.npmjs.com/package/sequelize-cockroachdb) | Beta |
| Ruby | [ActiveRecord](build-a-ruby-app-with-cockroachdb-activerecord.html) | [activerecord 5.2](https://rubygems.org/gems/activerecord)<br>[activerecord-cockroachdb-adpater 5.2.0](https://rubygems.org/gems/activerecord-cockroachdb-adapter) | Full |
| Python | [Django](build-a-python-app-with-cockroachdb-django.html)<br><br><hr>[peewee](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database)<hr>[PonyORM](build-a-python-app-with-cockroachdb-pony.html)<hr>[SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html) | [Django 3.1.0](https://pypi.org/project/Django/)<br>[django-cockroachdb 3.1.0](https://pypi.org/project/django-cockroachdb/)<hr>[3.13.3](https://pypi.org/project/peewee/)<hr>[0.7.13](https://pypi.org/project/pony/)<hr>[SQLAlchemy 1.3.17](https://pypi.org/project/SQLAlchemy/)<br>[sqlalchemy-cockroachdb 1.3.0](https://pypi.org/project/sqlalchemy-cockroachdb/) | Full<br><br> <hr>Full<hr>Full<hr>Full |
| Typescript | [TypeORM](https://typeorm.io/#/) | [0.2.24](https://www.npmjs.com/package/typeorm) | Full |

## Application frameworks

| Framework | Data access | Recommended version | Support level |
|-----------+-------------+---------------------+---------------|
| Spring | [JDBC](build-a-spring-app-with-cockroachdb-jdbc.html)<hr>[JPA (Hibernate)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>jOOQ<hr>[MyBatis](build-a-spring-app-with-cockroachdb-mybatis.html) | See individual Java ORM or [driver](#drivers) for data access version support. | See individual Java ORM or [driver](#drivers) for data access support level. |

## Graphical user interfaces (GUIs)

| GUI | Recommended version | Support level |
|-----+---------------------+---------------|
| [Beekeeper Studio](https://beekeeperstudio.io) | [1.6.10 or higher](https://www.beekeeperstudio.io/get) | Full |
| [DBeaver](https://dbeaver.com/) | [5.2.3 or higher](https://dbeaver.com/download/) | Full |
| [DbVisualizer](https://www.dbvis.com/) | [10.0.22 or higher](https://www.dbvis.com/download/) | Beta |
| [Navicat for PostgreSQL](https://www.navicat.com/en/products/navicat-for-postgresql)/[Navicat Premium](https://www.navicat.com/en/products/navicat-premium) | [12.1.25 or higher](https://www.navicat.com/en/download/navicat-for-postgresql) | Beta |
| [Pgweb](http://sosedoff.github.io/pgweb/) | [0.9.12 or higher](https://github.com/sosedoff/pgweb/releases/latest) | Beta |
| [Postico](https://eggerapps.at/postico/) | 1.5.8 or higher | Beta |
| [TablePlus](https://tableplus.com/) | [Build 222 or higher](https://tableplus.com/download) | Beta |
| [Vault](https://www.vaultproject.io/docs/configuration/storage/cockroachdb.html) | [1.3.9 or higher](https://www.vaultproject.io/docs/install) | Beta |

## Integrated development environments (IDEs)

| IDE | Recommended version | Support level |
|-----+---------------------+---------------|
| [DataGrip](https://www.jetbrains.com/datagrip/) | [2019.1 or higher](https://www.jetbrains.com/datagrip/download) | Beta |
| [IntelliJ IDEA](https://www.jetbrains.com/idea/) | [2018.1 or higher](https://www.jetbrains.com/idea/download) | Beta |

## Schema migration tools

| Tool | Recommended version | Support level |
|-----+---------------------+---------------|
| [Flyway](flyway.html) | [7.1.0](https://flywaydb.org/documentation/commandline/#download-and-installation) or higher | Full |
| [Liquibase](liquibase.html) | [4.2.0](https://www.liquibase.org/download) or higher | Full |

## Other tools

| Tool | Recommended version | Support level |
|-----+---------------------+---------------|
| [Flowable](https://blog.flowable.org/2019/07/11/getting-started-with-flowable-and-cockroachdb/) | [6.4.2](https://github.com/flowable/flowable-engine/releases/tag/flowable-6.4.2) or higher | Full |
