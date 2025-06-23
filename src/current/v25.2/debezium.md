---
title: Migrate Data with Debezium
summary: Use Debezium to migrate data to a CockroachDB cluster.
toc: true
docs_area: migrate
---

[Debezium](https://debezium.io/) is a self-hosted distributed platform that can read data from a variety of sources and import it into Kafka. You can use Debezium to [migrate data to CockroachDB](#migrate-data-to-cockroachdb) from another database that is accessible over the public internet.

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
Migrating with Debezium requires familiarity with Kafka. Refer to the [Debezium documentation](https://debezium.io/documentation/reference/stable/architecture.html) for information on how Debezium is deployed with Kafka Connect.
{{site.data.alerts.end}}

## Before you begin

Complete the following items before using Debezium:

- Configure a secure [publicly-accessible]({% link cockroachcloud/network-authorization.md %}) CockroachDB cluster running the latest **{{ page.version.version }}** [production release]({% link releases/{{ page.version.version }}.md %}) with at least one [SQL user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users), make a note of the credentials for the SQL user.
- Install and configure [Debezium](https://debezium.io/), [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html), and [Kafka](https://kafka.apache.org/).

## Migrate data to CockroachDB

Once all of the [prerequisite steps](#before-you-begin) are completed, you can use Debezium to migrate data to CockroachDB.

1. To write data from Kafka to CockroachDB, use the Confluent JDBC Sink Connector. First use the following `dockerfile` to create a custom image with the [JDBC driver](https://www.confluent.io/hub/confluentinc/kafka-connect-jdbc):

    {% include_cached copy-clipboard.html %}
    ~~~
    FROM quay.io/debezium/connect:latest
    ENV KAFKA_CONNECT_JDBC_DIR=$KAFKA_CONNECT_PLUGINS_DIR/kafka-connect-jdbc


    ARG POSTGRES_VERSION=latest
    ARG KAFKA_JDBC_VERSION=latest


    # Deploy PostgreSQL JDBC Driver
    RUN cd /kafka/libs && curl -sO https://jdbc.postgresql.org/download/postgresql-$POSTGRES_VERSION.jar


    # Deploy Kafka Connect JDBC
    RUN mkdir $KAFKA_CONNECT_JDBC_DIR && cd $KAFKA_CONNECT_JDBC_DIR &&\
       curl -sO https://packages.confluent.io/maven/io/confluent/kafka-connect-jdbc/$KAFKA_JDBC_VERSION/kafka-connect-jdbc-$KAFKA_JDBC_VERSION.jar
    ~~~

1. Create the JSON configuration file that you will use to add data from your [source database](https://debezium.io/documentation/reference/stable/connectors/index.html) to a Kafka topic. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    {
      "name": "pg-source",
      "config": {
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "database.dbname": "{database}",
        "database.hostname": "{hostname}",
        "database.password": "",
        "database.port": "5432",
        "database.user": "postgres",
        "plugin.name": "pgoutput",
        "table.include.list": "public.test_table_small",
        "tasks.max": "1",
        "topic.creation.default.cleanup.policy": "delete",
        "topic.creation.default.partitions": "10",
        "topic.creation.default.replication.factor": "1",
        "topic.creation.default.retention.ms": "604800000",
        "topic.creation.enable": "true",
        "topic.prefix": "{username}",
        "slot.name" : "debezium"
      }
    }
    ~~~

1. Create the JSON configuration file that you will use to create the sink. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    {
      "name": "pg-sink",
      "config": {
        "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector", 
        "tasks.max": "10",
        "topics" : "{topic.example.table}",
        "connection.url": "jdbc:postgresql://{host}:{port}/{username}?sslmode=require",
        "connection.user": "{username}",
        "connection.password": "{password}",
        "insert.mode": "upsert",
        "pk.mode": "record_value",
        "pk.fields": "id",
        "database.time_zone": "UTC",
        "auto.create": true,
        "auto.evolve": false,
        "transforms": "unwrap",
        "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState"
      }
    }
    ~~~
    
    Specify `connection.url` in [JDBC format]({% link {{ page.version.version }}/connect-to-the-database.md %}?filters=java&#step-5-connect-to-the-cluster). For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}).
    
    The preceding snippet is an example configuration. For details on the configurable fields, see the [Confluent JDBC Sink Connector documentation](https://docs.confluent.io/kafka-connectors/jdbc/current/sink-connector/sink_config_options.html).

1. To create the sink, `POST` the JSON configuration file to the Kafka Connect `/connectors` endpoint. Refer to the [Kafka Connect API documentation](https://kafka.apache.org/documentation/#connect_rest) for more information.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Third-Party Tools Supported by Cockroach Labs]({% link {{ page.version.version }}/third-party-database-tools.md %})
- [Stream a Changefeed to a Confluent Cloud Kafka Cluster]({% link {{ page.version.version }}/stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.md %})
