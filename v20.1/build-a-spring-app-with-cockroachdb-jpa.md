---
title: Build a Spring App with CockroachDB and JPA
summary: Learn how to use CockroachDB from a Spring application with Spring Data JPA and Hibernate.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-spring-app-with-cockroachdb-jdbc.html"><button style="width: 28%" class="filter-button">Use <strong>JDBC</strong></button></a>
    <a href="build-a-spring-app-with-cockroachdb-jpa.html"><button style="width: 28%" class="filter-button current">Use <strong>JPA</strong></button></a>
</div>

This tutorial shows you how to build a [Spring Boot](https://spring.io/projects/spring-boot) web application with CockroachDB, using the [Spring Data JPA](https://spring.io/projects/spring-data-jpa) module for data access. The code for the example application is available for download from [GitHub](https://github.com/cockroachlabs/roach-data/tree/master), along with identical examples that use [JDBC](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jdbc), [jOOQ](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jooq), and [MyBatis](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-mybatis) for data access.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install JDK

Download and install a Java Development Kit. Spring Boot supports Java versions 8, 11, and 14. In this tutorial, we use [JDK 8 from OpenJDK](https://openjdk.java.net/install/).

## Step 2. Install Maven

This example application uses [Maven](http://maven.apache.org/) to manage all application dependencies. Spring supports Maven versions 3.2 and later.

To install Maven on macOS, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ brew install maven
~~~

To install Maven on a Debian-based Linux distribution like Ubuntu:

{% include copy-clipboard.html %}
~~~ shell
$ apt-get install maven
~~~

To install Maven on a Red Hat-based Linux distribution like Fedora:

{% include copy-clipboard.html %}
~~~ shell
$ dnf install maven
~~~

For other ways to install Maven, see [its official documentation](http://maven.apache.org/install.html).

## Step 3. Get the application code

To get the application code, download or clone the [`roach-data` repository](https://github.com/cockroachlabs/roach-data). The code for the example JPA application is located under the `roach-data-jpa` directory.

(*Optional*) To recreate the application project structure with the same dependencies as those used by this sample application, you can use [Spring initializr](https://start.spring.io/) with the following settings:

**Project**

- Maven Project

**Language**

- Java

**Spring Boot**

- 2.2.6

**Project Metadata**

- Group: io.roach
- Artifact: data
- Name: data
- Package name: io.roach.data
- Packaging: Jar
- Java: 8

**Dependencies**

- Spring Web
- Spring Data JPA
- Spring HATEOS
- Liquibase Migration
- PostgreSQL Driver

The [Hibernate CockroachDB dialect](https://in.relation.to/2020/07/27/hibernate-orm-5419-final-release/) is supported in Hibernate v5.4.19+. At the time of writing this tutorial, Spring Data JPA used Hibernate v5.4.15 as its default JPA provider. To specify a different version of Hibernate than the default, add an additional entry to your application's `pom.xml` file, as shown in [the `roach-data` GitHub repo](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jpa/pom.xml):

~~~ xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>5.4.19.Final</version>
</dependency>
~~~

## Step 4. Create the `maxroach` user and `roach_data` database

<section class="filter-content" markdown="1" data-scope="secure">

Start the [built-in SQL shell](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

In the SQL shell, issue the following statements to create the `maxroach` user and `roach_data` database:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE roach_data;
~~~

Give the `maxroach` user the necessary permissions:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE roach_data TO maxroach;
~~~

Exit the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

## Step 5. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key --also-generate-pkcs8-key
~~~

The [`--also-generate-pkcs8-key` flag](cockroach-cert.html#flag-pkcs8) generates a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java. In this case, the generated PKCS8 key will be named `client.maxroach.key.pk8`.

## Step 6. Run the application

Compiling and running the application code will start a web application, initialize the `accounts` table in the `roach_data` database, and submit some requests to the app's REST API that result in [atomic database transactions](transactions.html) on the running CockroachDB cluster. For details about the application code, see [Implementation details](#implementation-details).

Open the `roach-data/roach-data-jpa` project folder in a text editor or IDE, and edit the `roach-data/roach-data-jpa/src/main/resources/application.yml` file so that:

  - The `url` field specifies the full [connection string](connection-parameters.html#connect-using-a-url) to the [running CockroachDB cluster](#before-you-begin). To connect to a secure cluster, this connection string must set the `sslmode` connection parameter to `require`, and specify the full path to the client, node, and use certificates in the connection parameters. For example:

      ~~~ yml
      ...
      datasource:
        url: jdbc:postgresql://localhost:26257/roach_data?ssl=true&sslmode=require&sslrootcert=certs/ca.crt&sslkey=certs/client.maxroach.key.pk8&sslcert=certs/client.maxroach.crt
      ...
      ~~~

  - The `username` field specifies `maxroach` as the user:

      ~~~ yml
      ...
        username: maxroach
      ...
      ~~~

Open a terminal, and navigate to the `roach-data-jpa` project subfolder:

{% include copy-clipboard.html %}
~~~ shell
$ cd <path>/roach-data/roach-data-jpa
~~~

Use Maven to download the application dependencies and compile the code:

{% include copy-clipboard.html %}
~~~ shell
$ mvn clean install
~~~

From the `roach-data-jpa` directory, run the application JAR file:

{% include copy-clipboard.html %}
~~~ shell
$ java -jar target/roach-data-jpa.jar
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

Start the [built-in SQL shell](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

In the SQL shell, issue the following statements to create the `maxroach` user and `roach_data` database:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE roach_data;
~~~

Give the `maxroach` user the necessary permissions:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE roach_data TO maxroach;
~~~

Exit the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

## Step 6. Run the application

Compiling and running the application code will start a web application, initialize the `accounts` table in the `roach_data` database, and submit some requests to the app's REST API that result in database transactions on the running CockroachDB cluster. For details about the application code, [see below](#implementation-details).

Open the `roach-data/roach-data-jpa` project folder in a text editor or IDE, and edit the `roach-data/roach-data-jpa/src/main/resources/application.yml` file so that:

  - The `url` field specifies the correct [connection string](connection-parameters.html#connect-using-a-url) to the [running CockroachDB cluster](#before-you-begin). For example:

      ~~~ yml
      ...
      datasource:
        url: jdbc:postgresql://localhost:26257/roach_data?ssl=true&sslmode=disable
      ...
      ~~~

  - The `username` field specifies `maxroach` as the user:

      ~~~ yml
      ...
        username: maxroach
      ...
      ~~~

Open a terminal, and navigate to the `roach-data-jpa` project subfolder:

{% include copy-clipboard.html %}
~~~ shell
$ cd <path>/roach-data/roach-data-jpa
~~~

Use Maven to download the application dependencies and compile the code:

{% include copy-clipboard.html %}
~~~ shell
$ mvn clean install
~~~

From the `roach-data-jpa` directory, run the application JAR file:

{% include copy-clipboard.html %}
~~~ shell
$ java -jar target/roach-data-jpa.jar
~~~

</section>

The output should look like the following:

~~~
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.2.7.RELEASE)

2020-06-22 11:54:46.243  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Starting JpaApplication v1.0.0.BUILD-SNAPSHOT on MyComputer.local with PID 81343 (path/code/roach-data/roach-data-jpa/target/roach-data-jpa.jar started by user in path/code/roach-data/roach-data-jpa)
2020-06-22 11:54:46.246  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : No active profile set, falling back to default profiles: default
2020-06-22 11:54:46.929  INFO 81343 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Multiple Spring Data modules found, entering strict repository configuration mode!
2020-06-22 11:54:46.930  INFO 81343 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2020-06-22 11:54:47.023  INFO 81343 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 80ms. Found 1 JPA repository interfaces.
2020-06-22 11:54:47.211  INFO 81343 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Multiple Spring Data modules found, entering strict repository configuration mode!
2020-06-22 11:54:47.211  INFO 81343 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JDBC repositories in DEFAULT mode.
2020-06-22 11:54:47.224  INFO 81343 --- [           main] .RepositoryConfigurationExtensionSupport : Spring Data JDBC - Could not safely identify store assignment for repository candidate interface io.roach.data.jpa.AccountRepository. If you want this repository to be a JDBC repository, consider annotating your entities with one of these annotations: org.springframework.data.relational.core.mapping.Table.
2020-06-22 11:54:47.224  INFO 81343 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 12ms. Found 0 JDBC repository interfaces.
2020-06-22 11:54:47.913  INFO 81343 --- [           main] org.eclipse.jetty.util.log               : Logging initialized @2990ms to org.eclipse.jetty.util.log.Slf4jLog
2020-06-22 11:54:47.982  INFO 81343 --- [           main] o.s.b.w.e.j.JettyServletWebServerFactory : Server initialized with port: 8080
2020-06-22 11:54:47.985  INFO 81343 --- [           main] org.eclipse.jetty.server.Server          : jetty-9.4.28.v20200408; built: 2020-04-08T17:49:39.557Z; git: ab228fde9e55e9164c738d7fa121f8ac5acd51c9; jvm 11.0.7+10
2020-06-22 11:54:48.008  INFO 81343 --- [           main] o.e.j.s.h.ContextHandler.application     : Initializing Spring embedded WebApplicationContext
2020-06-22 11:54:48.008  INFO 81343 --- [           main] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1671 ms
2020-06-22 11:54:48.123  INFO 81343 --- [           main] org.eclipse.jetty.server.session         : DefaultSessionIdManager workerName=node0
2020-06-22 11:54:48.123  INFO 81343 --- [           main] org.eclipse.jetty.server.session         : No SessionScavenger set, using defaults
2020-06-22 11:54:48.124  INFO 81343 --- [           main] org.eclipse.jetty.server.session         : node0 Scavenging every 660000ms
2020-06-22 11:54:48.130  INFO 81343 --- [           main] o.e.jetty.server.handler.ContextHandler  : Started o.s.b.w.e.j.JettyEmbeddedWebAppContext@41394595{application,/,[file:///private/var/folders/pg/r58v54857gq_1nqm_2tr6lg40000gn/T/jetty-docbase.7785392427958606416.8080/],AVAILABLE}
2020-06-22 11:54:48.131  INFO 81343 --- [           main] org.eclipse.jetty.server.Server          : Started @3207ms
2020-06-22 11:54:48.201  INFO 81343 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2020-06-22 11:54:48.483  INFO 81343 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2020-06-22 11:54:49.507  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-06-22 11:54:49.522  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : CREATE TABLE public.databasechangeloglock (ID INTEGER NOT NULL, LOCKED BOOLEAN NOT NULL, LOCKGRANTED TIMESTAMP WITHOUT TIME ZONE, LOCKEDBY VARCHAR(255), CONSTRAINT DATABASECHANGELOGLOCK_PKEY PRIMARY KEY (ID))
2020-06-22 11:54:49.535  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-06-22 11:54:49.554  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : DELETE FROM public.databasechangeloglock
2020-06-22 11:54:49.555  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.databasechangeloglock (ID, LOCKED) VALUES (1, FALSE)
2020-06-22 11:54:49.562  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT LOCKED FROM public.databasechangeloglock WHERE ID=1
2020-06-22 11:54:49.570  INFO 81343 --- [           main] l.lockservice.StandardLockService        : Successfully acquired change log lock
2020-06-22 11:54:50.519  INFO 81343 --- [           main] l.c.StandardChangeLogHistoryService      : Creating database history table with name: public.databasechangelog
2020-06-22 11:54:50.520  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : CREATE TABLE public.databasechangelog (ID VARCHAR(255) NOT NULL, AUTHOR VARCHAR(255) NOT NULL, FILENAME VARCHAR(255) NOT NULL, DATEEXECUTED TIMESTAMP WITHOUT TIME ZONE NOT NULL, ORDEREXECUTED INTEGER NOT NULL, EXECTYPE VARCHAR(10) NOT NULL, MD5SUM VARCHAR(35), DESCRIPTION VARCHAR(255), COMMENTS VARCHAR(255), TAG VARCHAR(255), LIQUIBASE VARCHAR(20), CONTEXTS VARCHAR(255), LABELS VARCHAR(255), DEPLOYMENT_ID VARCHAR(10))
2020-06-22 11:54:50.534  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangelog
2020-06-22 11:54:50.547  INFO 81343 --- [           main] l.c.StandardChangeLogHistoryService      : Reading from public.databasechangelog
2020-06-22 11:54:50.548  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT * FROM public.databasechangelog ORDER BY DATEEXECUTED ASC, ORDEREXECUTED ASC
2020-06-22 11:54:50.550  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-06-22 11:54:50.566  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : create table account
(
    id      int            not null primary key default unique_rowid(),
    balance numeric(19, 2) not null,
    name    varchar(128)   not null,
    type    varchar(25)    not null
)
2020-06-22 11:54:50.575  INFO 81343 --- [           main] liquibase.changelog.ChangeSet            : SQL in file db/create.sql executed
2020-06-22 11:54:50.581  INFO 81343 --- [           main] liquibase.changelog.ChangeSet            : ChangeSet classpath:db/changelog-master.xml::1::root ran successfully in 16ms
2020-06-22 11:54:50.585  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT MAX(ORDEREXECUTED) FROM public.databasechangelog
2020-06-22 11:54:50.589  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1', 'root', 'classpath:db/changelog-master.xml', NOW(), 1, '8:567321cdb0100cbe76731a7ed414674b', 'sqlFile', '', 'EXECUTED', 'crdb', NULL, '3.8.9', '2852090551')
2020-06-22 11:54:50.593  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('1', 'Alice', 500.00, 'asset')
2020-06-22 11:54:50.601  INFO 81343 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-22 11:54:50.602  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('2', 'Bob', 500.00, 'expense')
2020-06-22 11:54:50.603  INFO 81343 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-22 11:54:50.604  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('3', 'Bobby Tables', 500.00, 'asset')
2020-06-22 11:54:50.605  INFO 81343 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-22 11:54:50.605  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('4', 'Doris', 500.00, 'expense')
2020-06-22 11:54:50.606  INFO 81343 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-22 11:54:50.608  INFO 81343 --- [           main] liquibase.changelog.ChangeSet            : ChangeSet classpath:db/changelog-master.xml::2::root ran successfully in 16ms
2020-06-22 11:54:50.609  INFO 81343 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('2', 'root', 'classpath:db/changelog-master.xml', NOW(), 2, '8:c2945f2a445cf60b4b203e1a91d14a89', 'insert tableName=account; insert tableName=account; insert tableName=account; insert tableName=account', '', 'EXECUTED', 'crdb', NULL, '3.8.9', '2852090551')
2020-06-22 11:54:50.615  INFO 81343 --- [           main] l.lockservice.StandardLockService        : Successfully released change log lock
2020-06-22 11:54:50.727  INFO 81343 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2020-06-22 11:54:50.817  INFO 81343 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 5.4.19.Final
2020-06-22 11:54:50.993  INFO 81343 --- [           main] o.hibernate.annotations.common.Version   : HCANN000001: Hibernate Commons Annotations {5.1.0.Final}
2020-06-22 11:54:51.154  INFO 81343 --- [           main] org.hibernate.dialect.Dialect            : HHH000400: Using dialect: org.hibernate.dialect.CockroachDB201Dialect
2020-06-22 11:54:51.875  INFO 81343 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000490: Using JtaPlatform implementation: [org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform]
2020-06-22 11:54:51.886  INFO 81343 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2020-06-22 11:54:52.700  INFO 81343 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2020-06-22 11:54:52.958  INFO 81343 --- [           main] o.e.j.s.h.ContextHandler.application     : Initializing Spring DispatcherServlet 'dispatcherServlet'
2020-06-22 11:54:52.958  INFO 81343 --- [           main] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2020-06-22 11:54:52.966  INFO 81343 --- [           main] o.s.web.servlet.DispatcherServlet        : Completed initialization in 8 ms
2020-06-22 11:54:52.997  INFO 81343 --- [           main] o.e.jetty.server.AbstractConnector       : Started ServerConnector@1568159{HTTP/1.1, (http/1.1)}{0.0.0.0:8080}
2020-06-22 11:54:52.999  INFO 81343 --- [           main] o.s.b.web.embedded.jetty.JettyWebServer  : Jetty started on port(s) 8080 (http/1.1) with context path '/'
2020-06-22 11:54:53.001  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Started JpaApplication in 7.518 seconds (JVM running for 8.077)
2020-06-22 11:54:53.002  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Lets move some $$ around!
2020-06-22 11:54:54.399  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 7 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 6 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 5 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 4 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 3 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 2 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 1 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : Worker finished - 0 remaining
2020-06-22 11:54:54.447  INFO 81343 --- [           main] io.roach.data.jpa.JpaApplication         : All client workers finished but server keeps running. Have a nice day!
~~~

As the output states, the application configures a database connection, starts a web servlet listening on the address `http://localhost:8080/`, initializes the `account` table and changelog tables with [Liquibase](https://www.liquibase.org/), and then runs some test operations as requests to the application's REST API.

For more details about the application code, see [Implementation details](#implementation-details).

### Query the database

#### Reads

The `http://localhost:8080/account` endpoint returns information about all accounts in the database. `GET` requests to these endpoints are executed on the database as `SELECT` statements.

The following `curl` command sends a `GET` request to the endpoint. The `json_pp` command formats the JSON response.

{% include copy-clipboard.html %}
~~~ shell
$ curl -X GET http://localhost:8080/account | json_pp
~~~

~~~
{
   "_embedded" : {
      "accounts" : [
         {
            "_links" : {
               "self" : {
                  "href" : "http://localhost:8080/account/1"
               }
            },
            "balance" : 500,
            "name" : "Alice",
            "type" : "asset"
         },
         {
            "_links" : {
               "self" : {
                  "href" : "http://localhost:8080/account/2"
               }
            },
            "balance" : 500,
            "name" : "Bob",
            "type" : "expense"
         },
         {
            "_links" : {
               "self" : {
                  "href" : "http://localhost:8080/account/3"
               }
            },
            "balance" : 500,
            "name" : "Bobby Tables",
            "type" : "asset"
         },
         {
            "_links" : {
               "self" : {
                  "href" : "http://localhost:8080/account/4"
               }
            },
            "balance" : 500,
            "name" : "Doris",
            "type" : "expense"
         }
      ]
   },
   "_links" : {
      "self" : {
         "href" : "http://localhost:8080/account?page=0&size=5"
      }
   },
   "page" : {
      "number" : 0,
      "size" : 5,
      "totalElements" : 4,
      "totalPages" : 1
   }
}
~~~

For a single account, specify the account number in the endpoint. For example, to see information about the accounts `1` and `2`:

{% include copy-clipboard.html %}
~~~ shell
$ curl -X GET http://localhost:8080/account/1 | json_pp
~~~

~~~
{
   "_links" : {
      "self" : {
         "href" : "http://localhost:8080/account/1"
      }
   },
   "balance" : 500,
   "name" : "Alice",
   "type" : "asset"
}
~~~

{% include copy-clipboard.html %}
~~~ shell
$ curl -X GET http://localhost:8080/account/2 | json_pp
~~~

~~~
{
   "_links" : {
      "self" : {
         "href" : "http://localhost:8080/account/2"
      }
   },
   "balance" : 500,
   "name" : "Bob",
   "type" : "expense"
}
~~~

The `http://localhost:8080/transfer` endpoint performs transfers between accounts. `POST` requests to this endpoint are executed as writes (i.e., [`INSERT`s](insert.html) and [`UPDATE`s](update.html)) to the database.

#### Writes

To make a transfer, send a `POST` request to the `transfer` endpoint, using the arguments specified in the `"href`" URL (i.e., `http://localhost:8080/transfer%7B?fromId,toId,amount`).

{% include copy-clipboard.html %}
~~~ shell
$ curl -X POST -d fromId=2 -d toId=1 -d amount=150 http://localhost:8080/transfer
~~~

You can use the `accounts` endpoint to verify that the transfer was successfully completed:

{% include copy-clipboard.html %}
~~~ shell
$ curl -X GET http://localhost:8080/account/1 | json_pp
~~~

~~~
{
   "_links" : {
      "self" : {
         "href" : "http://localhost:8080/account/1"
      }
   },
   "balance" : 650,
   "name" : "Alice",
   "type" : "asset"
}
~~~

{% include copy-clipboard.html %}
~~~ shell
$ curl -X GET http://localhost:8080/account/2 | json_pp
~~~

~~~
{
   "_links" : {
      "self" : {
         "href" : "http://localhost:8080/account/2"
      }
   },
   "balance" : 350,
   "name" : "Bob",
   "type" : "expense"
}
~~~

## Implementation details

This section walks you through the different components of the application project in detail.

### Main application process

`JpaApplication.java` defines the application's main process. It starts a Spring Boot web application, and then submits requests to the app's REST API that result in database transactions on the CockroachDB cluster.

Here are the contents of [`JpaApplication.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jpa/src/main/java/io/roach/data/jpa/JpaApplication.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jpa/JpaApplication.java %}
~~~

The annotations listed at the top of the `JpaApplication` class definition declare some important configuration properties for the entire application:

- [`@EnableHypermediaSupport`](https://docs.spring.io/spring-hateoas/docs/current/api/org/springframework/hateoas/config/EnableHypermediaSupport.html) enables [hypermedia support for resource representation](https://en.wikipedia.org/wiki/HATEOAS) in the application. Currently, the only hypermedia format supported by Spring is [HAL](https://en.wikipedia.org/wiki/Hypertext_Application_Language), and so the `type = EnableHypermediaSupport.HypermediaType.HAL`. For details, see [Hypermedia representation](#hypermedia-representation).
- [`@EnableJpaRepositories`](https://docs.spring.io/spring-data/data-jpa/docs/current/api/org/springframework/data/jpa/repository/config/EnableJpaRepositories.html) enables the creation of [Spring repositories](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories) for data access using [Spring Data JPA](https://spring.io/projects/spring-data-jpa). For details, see [Spring repositories](#spring-repositories).
- [`@EnableAspectJAutoProxy`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/EnableAspectJAutoProxy.html) enables the use of [`@AspectJ` annotations for declaring aspects](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj). For details, see [Transaction management](#transaction-management).
- [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html) enables [declarative transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) in the application. For details, see [Transaction management](#transaction-management).

    Note that the `@EnableTransactionManagement` annotation is passed an `order` parameter, which indicates the ordering of advice evaluation when a common join point is reached. For details, see [Ordering advice](#ordering-advice).
- [`@SpringBootApplication`](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/autoconfigure/SpringBootApplication.html) is a standard configuration annotation used by Spring Boot applications. For details, see [Using the @SpringBootApplication](https://docs.spring.io/spring-boot/docs/current/reference/html/using-spring-boot.html#using-boot-using-springbootapplication-annotation) on the Spring Boot documentation site.

### Schema management

To create and initialize the database schema, the application uses [Liquibase](https://www.liquibase.org/).

Liquibase uses files called [changelogs](https://docs.liquibase.com/concepts/basic/changelog.html) to manage the changes to the database. Changelog files include a list of instructions, known as [changesets](https://docs.liquibase.com/concepts/basic/changeset.html), that are executed against the database in a specified order.

`resources/db/changelog-master.xml` defines the changelog for this application:

{% include copy-clipboard.html %}
~~~ xml
{% include {{page.version.version}}/app/spring-data-jpa/changelog-master.xml %}
~~~

The first changeset uses [the `sqlFile` tag](https://docs.liquibase.com/change-types/community/sql-file.html), which tells Liquibase that an external `.sql` file contains some SQL statements to execute. The file specified by the changeset, `resources/db/create.sql`, creates the `account` table:

{% include copy-clipboard.html %}
~~~ sql
{% include {{page.version.version}}/app/spring-data-jpa/create.sql %}
~~~

The second changeset in the changelog uses the [Liquibase XML syntax](https://docs.liquibase.com/concepts/basic/xml-format.html) to specify a series of sequential `INSERT` statements that initialize the `account` table with some values.

When the application is started, all of the queries specified by the changesets are executed in the order specified by their `changeset` tag's `id` value. At application startup, Liquibase also creates a table called [`databasechangelog`](https://docs.liquibase.com/concepts/databasechangelog-table.html) in the database where it performs changes. This table's rows log all completed changesets.

To see the completed changesets, open a new terminal, start the [built-in SQL shell](cockroach-sql.html), and query the `databasechangelog` table:

<section class="filter-content" markdown="1" data-scope="secure">

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

</section>

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM roach_data.databasechangelog;
~~~

~~~
  id | author |             filename              |           dateexecuted           | orderexecuted | exectype |               md5sum               |                                              description                                               | comments | tag  | liquibase | contexts | labels | deployment_id
-----+--------+-----------------------------------+----------------------------------+---------------+----------+------------------------------------+--------------------------------------------------------------------------------------------------------+----------+------+-----------+----------+--------+----------------
  1  | root   | classpath:db/changelog-master.xml | 2020-06-17 14:57:01.431506+00:00 |             1 | EXECUTED | 8:939a1a8c47676119a94d0173802d207e | sqlFile                                                                                                |          | NULL | 3.8.9     | crdb     | NULL   | 2420221402
  2  | root   | classpath:db/changelog-master.xml | 2020-06-17 14:57:01.470847+00:00 |             2 | EXECUTED | 8:c2945f2a445cf60b4b203e1a91d14a89 | insert tableName=account; insert tableName=account; insert tableName=account; insert tableName=account |          | NULL | 3.8.9     | crdb     | NULL   | 2420221402
(2 rows)
~~~

Typically, Liquibase properties are defined in a separate [`liquibase.properties`](https://docs.liquibase.com/workflows/liquibase-community/creating-config-properties.html) file. In this application, `application.yml`, the properties file that sets the [Spring properties](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-application-properties.html), also includes some properties that enable and configure Liquibase:

~~~ yml
...
 liquibase:
   change-log: classpath:db/changelog-master.xml
   default-schema:
   drop-first: false
   contexts: crdb
   enabled: true
...
~~~

### Domain entities

`Account.java` defines the [entity](https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks) for the `accounts` table. This class is used throughout the application to represent a row of data in the `accounts` table.

Here are the contents of [`Account.java`](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jpa/src/main/java/io/roach/data/json/Account.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jpa/Account.java %}
~~~

Spring Data JPA supports standard Java Persistence API (JPA) annotations for domain entity class definitions. The `Account` class definition uses these annotations to create the `accounts` table entity:

- `@Entity` declares the `Account` an entity class.
- `@Table` associates the entity with the persisted `account` table.
- `@Column` declare each private attribute a column of the `account` table.
- `@GeneratedValue` indicates that the value for the column should be automatically generated.
- `@Id` declares the [primary key column](primary-key.html) of the table.
- `@Enumerated` specifies the type of data that the column holds.

### Hypermedia representation

To represent database objects as [HAL+JSON](https://en.wikipedia.org/wiki/Hypertext_Application_Language) for the REST API, the application extends the Spring HATEOAS module's [RepresentationModel](https://docs.spring.io/spring-hateoas/docs/current/reference/html/#fundamentals.representation-models) class with `AccountModel`. Like the `Account` class, its attributes represent a row of data in the `accounts` table.

The contents of [`AccountModel.java`](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jpa/src/main/java/io/roach/data/json/AccountModel.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jpa/AccountModel.java %}
~~~

We don't go into much detail about hypermedia representation in this tutorial. For more information, see the [Spring HATEOAS Reference Documentation](https://docs.spring.io/spring-hateoas/docs/current/reference/html/).

### Spring repositories

To abstract the database layer, Spring applications use the [`Repository` interface](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories), or some subinterface of `Repository`. This interface maps to a database object, like a table, and its methods map to queries against that object, like a [`SELECT`](selection-queries.html) or an [`INSERT`](insert.html) statement against a table.

[`AccountRepository.java`](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jpa/src/main/java/io/roach/data/json/AccountRepository.java) defines the main repository for the `accounts` table:

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jpa/AccountRepository.java %}
~~~

`AccountRepository` extends a subinterface of `Repository` that is provided by Spring for JPA data access called `JpaRepository`. The `AccountRepository` methods use the [`@Query`](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods.at-query) annotation strategy to define queries manually, as strings.

Note that, in addition to having the `@Repository` annotation, the `AccountRepository` interface has a [`@Transactional` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative-annotations). When [transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) is enabled in an application (i.e., with [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html)), Spring automatically wraps all objects with the `@Transactional` annotation in [a proxy](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-understanding-aop-proxies) that handles calls to the object.

`@Transactional` takes a number of parameters, including a `propagation` parameter that determines the transaction propagation behavior around an object (i.e., at what point in the stack a transaction starts and ends). This sample application follows the [entity-control-boundary (ECB) pattern](https://en.wikipedia.org/wiki/Entity-control-boundary). As such, the [REST service boundaries](#rest-controller) should determine where a [transaction](transactions.html) starts and ends rather than the query methods defined in the data access layer. To follow the ECB design pattern, `propagation=MANDATORY` for `AccountRepository`, which means that a transaction must already exist in order to call the `AccountRepository` query methods. In contrast, the `@Transactional` annotations on the [Rest controller entities](#rest-controller) in the web layer have `propagation=REQUIRES_NEW`, meaning that a new transaction must be created for each REST request.

For details about control flow and transaction management in this application, see [Transaction management](#transaction-management). For more general information about Spring transaction management, see [Understanding the Spring Framework’s Declarative Transaction Implementation](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#tx-decl-explained) on Spring's documentation website.

### REST controller

There are several endpoints exposed by the application's web layer, some of which monitor the health of the application, and some that map to queries executed against the connected database. All of the endpoints served by the application are handled by the `AccountController` class, which is defined in [`AccountController.java`](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jpa/src/main/java/io/roach/data/json/AccountController.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jpa/AccountController.java %}
~~~

 Annotated with [`@RestController`](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html), `AccountController` defines the primary [web controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) component of the application. The `AccountController` methods define the endpoints, routes, and business logic of REST services for account querying and money transferring. Its attributes include an instantiation of [`AccountRepository`](#spring-repositories), called `accountRepository`, that establishes an interface to the `accounts` table through the data access layer.

As mentioned in the [Spring repositories](#spring-repositories) section, the application's transaction boundaries follow the [entity-control-boundary (ECB) pattern](https://en.wikipedia.org/wiki/Entity-control-boundary), meaning that the web service boundaries of the application determine where a [transaction](transactions.html) starts and ends. To follow the ECB pattern, the `@Transactional` annotation on each of the HTTP entities (`listAccounts()`, `getAccount()`, and `transfer()`) has `propagation=REQUIRES_NEW`. This ensures that each time a REST request is made to an endpoint, a new transaction context is created.

For details on how aspects handle control flow and transaction management in the application, see [Transaction management](#transaction-management).

### Transaction management

When [transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) is enabled in an application, Spring automatically wraps all objects annotated with `@Transactional` in [a proxy](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-understanding-aop-proxies) that handles calls to the object. By default, this proxy starts and closes transactions according to the configured transaction management behavior (e.g., the `propagation` level). The proxy methods that handle transactions make up the *primary transaction advisor*.

Using [@AspectJ annotations](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative-aspectj), this sample application extends the default transaction proxy behavior to handle [transaction retries](#transaction-retries) with another explicitly-defined [aspect](https://en.wikipedia.org/wiki/Aspect_(computer_programming)): `RetryableTransactionAspect`. Methods of this aspect are declared as [advice](https://en.wikipedia.org/wiki/Advice_(programming)) to be executed around method calls annotated with `@Transactional`.

#### Ordering advice

To determine the order of evaluation when multiple transaction advisors match the same [pointcut](https://en.wikipedia.org/wiki/Pointcut) (in this case, around `@Transactional` method calls), this application explicitly declares an order of precedence for calling advice.

The [`@Order`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/annotation/Order.html) annotation takes a value that indicates the precedence of its advice. In the case of `RetryableTransactionAspect`, the annotation is passed `Ordered.LOWEST_PRECEDENCE-1`, which places the retry advisor one level of precedence above the lowest level. By default, the primary transaction advisor has the lowest level of precedence (`Ordered.LOWEST_PRECEDENCE`). This means that the retry logic will be evaluated before a transaction is opened.

For more details about advice ordering, see [Advice Ordering](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-advice-ordering) on the Spring documentation site.

#### Transaction retries

Transactions may require retries if they experience deadlock or [transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) that cannot be resolved without allowing [serialization](demo-serializable.html) anomalies. To handle transactions that are aborted due to transient serialization errors, we highly recommend writing [client-side transaction retry logic](transactions.html#client-side-intervention) into applications written on CockroachDB.

In this application, transaction retry logic is written into the methods of the `RetryableTransactionAspect` class, declared an aspect with the `@Aspect` annotation. Here are the contents of [`RetryableTransactionAspect.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jpa/src/main/java/io/roach/data/json/RetryableTransactionAspect.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jpa/RetryableTransactionAspect.java %}
~~~

The `anyTransactionBoundaryOperation` method is declared as a pointcut with the [`@Pointcut` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-pointcuts). In Spring, pointcut declarations must include an expression to determine where [join points](https://en.wikipedia.org/wiki/Join_point) occur in the application control flow. To help define these expressions, Spring supports a set of [designators](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-pointcuts-designators). The application uses two of them here: `execution`, which matches method execution joint points (i.e., defines a joint point when a specific method is executed, in this case, *any* method in the `io.roach.` namespace), and `@annotation`, which limits the matches to methods with a specific annotation, in this case `@Transactional`.

`retryableOperation` handles the application retry logic in the form of advice. Spring supports [several different annotations to declare advice](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-advice). The [`@Around` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-around-advice) allows an advice method to work before and after the `anyTransactionBoundaryOperation(transactional)` join point. It also allows the advice method to call the next matching advisor with the `ProceedingJoinPoint.proceed();` method.

`retryableOperation` first verifies that there is no active transaction. It then increments the retry count and attempts to proceed to the next advice method with the `ProceedingJoinPoint.proceed()` method. If the underlying methods (i.e., the primary transaction advisor's methods and the [annotated query methods](#spring-repositories)) succeed, the transaction has been successfully committed to the database. The results are then returned and the application flow continues. If a failure in the underlying layers occurs due to a transient error, then the transaction is retried. The time between each retry grows with each retry until the maximum number of retries is reached.

## See also

Spring documentation:

- [Spring Boot website](https://spring.io/projects/spring-boot)
- [Spring Framework Overview](https://docs.spring.io/spring/docs/current/spring-framework-reference/overview.html#overview)
- [Spring Core documentation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#spring-core)
- [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
- [Data Access with JDBC](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#jpa)
- [Spring Web MVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc)

CockroachDB documentation:

- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Client Connection Parameters](connection-parameters.html)
- [CockroachDB Developer Guide](developer-guide-overview.html)
- [Hello World Example Apps](hello-world-example-apps.html)
- [Transactions](transactions.html)
