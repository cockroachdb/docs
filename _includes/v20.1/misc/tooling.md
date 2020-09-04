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
| Java | [JDBC](build-a-java-app-with-cockroachdb.html) | [42.2.12](https://jdbc.postgresql.org/download.html#current) | Full |
| Node.js | [pg](build-a-nodejs-app-with-cockroachdb.html) | [8.2.1](https://www.npmjs.com/package/pg) | Beta |
| PHP | [php-pgsql](build-a-php-app-with-cockroachdb.html) | [PHP 7.4.6](https://www.php.net/downloads) | Beta |
| Python | [psycopg2](build-a-python-app-with-cockroachdb.html) | [2.8.6](https://www.psycopg.org/docs/install.html) | Full |
| Ruby | [pg](build-a-ruby-app-with-cockroachdb.html) | [1.2.3](https://rubygems.org/gems/pg) | Beta |
| Rust | <a href="https://crates.io/crates/postgres/" data-proofer-ignore>postgres</a> {% comment %} This link is in HTML instead of Markdown because HTML proofer dies bc of https://github.com/rust-lang/crates.io/issues/163 {% endcomment %} | [0.17.3](https://crates.io/crates/postgres/) | Beta |

## Object-relational mappers (ORMs)

| Language | ORM | Recommended version | Support level |
|----------+-----+---------------------+---------------|
| Go | [GORM](build-a-go-app-with-cockroachdb-gorm.html) | [1.9.11](https://github.com/jinzhu/gorm/releases) | Full |
| Java | [Hibernate](build-a-java-app-with-cockroachdb-hibernate.html)<hr>[jOOQ](build-a-java-app-with-cockroachdb-jooq.html) | [5.4](https://hibernate.org/orm/releases/)<hr>[3.13.2](https://www.jooq.org/download/versions) (must be 3.13.0 or higher) | Full<hr>Full |
| Node.js | [Sequelize](build-a-nodejs-app-with-cockroachdb-sequelize.html) | [sequelize 5.21.9](https://www.npmjs.com/package/sequelize)<br>[sequelize-cockroachdb 1.1.0](https://www.npmjs.com/package/sequelize-cockroachdb) | Beta |
| Ruby | [ActiveRecord](build-a-ruby-app-with-cockroachdb-activerecord.html) | [activerecord 5.2](https://rubygems.org/gems/activerecord)<br>[activerecord-cockroachdb-adpater 5.2.0](https://rubygems.org/gems/activerecord-cockroachdb-adapter) | Full (v20.1 and later) |
| Python | [Django](build-a-python-app-with-cockroachdb-django.html)<br><br><hr>[peewee](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database)<hr>[PonyORM](build-a-python-app-with-cockroachdb-pony.html)<hr>[SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html) | [Django 3.0.6](https://pypi.org/project/Django/)<br>[django-cockroachdb 3.0.1](https://pypi.org/project/django-cockroachdb/)<hr>[3.13.3](https://pypi.org/project/peewee/)<hr>[0.7.13](https://pypi.org/project/pony/)<hr>[SQLAlchemy 1.3.17](https://pypi.org/project/SQLAlchemy/)<br>[sqlalchemy-cockroachdb 1.3.0](https://pypi.org/project/sqlalchemy-cockroachdb/) | Full<br><br> <hr>Full<hr>Full<hr>Full |
| Typescript | [TypeORM](https://typeorm.io/#/) | [0.2.24](https://www.npmjs.com/package/typeorm) | Full |

## Application frameworks

| Framework | Data access | Recommended version | Support level |
|-----------+-------------+---------------------+---------------|
| Spring | [JDBC](build-a-spring-app-with-cockroachdb-jdbc.html)<hr>[JPA (Hibernate)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>jOOQ<hr>MyBatis | See individual Java [ORM](#object-relational-mappers-orms) or [driver](#drivers) for data access version support. | See individual Java [ORM](#object-relational-mappers-orms) or [driver](#drivers) for data access support level. |

## Graphical user interfaces (GUIs)

| GUI | Recommended version | Support level |
|-----+---------------------+---------------|
| [DBeaver](dbeaver.html) | [5.2.3](https://dbeaver.io/download/) or higher | Full |
| [Beekeeper Studio](https://beekeeperstudio.io) | [1.6.10](https://beekeeperstudio.io) or higher | Full |

## Integrated development environments (IDEs)

| IDE | Recommended version | Support level |
|-----+---------------------+---------------|
| [IntelliJ IDEA](intellij-idea.html) | [2018.1](https://www.jetbrains.com/idea/download/other.html) | Beta |

## Schema migration tools

| Tool | Recommended version | Support level |
|-----+---------------------+---------------|
| [Flyway](flyway.html) | [6.4.2](https://flywaydb.org/documentation/commandline/#download-and-installation) or higher | Full |
