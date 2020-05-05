---
title: Build a Spring App with CockroachDB and JDBC
summary: Learn how to use CockroachDB from a simple Spring application with the JDBC driver.
toc: true
twitter: false
---

This tutorial shows you how to build a simple [Spring Boot](https://spring.io/projects/spring-boot) web application with CockroachDB, using the [Spring Data JDBC](https://spring.io/projects/spring-data-jdbc) module for data access. The code for the example application is available for download from [GitHub](https://github.com/cockroachlabs/roach-data/tree/master), along with identical examples that use JPA, jOOQ, and MyBatis for data access.

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

Compiling and running the application code will start a web application and submit some simple requests to the app's REST API that result in [atomic database transactions](transactions.html) on the running CockroachDB cluster. For details about the application code, see [Implementation details](#implementation-details).

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

Compiling and running the application code will start a web application and submit some simple requests to the app's REST API that result in database transactions on the running CockroachDB cluster. For details about the application code, [see below](#implementation-details).

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

2020-05-21 11:13:40.858  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Starting JdbcApplication v1.0.0.BUILD-SNAPSHOT on MyComputer with PID 40702 (path/roach-data/roach-data-jdbc/target/roach-data-jdbc.jar started by user in path/roach-data/roach-data-jdbc)
2020-05-21 11:13:40.861  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : No active profile set, falling back to default profiles: default
2020-05-21 11:13:41.675  INFO 40702 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JDBC repositories in DEFAULT mode.
2020-05-21 11:13:41.760  INFO 40702 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 73ms. Found 2 JDBC repository interfaces.
2020-05-21 11:13:42.989  INFO 40702 --- [           main] org.eclipse.jetty.util.log               : Logging initialized @3092ms to org.eclipse.jetty.util.log.Slf4jLog
2020-05-21 11:13:43.146  INFO 40702 --- [           main] o.s.b.w.e.j.JettyServletWebServerFactory : Server initialized with port: 8080
2020-05-21 11:13:43.151  INFO 40702 --- [           main] org.eclipse.jetty.server.Server          : jetty-9.4.28.v20200408; built: 2020-04-08T17:49:39.557Z; git: ab228fde9e55e9164c738d7fa121f8ac5acd51c9; jvm 1.8.0_242-b08
2020-05-21 11:13:43.181  INFO 40702 --- [           main] o.e.j.s.h.ContextHandler.application     : Initializing Spring embedded WebApplicationContext
2020-05-21 11:13:43.182  INFO 40702 --- [           main] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 2232 ms
2020-05-21 11:13:43.666  INFO 40702 --- [           main] org.eclipse.jetty.server.session         : DefaultSessionIdManager workerName=node0
2020-05-21 11:13:43.666  INFO 40702 --- [           main] org.eclipse.jetty.server.session         : No SessionScavenger set, using defaults
2020-05-21 11:13:43.667  INFO 40702 --- [           main] org.eclipse.jetty.server.session         : node0 Scavenging every 600000ms
2020-05-21 11:13:43.677  INFO 40702 --- [           main] o.e.jetty.server.handler.ContextHandler  : Started o.s.b.w.e.j.JettyEmbeddedWebAppContext@776a6d9b{application,/,[file:///private/var/folders/pg/r58v54857gq_1nqm_2tr6lg40000gn/T/jetty-docbase.1867254473227579642.8080/],AVAILABLE}
2020-05-21 11:13:43.678  INFO 40702 --- [           main] org.eclipse.jetty.server.Server          : Started @3781ms
2020-05-21 11:13:44.732  INFO 40702 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2020-05-21 11:13:45.149  INFO 40702 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2020-05-21 11:13:45.575  INFO 40702 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2020-05-21 11:13:47.399  INFO 40702 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-05-21 11:13:47.412  INFO 40702 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangeloglock
2020-05-21 11:13:47.415  INFO 40702 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT LOCKED FROM public.databasechangeloglock WHERE ID=1
2020-05-21 11:13:47.459  INFO 40702 --- [           main] l.lockservice.StandardLockService        : Successfully acquired change log lock
2020-05-21 11:13:48.844  INFO 40702 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT MD5SUM FROM public.databasechangelog WHERE MD5SUM IS NOT NULL LIMIT 1
2020-05-21 11:13:48.851  INFO 40702 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT COUNT(*) FROM public.databasechangelog
2020-05-21 11:13:48.852  INFO 40702 --- [           main] l.c.StandardChangeLogHistoryService      : Reading from public.databasechangelog
2020-05-21 11:13:48.853  INFO 40702 --- [           main] liquibase.executor.jvm.JdbcExecutor      : SELECT * FROM public.databasechangelog ORDER BY DATEEXECUTED ASC, ORDEREXECUTED ASC
2020-05-21 11:13:48.873  INFO 40702 --- [           main] l.lockservice.StandardLockService        : Successfully released change log lock
2020-05-21 11:13:48.959  INFO 40702 --- [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 8 endpoint(s) beneath base path '/actuator'
2020-05-21 11:13:49.017  INFO 40702 --- [           main] o.e.j.s.h.ContextHandler.application     : Initializing Spring DispatcherServlet 'dispatcherServlet'
2020-05-21 11:13:49.017  INFO 40702 --- [           main] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2020-05-21 11:13:49.030  INFO 40702 --- [           main] o.s.web.servlet.DispatcherServlet        : Completed initialization in 13 ms
2020-05-21 11:13:49.067  INFO 40702 --- [           main] o.e.jetty.server.AbstractConnector       : Started ServerConnector@7526515b{HTTP/1.1, (http/1.1)}{0.0.0.0:8080}
2020-05-21 11:13:49.069  INFO 40702 --- [           main] o.s.b.web.embedded.jetty.JettyWebServer  : Jetty started on port(s) 8080 (http/1.1) with context path '/'
2020-05-21 11:13:49.070  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Started JdbcApplication in 8.725 seconds (JVM running for 9.173)
2020-05-21 11:13:49.072  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Lets move some $$ around!
2020-05-21 11:13:51.021  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 7 remaining
2020-05-21 11:13:51.024  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 6 remaining
2020-05-21 11:13:51.024  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 5 remaining
2020-05-21 11:13:51.024  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 4 remaining
2020-05-21 11:13:51.029  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 3 remaining
2020-05-21 11:13:51.030  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 2 remaining
2020-05-21 11:13:51.030  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 1 remaining
2020-05-21 11:13:51.040  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : Worker finished - 0 remaining
2020-05-21 11:13:51.041  INFO 40702 --- [           main] io.roach.data.jdbc.JdbcApplication       : All client workers finished but server keeps running. Have a nice day!
~~~

As the output states, the application configures a database interface, starts a web servlet listening on the address `http://localhost:8080/`, and then runs some test operations as requests to the application's REST API.

### Query the database

#### Reads

The `http://localhost:8080/account` endpoint returns information about all accounts in the database. `GET` requests to these endpoints are executed on the database as simple `SELECT` statements.

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

The `http://localhost:8080/transfer` endpoint performs transfers between accounts. `POST` requests to this endpoint are executed as writes (i.e., `INSERTS` and `UPDATES`) to the database.

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

This section goes into detail about how the application code leverages some standard Spring modules without compromising the integrity and performance guarantees of CockroachDB.

### Main application process

`JdbcApplication.java` defines the application's main process. It starts a Spring Boot web application, and then submits requests to the app's REST API that result in database transactions on the CockroachDB cluster.

Here are the contents of [`JdbcApplication.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/JdbcApplication.java):

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

### Domain entities

`Account.java` defines the [domain entity](https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks) for the `accounts` table. This class is used throughout the application to represent a row of data in the `accounts` table.

Here are the contents of [`Account.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/Account.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/Account.java %}
~~~

### Hypermedia representation

To represent database objects as [HAL+JSON](https://en.wikipedia.org/wiki/Hypertext_Application_Language) for the REST API, the application extends the Spring HATEOAS module's [RepresentationModel](https://docs.spring.io/spring-hateoas/docs/current/reference/html/#fundamentals.representation-models) class with `AccountModel`. Like the `Account` class, its attributes represent a row of data in the `accounts` table.

The contents of [`AccountModel.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/AccountController.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/AccountModel.java %}
~~~

We don't go into much detail about hypermedia representation in this tutorial. For more information, see the [Spring HATEOAS Reference Documentation](https://docs.spring.io/spring-hateoas/docs/current/reference/html/).

### Spring repositories

To abstract the database layer, Spring applications use the [`Repository` interface](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#repositories), or some subinterface of `Repository`. This interface maps to a database object, like a table, and its methods map to queries against that object, like a [`SELECT`](selection-queries.html) or an [`INSERT`](insert.html) statement against a table.

[`AccountRepository.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/AccountRepository.java) defines the main repository for the `accounts` table:

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/AccountRepository.java %}
~~~

`AccountRepository` extends a subinterface of `Repository` that is provided by Spring for generic [CRUD operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) called `CrudRepository`. To support [pagination queries](selection-queries.html#paginate-through-limited-results), repositories in other Spring Data modules, like those in Spring Data JPA, usually extend a subinterface of `CrudRepository`, called `PagingAndSortingRepository`, that includes pagination and sorting methods. At the time this sample application was created, Spring Data JDBC did not support pagination. As a result, `AccountRepository` extends a custom repository, called `PagedAccountRepository`, to provide basic [`LIMIT`/`OFFSET` pagination](selection-queries.html#pagination-example) on queries against the `accounts` table. The `AccountRepository` methods use the [`@Query`](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#jdbc.query-methods.at-query) annotation strategy to define queries manually, as strings.

Note that, in addition to having the `@Repository` annotation, the `AccountRepository` interface has a [`@Transactional` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative-annotations). When [transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) is enabled in an application (i.e., with [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html)), Spring automatically wraps all objects with the `@Transactional` annotation in [a proxy](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-understanding-aop-proxies) that handles calls to the object. For more information, see [Understanding the Spring Framework’s Declarative Transaction Implementation](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#tx-decl-explained) on Spring's documentation website.

`@Transactional` takes a number of parameters, including a `propagation` parameter that determines the transaction propagation behavior around an object (i.e., at what point in the stack a transaction starts and ends). This sample application follows the [entity-control-boundary (ECB) pattern](https://en.wikipedia.org/wiki/Entity-control-boundary). As such, the [REST service boundaries](#rest-controller) should determine where a [transaction](transactions.html) starts and ends rather than the query methods defined in the data access layer. To follow the ECB design pattern, `propagation=MANDATORY` for `AccountRepository`, which means that a transaction must already exist in order to call the `AccountRepository` query methods. In contrast, the `@Transactional` annotations on the [Rest controller entities](#rest-controller) in the web layer have `propagation=REQUIRES_NEW`, meaning that a new transaction must be created for each REST request.

The aspects declared in `TransactionHintsAspect.java` and `RetryableTransactionAspect.java` further control how `@Transactional`-annotated components are handled. For more details on control flow and transaction management in the application, see [Transaction management](#transaction-management).

### REST controller

There are several endpoints exposed by the application's web layer, some of which monitor the health of the application, and some that map to queries executed against the connected database. All of the endpoints served by the application are handled by the `AccountController` class, which is defined in [`AccountController.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/AccountController.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/AccountController.java %}
~~~

 Annotated with [`@RestController`](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html), `AccountController` defines the primary [web controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) component of the application. The `AccountController` methods define the endpoints, routes, and business logic of REST services for account querying and money transferring. Its attributes include an instantiation of [`AccountRepository`](#spring-repositories), called `accountRepository`, that establishes an interface to the `accounts` table through the data access layer.

As mentioned in the [Spring repositories](#spring-repositories) section, the application's transaction boundaries follow the [entity-control-boundary (ECB) pattern](https://en.wikipedia.org/wiki/Entity-control-boundary), meaning that the web service boundaries of the application determine where a [transaction](transactions.html) starts and ends. To follow the ECB pattern, the `@Transactional` annotation on each of the HTTP entities (`listAccounts()`, `getAccount()`, and `transfer()`) has `propagation=REQUIRES_NEW`. This ensures that each time a REST request is made to an endpoint, a new transaction context is created. For details on how aspects handle control flow and transaction management in the application, see [Transaction management](#transaction-management).

### Transaction management

When [transaction management](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative) is enabled in an application (i.e., with [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html)), Spring automatically wraps all objects with the `@Transactional` annotation in [a proxy](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-understanding-aop-proxies) that handles calls to the object. By default, this proxy starts and closes transactions around the method calls, according to the configured behavior (e.g., the `propagation` level). Using [@AspectJ annotations](https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html#transaction-declarative-aspectj), this sample application extends the default transaction proxy behavior with two other explicitly-defined [aspects](https://en.wikipedia.org/wiki/Aspect_(computer_programming)): `TransactionHintsAspect` and `RetryableTransactionAspect`. Methods of these aspects are declared as [advice](https://en.wikipedia.org/wiki/Advice_(programming)) to be executed around a [join point](https://en.wikipedia.org/wiki/Join_point). In this application, all join points are declared on `@Transactional` method calls.

#### Ordering advice

To determine the order of evaluation when multiple transaction advisors are declared around the same [join point](https://en.wikipedia.org/wiki/Join_point) (in this case, around `@Transactional` method calls), the application explicitly declares an order of precedence for calling advice.

At the top level of the application, in the main `JdbcApplication.java` file, the [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/ EnableTransactionManagement.html) annotation is passed an `order` parameter. This parameter sets the order on the primary transaction advisor to one level of precedence above the lowest level, `Ordered.LOWEST_PRECEDENCE`. This means that just one transaction advisor can run after the primary transaction advisor (i.e., within the context of an open transaction). All other advisors must run before the primary transaction advisor (i.e., before the transaction is opened, or after it is closed).

In this application, the advisor with the lowest level of precedence is declared in `TransactionHintsAspect`, the aspect that defines the [transaction attributes](#transaction-attributes). `RetryableTransactionAspect`, the aspect that defines the [transaction retry logic](#transaction-retries), defines the advisor with the high level of precedence. For the two explicitly-defined aspects, the [`@Order`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/annotation/Order.html) annotation is used. Like the `order` parameter on the `@EnableTransactionManagement` annotation, `@Order` takes an order value that indicates the precedence of advice around the same join point.

For details about advice ordering, see [Advice Ordering](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-advice-ordering) on the Spring documentation site.


#### Transaction attributes

The `TransactionHintsAspect` class, declared as an aspect with the [`@Aspect` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-at-aspectj), declares advice that defines the attributes of a transaction. The `@Order` annotation is passed the lowest level, `Ordered.LOWEST_PRECEDENCE`, indicating that this advisor must run after the main transaction advisor, within the context of a transaction. Here are the contents of [`TransactionHintsAspect.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/TransactionHintsAspect.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/TransactionHintsAspect.java %}
~~~

The `anyTransactionBoundaryOperation` method is declared as a pointcut with the [`@Pointcut` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-pointcuts). In Spring, pointcut declarations must include an expression to determine where [join points](https://en.wikipedia.org/wiki/Join_point) occur in the application control flow. To help define these expressions, Spring supports a set of [designators](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-pointcuts-designators). The application uses two of them here: `execution`, which matches method execution joint points (i.e., defines a joint point when a specific method is executed, in this case, *any* method in the `io.roach.` namespace), and `@annotation`, which limits the matches to methods with a specific annotation, in this case `@Transactional`.

`setTransactionAttributes` sets the transaction attributes in the form of advice. Spring supports [several different annotations to declare advice](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-advice). The [`@Around` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-around-advice) declares `setTransactionAttributes` as the advice to execute at a `anyTransactionBoundaryOperation(transactional)` join point.

On verifying that the transaction is active (using `TransactionSynchronizationManager.isActualTransactionActive()`), the advice [sets some session variables](set-vars.html) using methods of the [`JdbcTemplate`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html) object declared at the top of the `TransactionHintsAspect` class definition. These session variables (`application_name`, `statement_timeout`, and `transaction_read_only`) set [the application name](connection-parameters.html#additional-connection-parameters) for the query to "`roach-data`", the time allowed for the statement to execute before timing out to 1000 milliseconds (i.e., 1 second), and the [transaction access mode](set-transaction.html#parameters) as either `READ ONLY` or `READ WRITE`.

#### Transaction retries

To [avoid transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention), we highly recommend writing [client-side transaction retry logic](transactions.html#client-side-intervention) into applications written on CockroachDB. In this application, transaction retry logic is written into the methods of the `RetryableTransactionAspect` class, which is declared as an aspect with the `@Aspect` annotation. The `@Order` annotation is passed `Ordered.LOWEST_PRECEDENCE-2`, a level of precedence above the primary transaction advisor. This indicates that this advisor must run outside the context of a transaction. Here are the contents of [`RetryableTransactionAspect.java`](https://github.com/cockroachlabs/roach-data/blob/master/roach-data-jdbc/src/main/java/io/roach/data/RetryableTransactionAspect.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/spring-data-jdbc/RetryableTransactionAspect.java %}
~~~

The `anyTransactionBoundaryOperation` method is declared as a pointcut with the [`@Pointcut` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-pointcuts). This pointcut definition is identical to the one declared in `TransactionHintsAspect`. The `execution` designator matches method execution joint points (i.e., defines a joint point when a specific method is executed, in this case, *any* method in the `io.roach.` namespace). Its `@annotation` designator limits the matches to methods with a specific annotation, in this case `@Transactional`.

`retryableOperation` handles the application retry logic in the form of advice. Spring supports [several different annotations to declare advice](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-advice). The [`@Around` annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-ataspectj-around-advice) declares `retryableOperation` as the advice to execute at a `anyTransactionBoundaryOperation(transactional)` join point.

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
