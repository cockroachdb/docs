---
title: Migrate and Replicate Data with Debezium
summary: Use Debezium to migrate data to a CockroachDB cluster.
toc: true
docs_area: migrate
---

[Debezium](https://debezium.io/) is a self-hosted, distributed platform that can be used to read data from a variety of sources and push that data into Kafka. You can use Debezium to [migrate data to CockroachDB](#migrate-data-to-cockroachdb) from an existing, publicly hosted database containing application data.

As of this writing, Debezium supports the following database [sources](https://debezium.io/documentation/reference/stable/connectors/index.html):

- MongoDB
- MySQL
- PostgreSQL
- SQL Server
- Oracle
- Db2
- Cassandra
- Vitess (incubating)
- Spanner (incubating)
- JDBC (incubating)

{{site.data.alerts.callout_info}}
Migrating with Debezium is only recommended for users already familiar with Kafka. Refer to the [Debezium documentation](https://debezium.io/documentation/reference/stable/architecture.html) for information on how Debezium is deployed with Kafka Connect.
{{site.data.alerts.end}}

## Before you begin

Complete the following items before using Debezium:

- Ensure you have a secure, [publicly available]({% link cockroachcloud/network-authorization.md %}) CockroachDB cluster running the latest **{{ page.version.version }}** [production release](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}), and have created a [SQL user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users).
- Have [Debezium](https://debezium.io/), [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html), and [Kafka](https://kafka.apache.org/) already set up. This documentation assumes you have already added data from your [source database](https://debezium.io/documentation/reference/stable/connectors/index.html) to a Kafka topic.

## Migrate data to CockroachDB

Once all of the [prerequisite steps](#before-you-begin) are completed, you can use Debezium to migrate data to CockroachDB.

1. To write data from Kafka to CockroachDB, use the Confluent JDBC Sink Connector. First use the following `dockerfile` to create a custom image with the JDBC driver:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    FROM quay.io/debezium/connect:latest
    ENV KAFKA_CONNECT_JDBC_DIR=$KAFKA_CONNECT_PLUGINS_DIR/kafka-connect-jdbc \


    ARG POSTGRES_VERSION=latest
    ARG KAFKA_JDBC_VERSION=latest


    # Deploy PostgreSQL JDBC Driver
    RUN cd /kafka/libs && curl -sO https://jdbc.postgresql.org/download/postgresql-$POSTGRES_VERSION.jar


    # Deploy Kafka Connect JDBC
    RUN mkdir $KAFKA_CONNECT_JDBC_DIR && cd $KAFKA_CONNECT_JDBC_DIR &&\
       curl -sO https://packages.confluent.io/maven/io/confluent/kafka-connect-jdbc/$KAFKA_JDBC_VERSION/kafka-connect-jdbc-$KAFKA_JDBC_VERSION.jar
    ~~~

1. Create the JSON configuration file needed to create the sink:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    {
       "name": "pg-sink",
       "config": {
           "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector", 
           "tasks.max": "10",
           "topics" : "{topic.example.table}",
           "connection.url": "jdbc:postgresql://{host}:{port}/{user}?sslmode=require",
           "connection.user": "{username}",
           "connection.password": "{password}",
           "insert.mode": "upsert",
           "pk.mode": "record_value",
           "pk.fields":"id",
           "database.time_zone": "UTC",
           "auto.create":true,
           "auto.evolve": false,
           "transforms": "unwrap",
           "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState"
       }
    }
    ~~~
    
    Specify the **Connection URL** in [JDBC format]({% link {{ page.version.version }}/connect-to-the-database.md %}?filters=java&#step-5-connect-to-the-cluster). For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}).

## See also

- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Third-Party Tools Supported by Cockroach Labs]({% link {{ page.version.version }}/third-party-database-tools.md %})
- [Stream a Changefeed to a Confluent Cloud Kafka Cluster]({% link {{ page.version.version }}/stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.md %})
