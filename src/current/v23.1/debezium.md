---
title: Migrate and Replicate Data with Debezium
summary: Use Debezium to migrate data to a CockroachDB cluster.
toc: true
docs_area: migrate
---

[Debezium](https://debezium.io/) is a self-hosted, distributed platform for change data capture that you can use to [migrate data to CockroachDB](#migrate-and-replicate-data-to-cockroachdb) from an existing, publicly hosted database containing application data, such as PostgreSQL, MySQL, Oracle, or Microsoft SQL Server. 

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

This page describes Debezium at a high level and assumes some familiarity with this tool.. For detailed information, refer to the [Debezium documentation](https://debezium.io/documentation/reference/stable/index.html).

## Before you begin

Complete the following items before using Debezium:

- Ensure you have a secure, [publicly available]({% link cockroachcloud/network-authorization.md %}) CockroachDB cluster running the latest **{{ page.version.version }}** [production release](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}), and have created a [SQL user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users).

- Have a [Kafka](https://kafka.apache.org/) instance running with [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) already set up.

{{site.data.alerts.callout_info}}
Migrating with Debezium is only recommended for users already familiar with Kafka. Refer to [Stream a Changefeed to a Confluent Cloud Kafka Cluster](https://www.cockroachlabs.com/docs/stable/stream-a-changefeed-to-a-confluent-cloud-kafka-cluster) for a tutorial on using Kafka with CockroachDB.
{{site.data.alerts.end}}

## Migrate and replicate data to CockroachDB

You can use Debezium to migrate tables from a source database to CockroachDB. This can comprise an initial load that copies the selected schemas and their data from the source database to CockroachDB, followed by continuous replication of ongoing changes using Debezium change event streams.

Docker Compose file:

~~~
version: '3.9'


services:
 zookeeper:
   image: confluentinc/cp-zookeeper:latest
   hostname: zookeeper
   container_name: zookeeper
   ports:
     - '2181:2181'
   environment:
     ZOOKEEPER_CLIENT_PORT: 2181
     ZOOKEEPER_TICK_TIME: 2000
   healthcheck:
     test: echo srvr | nc zookeeper 2181 || exit 1
     start_period: 10s
     retries: 20
     interval: 10s
 broker:
   image: confluentinc/cp-kafka:latest
   hostname: broker
   container_name: broker
   depends_on:
     zookeeper:
       condition: service_healthy
   ports:
     - '29092:29092'
     - '9092:9092'
     - '9101:9101'
   environment:
     KAFKA_BROKER_ID: 1
     KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
     KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
     KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://broker:29092,PLAINTEXT_HOST://localhost:9092
     KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
     KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
     KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
     KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
     KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
     KAFKA_JMX_PORT: 9101
     KAFKA_JMX_HOSTNAME: localhost
   healthcheck:
     test: nc -z localhost 9092 || exit -1
     start_period: 15s
     interval: 5s
     timeout: 10s
     retries: 10
 debezium:
   build: .
   restart: always
   container_name: debezium
   hostname: debezium
   depends_on:
     broker:
       condition: service_healthy
   ports:
     - '8083:8083'
   environment:
     BOOTSTRAP_SERVERS: broker:29092
     GROUP_ID: 1
     CONFIG_STORAGE_TOPIC: connect_configs
     STATUS_STORAGE_TOPIC: connect_statuses
     OFFSET_STORAGE_TOPIC: connect_offsets
     KEY_CONVERTER: org.apache.kafka.connect.json.JsonConverter
     VALUE_CONVERTER: org.apache.kafka.connect.json.JsonConverter
     ENABLE_DEBEZIUM_SCRIPTING: 'true'
   healthcheck:
     test:
       [
         'CMD',
         'curl',
         '--silent',
         '--fail',
         '-X',
         'GET',
         'http://localhost:8083/connectors',
       ]
     start_period: 10s
     interval: 10s
     timeout: 5s
     retries: 5


 schema-registry:
   image: confluentinc/cp-schema-registry:7.3.1
   hostname: schema-registry
   container_name: schema-registry
   depends_on:
     broker:
       condition: service_healthy
   ports:
     - '8081:8081'
   environment:
     SCHEMA_REGISTRY_HOST_NAME: schema-registry
     SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: broker:29092
     SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081


   healthcheck:
     start_period: 10s
     interval: 10s
     retries: 20
     test: curl --user superUser:superUser --fail --silent --insecure http://localhost:8081/subjects --output /dev/null || exit 1


 rest-proxy:
   image: confluentinc/cp-kafka-rest:7.3.1
   depends_on:
     broker:
       condition: service_healthy
   ports:
     - '8082:8082'
   hostname: rest-proxy
   container_name: rest-proxy
   environment:
     KAFKA_REST_HOST_NAME: rest-proxy
     KAFKA_REST_BOOTSTRAP_SERVERS: 'broker:29092'
     KAFKA_REST_LISTENERS: 'http://0.0.0.0:8082'
 debezium-ui:
   image: debezium/debezium-ui:latest
   restart: always
   container_name: debezium-ui
   hostname: debezium-ui
   depends_on:
     debezium:
       condition: service_healthy
   ports:
     - '8090:8080'
   environment:
     KAFKA_CONNECT_URIS: http://debezium:8083
 kafka-ui:
   image: provectuslabs/kafka-ui
   links:
    - broker
   ports:
    - 8888:8080
   restart: always
   environment:
     - KAFKA_CLUSTERS_0_NAME=local
     - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=broker:29092
~~~

1. `Dockerfile` needed to build a custom image with the Confluent JDBC driver:

~~~
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

1. JSON configuration needed to create the source. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}). Specify the **Connection URL** in [JDBC format]({% link {{ page.version.version }}/connect-to-the-database.md %}?filters=java&#step-5-connect-to-the-cluster).

~~~
{
 "name": "pg-source",
 "config": {
   "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
   "database.dbname": "rdsdb",
   "database.hostname": "migrations-dms.cpa6lrp2ahsc.us-east-1.rds.amazonaws.com",
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
   "topic.prefix":"jyang",
   "slot.name" : "debezium"
 }
}
~~~

1. JSON configuration needed to create the sink:

~~~
{
   "name": "pg-sink",
   "config": {
       "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector", 
       "tasks.max": "10",
       "topics" : "jyang.public.test_table_small",
       "connection.url": "jdbc:postgresql://fourth-beast-2540.6h5c.crdb.io:26257/jyang?sslmode=require",
       "connection.user": "jyang",
       "connection.password": "",
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

## See also

- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Third-Party Tools Supported by Cockroach Labs]({% link {{ page.version.version }}/third-party-database-tools.md %})
