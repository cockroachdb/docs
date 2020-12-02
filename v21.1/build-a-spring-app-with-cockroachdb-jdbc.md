---
title: Build a Spring App with CockroachDB and JDBC
summary: Learn how to use CockroachDB from a Spring application with the JDBC driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-spring-app-with-cockroachdb-jdbc.html"><button style="width: 28%" class="filter-button current">Use <strong>JDBC</strong></button></a>
    <a href="build-a-spring-app-with-cockroachdb-jpa.html"><button style="width: 28%" class="filter-button">Use <strong>JPA</strong></button></a>
</div>

This tutorial shows you how to build a [Spring Boot](https://spring.io/projects/spring-boot) web application with CockroachDB, using the [Spring Data JDBC](https://spring.io/projects/spring-data-jdbc) module for data access. The code for the example application is available for download from [GitHub](https://github.com/cockroachlabs/roach-data/tree/master), along with identical examples that use [JPA](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jpa), [jOOQ](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-jooq), and [MyBatis](https://github.com/cockroachlabs/roach-data/tree/master/roach-data-mybatis) for data access.

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

To get the application code, download or clone the [`roach-data` repository](https://github.com/cockroachlabs/roach-data). The code for the example JDBC application is located under the `roach-data-jdbc` directory.

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
- Spring Data JDBC
- Spring Boot Actuator
- Spring HATEOS
- Liquibase Migration
- PostgreSQL Driver


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

Give the `roach_data` user the necessary permissions:

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

To run the application:

1. Open the `roach-data/roach-data-jdbc` project folder in a text editor or IDE, and edit the `roach-data/roach-data-jdbc/src/main/resources/application.yml` file so that:
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
1. Open a terminal, and navigate to the `roach-data-jdbc` project subfolder:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd <path>/roach-data/roach-data-jdbc
    ~~~

1. Use Maven to download the application dependencies and compile the code:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mvn clean install
    ~~~

1. From the `roach-data-jdbc` directory, run the application JAR file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ java -jar target/roach-data-jdbc.jar
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

Give the `roach_data` user the necessary permissions:

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

To run the application:

1. Open the `roach-data/roach-data-jdbc` project folder in a text editor or IDE, and edit the `roach-data/roach-data-jdbc/src/main/resources/application.yml` file so that:
    - The `url` field specifies the correct [connection string](connection-parameters.html#connect-using-a-url) to the [running CockroachDB cluster](#before-you-begin). For example:

        ~~~ yaml
        ...
        datasource:
          url: jdbc:postgresql://localhost:26257/roach_data?ssl=true&sslmode=disable
        ...
        ~~~
    - The `username` field specifies `maxroach` as the user:

        ~~~ yaml
        ...
          username: maxroach
        ...
        ~~~
1. Open a terminal, and navigate to the `roach-data-jdbc` project subfolder:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd <path>/roach-data/roach-data-jdbc
    ~~~

1. Use Maven to download the application dependencies and compile the code:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mvn clean install
    ~~~

1. From the `roach-data-jdbc` directory, run the application JAR file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ java -jar target/roach-data-jdbc.jar
    ~~~

</section>

The output should look like the following:

~~~
^__^
(oo)\_______
(__)\       )\/\   CockroachDB on Spring Data JDBC  (v1.0.0.BUILD-SNAPSHOT)
   ||----w |       powered by Spring Boot  (v2.2.7.RELEASE)
   ||     ||

2020-06-17 14:56:54.507  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Starting JdbcApplication v1.0.0.BUILD-SNAPSHOT on MyComputer with PID 43008 (path/roach-data/roach-data-jdbc/target/roach-data-jdbc.jar started by user in path/roach-data/roach-data-jdbc)
2020-06-17 14:56:54.510  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : No active profile set, falling back to default profiles: default
2020-06-17 14:56:55.387  INFO 43008 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JDBC repositories in DEFAULT mode.
2020-06-17 14:56:55.452  INFO 43008 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 59ms. Found 2 JDBC repository interfaces.
2020-06-17 14:56:56.581  INFO 43008 --- [           main] org.eclipse.jetty.util.log               : Logging initialized @3378ms to org.eclipse.jetty.util.log.Slf4jLog
2020-06-17 14:56:56.657  INFO 43008 --- [           main] o.s.b.w.e.j.JettyServletWebServerFactory : Server initialized with port: 8080
2020-06-17 14:56:56.661  INFO 43008 --- [           main] org.eclipse.jetty.server.Server          : jetty-9.4.28.v20200408; built: 2020-04-08T17:49:39.557Z; git: ab228fde9e55e9164c738d7fa121f8ac5acd51c9; jvm 11.0.7+10
2020-06-17 14:56:56.696  INFO 43008 --- [           main] o.e.j.s.h.ContextHandler.application     : Initializing Spring embedded WebApplicationContext
2020-06-17 14:56:56.696  INFO 43008 --- [           main] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 2088 ms
2020-06-17 14:56:57.170  INFO 43008 --- [           main] org.eclipse.jetty.server.session         : DefaultSessionIdManager workerName=node0
2020-06-17 14:56:57.171  INFO 43008 --- [           main] org.eclipse.jetty.server.session         : No SessionScavenger set, using defaults
2020-06-17 14:56:57.172  INFO 43008 --- [           main] org.eclipse.jetty.server.session         : node0 Scavenging every 600000ms
2020-06-17 14:56:57.178  INFO 43008 --- [           main] o.e.jetty.server.handler.ContextHandler  : Started o.s.b.w.e.j.JettyEmbeddedWebAppContext@deb3b60{application,/,[file:///private/var/folders/pg/r58v54857gq_1nqm_2tr6lg40000gn/T/jetty-docbase.3049902632643053896.8080/],AVAILABLE}
2020-06-17 14:56:57.179  INFO 43008 --- [           main] org.eclipse.jetty.server.Server          : Started @3976ms
2020-06-17 14:56:58.126  INFO 43008 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2020-06-17 14:56:58.369  INFO 43008 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2020-06-17 14:56:58.695  INFO 43008 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2020-06-17 14:56:59.901  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-06-17 14:56:59.917  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : CREATE TABLE public.databasechangeloglock (ID INTEGER NOT NULL, LOCKED BOOLEAN NOT NULL, LOCKGRANTED TIMESTAMP WITHOUT TIME ZONE, LOCKEDBY VARCHAR(255), CONSTRAINT DATABASECHANGELOGLOCK_PKEY PRIMARY KEY (ID))
2020-06-17 14:56:59.930  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-06-17 14:56:59.950  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : DELETE FROM public.databasechangeloglock
2020-06-17 14:56:59.953  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.databasechangeloglock (ID, LOCKED) VALUES (1, FALSE)
2020-06-17 14:56:59.959  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT LOCKED FROM public.databasechangeloglock WHERE ID=1
2020-06-17 14:56:59.969  INFO 43008 --- [           main] l.lockservice.StandardLockService        : Successfully acquired change log lock
2020-06-17 14:57:01.367  INFO 43008 --- [           main] l.c.StandardChangeLogHistoryService      : Creating database history table with name: public.databasechangelog
2020-06-17 14:57:01.369  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : CREATE TABLE public.databasechangelog (ID VARCHAR(255) NOT NULL, AUTHOR VARCHAR(255) NOT NULL, FILENAME VARCHAR(255) NOT NULL, DATEEXECUTED TIMESTAMP WITHOUT TIME ZONE NOT NULL, ORDEREXECUTED INTEGER NOT NULL, EXECTYPE VARCHAR(10) NOT NULL, MD5SUM VARCHAR(35), DESCRIPTION VARCHAR(255), COMMENTS VARCHAR(255), TAG VARCHAR(255), LIQUIBASE VARCHAR(20), CONTEXTS VARCHAR(255), LABELS VARCHAR(255), DEPLOYMENT_ID VARCHAR(10))
2020-06-17 14:57:01.380  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangelog
2020-06-17 14:57:01.396  INFO 43008 --- [           main] l.c.StandardChangeLogHistoryService      : Reading from public.databasechangelog
2020-06-17 14:57:01.397  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT * FROM public.databasechangelog ORDER BY DATEEXECUTED ASC, ORDEREXECUTED ASC
2020-06-17 14:57:01.400  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-06-17 14:57:01.418  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : -- DROP TABLE IF EXISTS account cascade;
-- DROP TABLE IF EXISTS databasechangelog cascade;
-- DROP TABLE IF EXISTS databasechangeloglock cascade;

create table account
(
    id      int            not null primary key default unique_rowid(),
    balance numeric(19, 2) not null,
    name    varchar(128)   not null,
    type    varchar(25)    not null
)
2020-06-17 14:57:01.426  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : -- insert into account (id,balance,name,type) values
--     (1, 500.00,'Alice','asset'),
--     (2, 500.00,'Bob','expense'),
--     (3, 500.00,'Bobby Tables','asset'),
--     (4, 500.00,'Doris','expense');
2020-06-17 14:57:01.427  INFO 43008 --- [           main] liquibase.changelog.ChangeSet            : SQL in file db/create.sql executed
2020-06-17 14:57:01.430  INFO 43008 --- [           main] liquibase.changelog.ChangeSet            : ChangeSet classpath:db/changelog-master.xml::1::root ran successfully in 14ms
2020-06-17 14:57:01.430  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT MAX(ORDEREXECUTED) FROM public.databasechangelog
2020-06-17 14:57:01.441  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1', 'root', 'classpath:db/changelog-master.xml', NOW(), 1, '8:939a1a8c47676119a94d0173802d207e', 'sqlFile', '', 'EXECUTED', 'crdb', NULL, '3.8.9', '2420221402')
2020-06-17 14:57:01.450  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('1', 'Alice', 500.00, 'asset')
2020-06-17 14:57:01.459  INFO 43008 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-17 14:57:01.460  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('2', 'Bob', 500.00, 'expense')
2020-06-17 14:57:01.462  INFO 43008 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-17 14:57:01.462  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('3', 'Bobby Tables', 500.00, 'asset')
2020-06-17 14:57:01.464  INFO 43008 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-17 14:57:01.465  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.account (id, name, balance, type) VALUES ('4', 'Doris', 500.00, 'expense')
2020-06-17 14:57:01.467  INFO 43008 --- [           main] liquibase.changelog.ChangeSet            : New row inserted into account
2020-06-17 14:57:01.469  INFO 43008 --- [           main] liquibase.changelog.ChangeSet            : ChangeSet classpath:db/changelog-master.xml::2::root ran successfully in 19ms
2020-06-17 14:57:01.470  INFO 43008 --- [           main] liquibase.executor.jvm.JdbcExecutor      : INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('2', 'root', 'classpath:db/changelog-master.xml', NOW(), 2, '8:c2945f2a445cf60b4b203e1a91d14a89', 'insert tableName=account; insert tableName=account; insert tableName=account; insert tableName=account', '', 'EXECUTED', 'crdb', NULL, '3.8.9', '2420221402')
2020-06-17 14:57:01.479  INFO 43008 --- [           main] l.lockservice.StandardLockService        : Successfully released change log lock
2020-06-17 14:57:01.555  INFO 43008 --- [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 8 endpoint(s) beneath base path '/actuator'
2020-06-17 14:57:01.610  INFO 43008 --- [           main] o.e.j.s.h.ContextHandler.application     : Initializing Spring DispatcherServlet 'dispatcherServlet'
2020-06-17 14:57:01.610  INFO 43008 --- [           main] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2020-06-17 14:57:01.620  INFO 43008 --- [           main] o.s.web.servlet.DispatcherServlet        : Completed initialization in 10 ms
2020-06-17 14:57:01.653  INFO 43008 --- [           main] o.e.jetty.server.AbstractConnector       : Started ServerConnector@733c423e{HTTP/1.1, (http/1.1)}{0.0.0.0:8080}
2020-06-17 14:57:01.654  INFO 43008 --- [           main] o.s.b.web.embedded.jetty.JettyWebServer  : Jetty started on port(s) 8080 (http/1.1) with context path '/'
2020-06-17 14:57:01.657  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Started JdbcApplication in 7.92 seconds (JVM running for 8.454)
2020-06-17 14:57:01.659  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Lets move some $$ around!
2020-06-17 14:57:03.552  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 7 remaining
2020-06-17 14:57:03.606  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 6 remaining
2020-06-17 14:57:03.606  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 5 remaining
2020-06-17 14:57:03.607  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 4 remaining
2020-06-17 14:57:03.608  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 3 remaining
2020-06-17 14:57:03.608  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 2 remaining
2020-06-17 14:57:03.608  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 1 remaining
2020-06-17 14:57:03.608  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 0 remaining
2020-06-17 14:57:03.608  INFO 43008 --- [           main] io.roach.data.jdbc.JdbcApplication       : All client workers finished but server keeps running. Have a nice day!
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
   "balance" : 350,
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
   "balance" : 650,
   "name" : "Bob",
   "type" : "expense"
}
~~~

### Monitor the application

`http://localhost:8080/actuator` is the base URL for a number of [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#production-ready) endpoints that let you monitor the activity and health of the application.

{% include copy-clipboard.html %}
~~~ shell
$ curl -X GET http://localhost:8080/actuator | json_pp
~~~

~~~
{
   "_links" : {
      "conditions" : {
         "href" : "http://localhost:8080/actuator/conditions",
         "templated" : false
      },
      "configprops" : {
         "href" : "http://localhost:8080/actuator/configprops",
         "templated" : false
      },
      "env" : {
         "href" : "http://localhost:8080/actuator/env",
         "templated" : false
      },
      "env-toMatch" : {
         "href" : "http://localhost:8080/actuator/env/{toMatch}",
         "templated" : true
      },
      "health" : {
         "href" : "http://localhost:8080/actuator/health",
         "templated" : false
      },
      "health-path" : {
         "href" : "http://localhost:8080/actuator/health/{*path}",
         "templated" : true
      },
      "info" : {
         "href" : "http://localhost:8080/actuator/info",
         "templated" : false
      },
      "liquibase" : {
         "href" : "http://localhost:8080/actuator/liquibase",
         "templated" : false
      },
      "metrics" : {
         "href" : "http://localhost:8080/actuator/metrics",
         "templated" : false
      },
      "metrics-requiredMetricName" : {
         "href" : "http://localhost:8080/actuator/metrics/{requiredMetricName}",
         "templated" : true
      },
      "self" : {
         "href" : "http://localhost:8080/actuator",
         "templated" : false
      },
      "threaddump" : {
         "href" : "http://localhost:8080/actuator/threaddump",
         "templated" : false
      }
   }
}
~~~

Each actuator endpoint shows specific metrics on the application. For example:

{% include copy-clipboard.html %}
~~~ shell
$ curl -X GET http://localhost:8080/actuator/health | json_pp
~~~

~~~
{
   "components" : {
      "db" : {
         "details" : {
            "database" : "PostgreSQL",
            "result" : 1,
            "validationQuery" : "SELECT 1"
         },
         "status" : "UP"
      },
      "diskSpace" : {
         "details" : {
            "free" : 125039620096,
            "threshold" : 10485760,
            "total" : 250685575168
         },
         "status" : "UP"
      },
      "ping" : {
         "status" : "UP"
      }
   },
   "status" : "UP"
}
~~~

For more information about actuator endpoints, see the [Spring Boot Actuator Endpoint documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#production-ready-endpoints).

## Implementation details

This section walks you through the different components of the application project in detail.

### Main application process

`JdbcApplication.java` defines the application's main process. It starts a Spring Boot web application, and then submits requests to the app's REST API that result in database transactions on the CockroachDB cluster.

Here are the contents of [`JdbcApplication.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/jdbc/JdbcApplication.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/JdbcApplication.java %}
~~~

The annotations listed at the top of the `JdbcApplication` class definition declare some important configuration properties for the entire application:

- [`@EnableHypermediaSupport`](https://docs.spring.io/spring-hateoas/docs/current/api/org/springframework/hateoas/config/EnableHypermediaSupport.html) enables [hypermedia support for resource representation](https://en.wikipedia.org/wiki/HATEOAS) in the application. Currently, the only hypermedia format supported by Spring is [HAL](https://en.wikipedia.org/wiki/Hypertext_Application_Language), and so the `type = EnableHypermediaSupport.HypermediaType.HAL`. For details, see [Hypermedia representation](#hypermedia-representation).
- [`@EnableJdbcRepositories`](https://docs.spring.io/spring-data/jdbc/docs/current/api/org/springframework/data/jdbc/repository/config/EnableJdbcRepositories.html) enables the creation of [Spring repositories](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#jdbc.repositories) for data access using [Spring Data JDBC](https://spring.io/projects/spring-data-jdbc). For details, see [Spring repositories](#spring-repositories).
- [`@EnableAspectJAutoProxy`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/EnableAspectJAutoProxy.html) enables the use of [`@AspectJ` annotations for declaring aspects](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj). For details, see [Transaction management](#transaction-management).
- [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html) enables [declarative transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) in the application. For details, see [Transaction management](#transaction-management).

    Note that the `@EnableTransactionManagement` annotation is passed an `order` parameter, which indicates the ordering of advice evaluation when a common join point is reached. For details, see [Ordering advice](#ordering-advice).
- [`@SpringBootApplication`](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/autoconfigure/SpringBootApplication.html) is a standard configuration annotation used by Spring Boot applications. For details, see [Using the @SpringBootApplication](https://docs.spring.io/spring-boot/docs/current/reference/html/using-spring-boot.html#using-boot-using-springbootapplication-annotation) on the Spring Boot documentation site.

### Schema management

To create and initialize the database schema, the application uses [Liquibase](https://www.liquibase.org/).

#### Liquibase changelogs

Liquibase uses [changelog files](https://docs.liquibase.com/concepts/basic/changelog.html) to manage database schema changes. Changelog files include a list of instructions, known as [changesets](https://docs.liquibase.com/concepts/basic/changeset.html), that are executed against the database in a specified order.

`resources/db/changelog-master.xml` defines the changelog for this application:

{% include copy-clipboard.html %}
~~~ xml
{% include {{page.version.version}}/app/spring-data-jdbc/changelog-master.xml %}
~~~

The first changeset uses [the `sqlFile` tag](https://docs.liquibase.com/change-types/community/sql-file.html), which tells Liquibase that an external `.sql` file contains some SQL statements to execute. The file specified by the changeset, `resources/db/create.sql`, creates the `account` table:

{% include copy-clipboard.html %}
~~~ sql
{% include {{page.version.version}}/app/spring-data-jdbc/create.sql %}
~~~

The second changeset in the changelog uses the [Liquibase XML syntax](https://docs.liquibase.com/concepts/basic/xml-format.html) to specify a series of sequential `INSERT` statements that initialize the `account` table with some values.

When the application is started, all of the queries specified by the changesets are executed in the order specified by their `changeset` tag's `id` value. At application startup, Liquibase also creates a table called [`databasechangelog`](https://docs.liquibase.com/concepts/databasechangelog-table.html) in the database where it performs changes. This table's rows log all completed changesets.

To see the completed changesets after starting the application, open a new terminal, start the [built-in SQL shell](cockroach-sql.html), and query the `databasechangelog` table:

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

{{site.data.alerts.callout_info}}
Liquibase does not [retry transactions](transactions.html#transaction-retries) automatically. If a changeset fails at startup, you might need to restart the application manually to complete the changeset.
{{site.data.alerts.end}}

#### Liquibase configuration

Typically, Liquibase properties are defined in a separate [`liquibase.properties`](https://docs.liquibase.com/workflows/liquibase-community/creating-config-properties.html) file. In this application, the [Spring properties](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-application-properties.html) file, `application.yml`, includes properties that enable and configure Liquibase:

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

The `contexts` property specifies a single [Liquibase context](https://docs.liquibase.com/concepts/advanced/contexts.html) (`crdb`). In order for a changeset to run, its `context` attribute must match a context set by this property. The `context` value is `crdb` in both of the changeset definitions in `changelog-master.xml`, so both changesets run at application startup.

For simplicity, `application.yml` only specifies properties for a single [Spring profile](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-profiles), with a single set of Liquibase properties. If you want the changelog to include changesets that only run in specific environments (e.g., for debugging and development), you can create a new Spring profile in a separate properties file (e.g. `application-dev.yml`), and specify a different set of Liquibase properties for that profile. The profile set by the application configuration will automatically use the properties in that profile's properties file. For information about setting profiles, see the [Spring documentation website](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-profiles).

### Domain entities

`Account.java` defines the [domain entity](https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks) for the `accounts` table. This class is used throughout the application to represent a row of data in the `accounts` table.

Here are the contents of [`Account.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/jdbc/Account.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/Account.java %}
~~~

### Hypermedia representation

To represent database objects as [HAL+JSON](https://en.wikipedia.org/wiki/Hypertext_Application_Language) for the REST API, the application extends the Spring HATEOAS module's [RepresentationModel](https://docs.spring.io/spring-hateoas/docs/current/reference/html/#fundamentals.representation-models) class with `AccountModel`. Like the `Account` class, its attributes represent a row of data in the `accounts` table.

The contents of [`AccountModel.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/jdbc/AccountModel.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/AccountModel.java %}
~~~

We don't go into much detail about hypermedia representation in this tutorial. For more information, see the [Spring HATEOAS Reference Documentation](https://docs.spring.io/spring-hateoas/docs/current/reference/html/).

### Spring repositories

To abstract the database layer, Spring applications use the [`Repository` interface](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#repositories), or some subinterface of `Repository`. This interface maps to a database object, like a table, and its methods map to queries against that object, like a [`SELECT`](selection-queries.html) or an [`INSERT`](insert.html) statement against a table.

[`AccountRepository.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/jdbc/AccountRepository.java) defines the main repository for the `accounts` table:

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/AccountRepository.java %}
~~~

`AccountRepository` extends a subinterface of `Repository` that is provided by Spring for generic [CRUD operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) called `CrudRepository`. To support [pagination queries](selection-queries.html#paginate-through-limited-results), repositories in other Spring Data modules, like those in Spring Data JPA, usually extend a subinterface of `CrudRepository`, called `PagingAndSortingRepository`, that includes pagination and sorting methods. At the time this sample application was created, Spring Data JDBC did not support pagination. As a result, `AccountRepository` extends a custom repository, called `PagedAccountRepository`, to provide basic [`LIMIT`/`OFFSET` pagination](selection-queries.html#pagination-example) on queries against the `accounts` table. The `AccountRepository` methods use the [`@Query`](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#jdbc.query-methods.at-query) annotation strategy to define queries manually, as strings.

Note that, in addition to having the `@Repository` annotation, the `AccountRepository` interface has a [`@Transactional` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative-annotations). When [transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) is enabled in an application (i.e., with [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html)), Spring automatically wraps all objects with the `@Transactional` annotation in [a proxy](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-understanding-aop-proxies) that handles calls to the object. For more information, see [Understanding the Spring Framework’s Declarative Transaction Implementation](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#tx-decl-explained) on Spring's documentation website.

`@Transactional` takes a number of parameters, including a `propagation` parameter that determines the transaction propagation behavior around an object (i.e., at what point in the stack a transaction starts and ends). This sample application follows the [entity-control-boundary (ECB) pattern](https://en.wikipedia.org/wiki/Entity-control-boundary). As such, the [REST service boundaries](#rest-controller) should determine where a [transaction](transactions.html) starts and ends rather than the query methods defined in the data access layer. To follow the ECB design pattern, `propagation=MANDATORY` for `AccountRepository`, which means that a transaction must already exist in order to call the `AccountRepository` query methods. In contrast, the `@Transactional` annotations on the [Rest controller entities](#rest-controller) in the web layer have `propagation=REQUIRES_NEW`, meaning that a new transaction must be created for each REST request.

The aspects declared in `TransactionHintsAspect.java` and `RetryableTransactionAspect.java` further control how `@Transactional`-annotated components are handled. For more details on control flow and transaction management in the application, see [Transaction management](#transaction-management).

### REST controller

There are several endpoints exposed by the application's web layer, some of which monitor the health of the application, and some that map to queries executed against the connected database. All of the endpoints served by the application are handled by the `AccountController` class, which is defined in [`AccountController.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/jdbc/AccountController.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/AccountController.java %}
~~~

 Annotated with [`@RestController`](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html), `AccountController` defines the primary [web controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) component of the application. The `AccountController` methods define the endpoints, routes, and business logic of REST services for account querying and money transferring. Its attributes include an instantiation of [`AccountRepository`](#spring-repositories), called `accountRepository`, that establishes an interface to the `accounts` table through the data access layer.

As mentioned in the [Spring repositories](#spring-repositories) section, the application's transaction boundaries follow the [entity-control-boundary (ECB) pattern](https://en.wikipedia.org/wiki/Entity-control-boundary), meaning that the web service boundaries of the application determine where a [transaction](transactions.html) starts and ends. To follow the ECB pattern, the `@Transactional` annotation on each of the HTTP entities (`listAccounts()`, `getAccount()`, and `transfer()`) has `propagation=REQUIRES_NEW`. This ensures that each time a REST request is made to an endpoint, a new transaction context is created. For details on how aspects handle control flow and transaction management in the application, see [Transaction management](#transaction-management).

### Transaction management

When [transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) is enabled in an application, Spring automatically wraps all objects annotated with `@Transactional` in [a proxy](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-understanding-aop-proxies) that handles calls to the object. By default, this proxy starts and closes transactions according to the configured transaction management behavior (e.g., the `propagation` level).

Using [@AspectJ annotations](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative-aspectj), this sample application extends the default transaction proxy behavior with two other explicitly-defined [aspects](https://en.wikipedia.org/wiki/Aspect_(computer_programming)): `TransactionHintsAspect` and `RetryableTransactionAspect`. Methods of these aspects are declared as [advice](https://en.wikipedia.org/wiki/Advice_(programming)) to be executed around method calls annotated with `@Transactional`.

For more information about transaction management in the app, see the following sections below:

- [Ordering advice](#ordering-advice)
- [Transaction attributes](#transaction-attributes)
- [Transaction retries](#transaction-retries)

#### Ordering advice

To determine the order of evaluation when multiple transaction advisors match the same [pointcut](https://en.wikipedia.org/wiki/Pointcut) (in this case, around `@Transactional` method calls), this application explicitly declares an order of precedence for calling advice.

At the top level of the application, in the main `JdbcApplication.java` file, the [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/ EnableTransactionManagement.html) annotation is passed an `order` parameter. This parameter sets the order on the primary transaction advisor to one level of precedence above the lowest level, `Ordered.LOWEST_PRECEDENCE`. This means that the advisor with the lowest level of precedence is evaluated after the primary transaction advisor (i.e., within the context of an open transaction).

For the two explicitly-defined aspects, `TransactionHintsAspect` and `RetryableTransactionAspect`, the [`@Order`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/annotation/Order.html) annotation is used. Like the `order` parameter on the `@EnableTransactionManagement` annotation, `@Order` takes a value that indicates the precedence of advice. The advisor with the lowest level of precedence is declared in `TransactionHintsAspect`, the aspect that defines the [transaction attributes](#transaction-attributes). `RetryableTransactionAspect`, the aspect that defines the [transaction retry logic](#transaction-retries), defines the advisor with the highest level of precedence.

For more details about advice ordering, see [Advice Ordering](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-advice-ordering) on the Spring documentation site.


#### Transaction attributes

The `TransactionHintsAspect` class, declared as an aspect with the [`@Aspect` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-at-aspectj), declares an advice method that defines the attributes of a transaction. The `@Order` annotation is passed the lowest level of precedence, `Ordered.LOWEST_PRECEDENCE`, indicating that this advisor must run after the main transaction advisor, within the context of a transaction. Here are the contents of [`TransactionHintsAspect.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/jdbc/TransactionHintsAspect.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/TransactionHintsAspect.java %}
~~~

The `anyTransactionBoundaryOperation` method is declared as a pointcut with the [`@Pointcut` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-pointcuts). In Spring, pointcut declarations must include an expression to determine where [join points](https://en.wikipedia.org/wiki/Join_point) occur in the application control flow. To help define these expressions, Spring supports a set of [designators](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-pointcuts-designators). The application uses two of them here: `execution`, which matches method execution joint points (i.e., defines a joint point when a specific method is executed, in this case, *any* method in the `io.roach.` namespace), and `@annotation`, which limits the matches to methods with a specific annotation, in this case `@Transactional`.

`setTransactionAttributes` sets the transaction attributes in the form of advice. Spring supports [several different annotations to declare advice](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-advice). The [`@Around` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-around-advice) allows an advice method to work before and after the `anyTransactionBoundaryOperation(transactional)` join point. It also allows the advice method to call the next matching advisor with the `ProceedingJoinPoint.proceed();` method.

On verifying that the transaction is active (using `TransactionSynchronizationManager.isActualTransactionActive()`), the advice [sets some session variables](set-vars.html) using methods of the [`JdbcTemplate`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html) object declared at the top of the `TransactionHintsAspect` class definition. These session variables (`application_name`, `statement_timeout`, and `transaction_read_only`) set [the application name](connection-parameters.html#additional-connection-parameters) for the query to "`roach-data`", the time allowed for the statement to execute before timing out to 1000 milliseconds (i.e., 1 second), and the [transaction access mode](set-transaction.html#parameters) as either `READ ONLY` or `READ WRITE`.

#### Transaction retries

Transactions may require retries if they experience deadlock or [transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) that cannot be resolved without allowing [serialization](demo-serializable.html) anomalies. To handle transactions that are aborted due to transient serialization errors, we highly recommend writing [client-side transaction retry logic](transactions.html#client-side-intervention) into applications written on CockroachDB.

In this application, transaction retry logic is written into the methods of the `RetryableTransactionAspect` class. This class is declared an aspect with the `@Aspect` annotation. The `@Order` annotation on this aspect class is passed `Ordered.LOWEST_PRECEDENCE-2`, a level of precedence above the primary transaction advisor. This indicates that the transaction retry advisor must run outside the context of a transaction. Here are the contents of [`RetryableTransactionAspect.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/jdbc/RetryableTransactionAspect.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/RetryableTransactionAspect.java %}
~~~

The `anyTransactionBoundaryOperation` pointcut definition is identical to the one declared in `TransactionHintsAspect`. The `execution` designator matches all methods in the `io.roach.` namespace, and the `@annotation` designator limits the matches to methods with the `@Transactional` annotation.

`retryableOperation` handles the application retry logic in the form of advice. The [`@Around` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-around-advice) allows the advice method to work before and after an `anyTransactionBoundaryOperation(transactional)` join point. It also allows the advice method to call the next matching advisor.

`retryableOperation` first verifies that there is no active transaction. It then increments the retry count and attempts to proceed to the next advice method with the `ProceedingJoinPoint.proceed()` method. If the underlying methods (i.e., the primary transaction advisor's methods and the [annotated query methods](#spring-repositories)) succeed, the transaction has been successfully committed to the database. The results are then returned and the application flow continues. If a failure in the underlying layers occurs due to a transient error ([`TransientDataAccessException`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/dao/TransientDataAccessException.html) or [`TransactionSystemException`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/TransactionSystemException.html)), then the transaction is retried. The time between each retry grows with each retry until the maximum number of retries is reached.

## See also

Spring documentation:

- [Spring Boot website](https://spring.io/projects/spring-boot)
- [Spring Framework Overview](https://docs.spring.io/spring/docs/current/spring-framework-reference/overview.html#overview)
- [Spring Core documentation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#spring-core)
- [Data Access with JDBC](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#jdbc)
- [Spring Web MVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc)

CockroachDB documentation:

- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Client Connection Parameters](connection-parameters.html)
- [CockroachDB Developer Guide](developer-guide-overview.html)
- [Hello World Example Apps](hello-world-example-apps.html)
- [Transactions](transactions.html)
