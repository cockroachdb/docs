## Support levels

Cockroach Labs has partnered with open-source projects, vendors, and individuals to offer the following levels of support with third-party tools:

- **Full support** indicates that Cockroach Labs is committed to maintaining compatibility with the vast majority of the tool's features. CockroachDB is regularly tested against the latest version documented in the table below.
- **Partial support** indicates that Cockroach Labs is working towards full support for the tool. The primary features of the tool are compatible with CockroachDB (e.g., connecting and basic database operations), but full integration may require additional steps, lack support for all features, or exhibit unexpected behavior.
- **Partner supported** indicates that Cockroach Labs has a partnership with a third-party vendor that provides support for the CockroachDB integration with their tool.

{{site.data.alerts.callout_danger}}
Tools, drivers, or frameworks are considered **unsupported** if:

- The tool, driver, or framework is not listed on this page.
- The version of a supported tool, driver, or framework is not listed on this page.

If you encounter issues when using unsupported tools, drivers, or frameworks, contact the maintainer directly.

Cockroach Labs provides "best effort" support for tools, drivers, and frameworks that are not officially supported. This means that while we will do our best to assist you, we may not be able to fully troubleshoot errors in your deployment.

Customers should contact their account team before moving production workloads to CockroachDB that use unsupported drivers.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Unless explicitly stated, support for a [driver](#drivers) or [data access framework](#data-access-frameworks-e-g-orms) does not include [automatic, client-side transaction retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling). For client-side transaction retry handling samples, see [Example Apps]({% link {{ page.version.version }}/example-apps.md %}).
{{site.data.alerts.end}}

If you encounter problems using CockroachDB with any of the tools listed on this page, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward better support.

For a list of tools supported by the CockroachDB community, see [Third-Party Tools Supported by the Community]({% link {{ page.version.version }}/community-tooling.md %}).

## Drivers

| Language | Driver | Latest tested version | Support level | CockroachDB adapter | Tutorial |
|----------+--------+-----------------------+---------------------+---------------------+----------|
| C | [libpq](http://www.postgresql.org/docs/13/static/libpq.html)| PostgreSQL 13 | Partial | N/A | N/A |
| C# (.NET) | [Npgsql](https://www.nuget.org/packages/Npgsql/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/npgsql.go ||var npgsqlSupportedTag = "v||"\n\n %} | Full | N/A | [Build a C# App with CockroachDB (Npgsql)](build-a-csharp-app-with-cockroachdb.html) |
| Go | [pgx](https://github.com/jackc/pgx/releases)<br><br><hr>[pq](https://github.com/lib/pq) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/pgx.go ||var supportedPGXTag = "||"\n\n  %}<br>(use latest version of CockroachDB adapter)<hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/libpq.go ||var libPQSupportedTag = "||"\n\n %} | Full<br><br><hr>Full | [`crdbpgx`](https://pkg.go.dev/github.com/cockroachdb/cockroach-go/crdb/crdbpgx)<br>(includes client-side transaction retry handling)<hr>N/A | [Build a Go App with CockroachDB (pgx)](build-a-go-app-with-cockroachdb.html)<br><br><hr>[Build a Go App with CockroachDB (pq)](build-a-go-app-with-cockroachdb-pq.html) |
| Java | [JDBC](https://jdbc.postgresql.org/download/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/pgjdbc.go ||var supportedPGJDBCTag = "||"\n\n %} | Full | N/A | [Build a Java App with CockroachDB (JDBC)](build-a-java-app-with-cockroachdb.html) |
| JavaScript | [pg](https://www.npmjs.com/package/pg) | 8.2.1 | Full | N/A | [Build a Node.js App with CockroachDB (pg)](build-a-nodejs-app-with-cockroachdb.html) |
| Python | [psycopg3](https://www.psycopg.org/psycopg3/docs/)<br><br><hr>[psycopg2](https://www.psycopg.org/docs/install.html)<br><br><hr>[asyncpg](https://magicstack.github.io/asyncpg/current/index.html) | 3.0.16<br><br><hr>2.8.6<br><br><hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/asyncpg.go || var asyncpgSupportedTag = "||"\n\n  %} | Full<br><br><hr>Full<br><br><hr>Partial | N/A<br><br><hr>N/A<br><br><hr>N/A | [Build a Python App with CockroachDB (psycopg3)](build-a-python-app-with-cockroachdb-psycopg3.html)<br><br><hr>[Build a Python App with CockroachDB (psycopg2)](build-a-python-app-with-cockroachdb.html)<br><br><hr>[Build a Python App with CockroachDB (asyncpg)](build-a-python-app-with-cockroachdb-asyncpg.html) |
| Ruby | [pg](https://rubygems.org/gems/pg) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/ruby_pg.go ||var rubyPGVersion = "||"\n\n %} | Full | N/A | [Build a Ruby App with CockroachDB (pg)](build-a-ruby-app-with-cockroachdb.html) |
| Rust | [rust-postgres](https://github.com/sfackler/rust-postgres) | 0.19.2 | Partial | N/A | [Build a Rust App with CockroachDB]({% link {{ page.version.version }}/build-a-rust-app-with-cockroachdb.md %}) |

## Data access frameworks (e.g., ORMs)

| Language | Framework | Latest tested version | Support level | CockroachDB adapter | Tutorial |
|----------+-----------+-----------------------+---------------+---------------------+----------|
| Go | [GORM](https://github.com/jinzhu/gorm/releases)<br><br><hr>[go-pg](https://github.com/go-pg/pg)<hr>[upper/db](https://github.com/upper/db) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/gorm.go ||var gormSupportedTag = "||"\n\n %} <br><br><hr>{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/gopg.go ||var gopgSupportedTag = "||"\n\n %}<hr>v4 | Full<br><br><hr>Full<hr>Full | [`crdbgorm`](https://pkg.go.dev/github.com/cockroachdb/cockroach-go/crdb/crdbgorm)<br>(includes client-side transaction retry handling)<hr>N/A<hr>N/A | [Build a Go App with CockroachDB (GORM)](build-a-go-app-with-cockroachdb-gorm.html)<br><br><hr>N/A<hr>[Build a Go App with CockroachDB (upper/db)](build-a-go-app-with-cockroachdb-upperdb.html) |
| Java | [Hibernate](https://hibernate.org/orm/)<br>(including [Hibernate Spatial](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#spatial))<hr>[jOOQ](https://www.jooq.org/)<hr>[MyBatis](https://mybatis.org/mybatis-3/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/hibernate.go ||var supportedHibernateTag = "||"\n\n %} (must be at least 5.4.19)<br><br><hr>3.13.2 (must be at least 3.13.0)<hr>3.5.5| Full<br><br><hr>Full<hr>Full | N/A<br><br><hr>N/A<hr>N/A | [Build a Java App with CockroachDB (Hibernate)](build-a-java-app-with-cockroachdb-hibernate.html)<br><br><hr>[Build a Java App with CockroachDB (jOOQ)](build-a-java-app-with-cockroachdb-jooq.html)<hr>[Build a Spring App with CockroachDB (MyBatis)]({% link {{ page.version.version }}/build-a-spring-app-with-cockroachdb-mybatis.md %}) |
| JavaScript/TypeScript | [Sequelize](https://www.npmjs.com/package/sequelize)<br><br><hr>[Knex.js](https://knexjs.org/)<hr>[Prisma](https://prisma.io)<hr>[TypeORM](https://www.npmjs.com/package/typeorm) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/sequelize.go ||var supportedSequelizeCockroachDBRelease = "||"\n\n %}<br>(use latest version of CockroachDB adapter)<hr> {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/knex.go ||const supportedKnexTag = "||"\n\n %} <hr> 3.14.0 <hr> 0.3.17 {% comment %}{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/typeorm.go ||const supportedTypeORMRelease = "||"\n %}{% endcomment %}  | Full<br><br><hr>Full<hr>Full<hr>Full | [`sequelize-cockroachdb`](https://www.npmjs.com/package/sequelize-cockroachdb)<br><br><hr>N/A<hr>N/A<hr>N/A | [Build a Node.js App with CockroachDB (Sequelize)](build-a-nodejs-app-with-cockroachdb-sequelize.html)<br><br><hr>[Build a Node.js App with CockroachDB (Knex.js)](build-a-nodejs-app-with-cockroachdb-knexjs.html)<hr>[Build a Node.js App with CockroachDB (Prisma)](build-a-nodejs-app-with-cockroachdb-prisma.html)<hr>[Build a TypeScript App with CockroachDB (TypeORM)](build-a-typescript-app-with-cockroachdb.html) |
| Ruby | [ActiveRecord](https://rubygems.org/gems/activerecord)<br>[RGeo/RGeo-ActiveRecord](https://github.com/cockroachdb/activerecord-cockroachdb-adapter#working-with-spatial-data) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/activerecord.go ||var supportedRailsVersion = "||"\nvar %}<br>(use latest version of CockroachDB adapter) | Full | [`activerecord-cockroachdb-adapter`](https://rubygems.org/gems/activerecord-cockroachdb-adapter)<br>(includes client-side transaction retry handling) | [Build a Ruby App with CockroachDB (ActiveRecord)](build-a-ruby-app-with-cockroachdb-activerecord.html) |
| Python | [Django](https://pypi.org/project/Django/)<br>(including [GeoDjango](https://docs.djangoproject.com/en/3.1/ref/contrib/gis/))<hr>[peewee](https://github.com/coleifer/peewee/)<hr>[SQLAlchemy](https://www.sqlalchemy.org/) | {% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/master/pkg/cmd/roachtest/tests/django.go ||var djangoSupportedTag = "cockroach-||"\nvar %}<br>(use latest version of CockroachDB adapter)<br><hr>3.13.3<hr>0.7.13<hr>1.4.17<br>(use latest version of CockroachDB adapter) | Full<br><br><hr>Full<hr>Full<hr>Full | [`django-cockroachdb`](https://pypi.org/project/django-cockroachdb/)<br><br><hr>N/A<hr>N/A<hr>[`sqlalchemy-cockroachdb`](https://pypi.org/project/sqlalchemy-cockroachdb)<br>(includes client-side transaction retry handling) | [Build a Python App with CockroachDB (Django)](build-a-python-app-with-cockroachdb-django.html)<br><br><hr>N/A (See [peewee docs](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database).)<hr>[Build a Python App with CockroachDB (SQLAlchemy)](build-a-python-app-with-cockroachdb-sqlalchemy.html) |

## Application frameworks

| Framework | Data access | Latest tested version | Support level | Tutorial |
|-----------+-------------+-----------------------+---------------+----------|
| Spring | [JDBC]({% link {{ page.version.version }}/build-a-spring-app-with-cockroachdb-jdbc.md %})<hr>[JPA (Hibernate)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>[MyBatis]({% link {{ page.version.version }}/build-a-spring-app-with-cockroachdb-mybatis.md %}) | See individual Java ORM or [driver](#drivers) for data access version support. | See individual Java ORM or [driver](#drivers) for data access support level. | [Build a Spring App with CockroachDB (JDBC)]({% link {{ page.version.version }}/build-a-spring-app-with-cockroachdb-jdbc.md %})<hr>[Build a Spring App with CockroachDB (JPA)](build-a-spring-app-with-cockroachdb-jpa.html)<hr>[Build a Spring App with CockroachDB (MyBatis)]({% link {{ page.version.version }}/build-a-spring-app-with-cockroachdb-mybatis.md %})

## Graphical user interfaces (GUIs)

| GUI | Latest tested version | Support level | Tutorial |
|-----+-----------------------+---------------+----------|
| [DBeaver](https://dbeaver.com/) | 5.2.3 | Full | [Visualize CockroachDB Schemas with DBeaver]({% link {{ page.version.version }}/dbeaver.md %})
| [ChartDB](https://chartdb.io/) | 1.4.0 | Full | [Visualize CockroachDB Schemas with ChartDB]({% link {{ page.version.version }}/chartdb.md %})

## Integrated development environments (IDEs)

| IDE | Latest tested version | Support level | Tutorial |
|-----+-----------------------+---------------+----------|
| [DataGrip](https://www.jetbrains.com/datagrip/) | 2024.1 | Full | N/A
| [IntelliJ IDEA](https://www.jetbrains.com/idea/) | 2024.1 | Full | [Use IntelliJ IDEA with CockroachDB]({% link {{ page.version.version }}/intellij-idea.md %})

## Enhanced data security tools

| Tool | Support level | Integration |
|-----+---------------+----------|
| [Satori](https://satoricyber.com/) | Partner supported | [Satori Integration]({% link {{ page.version.version }}/satori-integration.md %}) |
| [HashiCorp Vault](https://www.vaultproject.io/) | Partner supported | [HashiCorp Vault Integration]({% link {{ page.version.version }}/hashicorp-integration.md %}) |

## Schema migration tools

| Tool | Latest tested version | Support level | Tutorial |
|-----+------------------------+----------------+----------|
| [Alembic](https://alembic.sqlalchemy.org/en/latest/) | 1.7 | Full | [Migrate CockroachDB Schemas with Alembic]({% link {{ page.version.version }}/alembic.md %})
| [Flyway](https://flywaydb.org/documentation/commandline/#download-and-installation) | 7.1.0 | Full | [Migrate CockroachDB Schemas with Flyway]({% link {{ page.version.version }}/flyway.md %})
| [Liquibase](https://www.liquibase.org/download) | 4.2.0 | Full | [Migrate CockroachDB Schemas with Liquibase]({% link {{ page.version.version }}/liquibase.md %})
| [Prisma](https://prisma.io) | 3.14.0 | Full | [Build a Node.js App with CockroachDB (Prisma)](build-a-nodejs-app-with-cockroachdb-prisma.html)

## Data migration tools

| Tool | Latest tested version | Support level | Documentation |
|-----+------------------------+----------------+----------|
| [AWS DMS](https://aws.amazon.com/dms/) | 3.4.6 | Full | [Migrate with AWS Database Migration Service (DMS)](aws-dms.html)
| [Qlik Replicate](https://www.qlik.com/us/products/qlik-replicate) | November 2022 | Full | [Migrate and Replicate Data with Qlik Replicate]({% link {{ page.version.version }}/qlik.md %})
| [Striim](https://www.striim.com) | 4.1.2 | Full | [Migrate and Replicate Data with Striim]({% link {{ page.version.version }}/striim.md %})
| [Oracle GoldenGate](https://www.oracle.com/integration/goldengate/) | 21.3 | Partial | [Migrate and Replicate Data with Oracle GoldenGate]({% link {{ page.version.version }}/goldengate.md %})
| [Debezium](https://debezium.io/) | 2.4 | Full | [Migrate Data with Debezium]({% link {{ page.version.version }}/debezium.md %})

## Provisioning tools
| Tool | Latest tested version | Support level | Documentation |
|------+-----------------------+---------------+---------------|
| [Terraform](https://terraform.io/) | 1.3.2 | Partial | [Terraform provider for CockroachDB Cloud](https://github.com/cockroachdb/terraform-provider-cockroach#get-started) |

## Other tools

| Tool | Latest tested version | Support level | Tutorial |
|-----+------------------------+---------------+----------|
| [Delphix](https://www.delphix.com/) | 29.0.0.1 | Partner supported | [Provision, mask, and integrate data with Delphix (external)](https://www.delphix.com/blog/modern-database-meets-modern-devops-data-platform)
| [Flowable](https://github.com/flowable/flowable-engine) | 6.4.2 | Full | [Getting Started with Flowable and CockroachDB (external)](https://blog.flowable.org/2019/07/11/getting-started-with-flowable-and-cockroachdb/)
