---
title: Stream a Changefeed to a Confluent Cloud Kafka Cluster
summary: Learn how to connect a changefeed to stream data to a Confluent Cloud Kafka cluster.
toc: true
docs_area: stream_data
---

CockroachDB {{ site.data.products.enterprise }} changefeeds can stream change data out to [Apache Kafka](changefeed-sinks.html) with different [configuration settings](changefeed-sinks.html#kafka-sink-configuration) and [options](create-changefeed.html). [Confluent Cloud](https://www.confluent.io/confluent-cloud/) provides a fully managed service for running Apache Kafka as well as the [Confluent Cloud Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html). 

A schema registry is a repository for schemas, which allows you to share and manage schemas between different services. Confluent Cloud Schema Registries map to Kafka topics in your Confluent Cloud environment.

In this tutorial, you will set up a changefeed to stream data from CockroachDB to a Kafka cluster in Confluent Cloud. You will also connect a Schema Registry that retrieves the schemas from your changefeed's messages.

An overview of the workflow involves creating and connecting the following:

1. Confluent Cloud Kafka cluster
1. Confluent Schema Registry
1. Changefeed streaming to your Confluent Cloud Kafka cluster 

## Prerequisites 

You will need the following set up before starting this tutorial:

- A CockroachDB cluster. You can use a {{ site.data.products.db }} or {{ site.data.products.core }} cluster. For {{ site.data.products.db }}, see the [Quickstart with CockroachDB](../cockroachcloud/quickstart.html) guide. Or, see the {{ site.data.products.core }} [install](install-cockroachdb-mac.html) page. 
- A Confluent Cloud account. See Confluent's [Get started](https://www.confluent.io/get-started/) page for details.
- The Confluent CLI. See [Install Confluent CLI](https://docs.confluent.io/confluent-cli/current/install.html) to set this up. Note that you can also complete the steps in this tutorial in Confluent's Cloud console.

This tutorial uses the Cockroach Labs [`movr`](movr.html) workload as an example database.

## Step 1. Create a Confluent Cloud Kafka cluster 

In this step, you'll use the Confluent CLI to create and configure a Kafka cluster. 

First, ensure you are logged in to Confluent Cloud:

~~~shell
confluent login --save
~~~

Use the `--save` flag to save your username and password, which will automatically log you back in. 

List the [environments](https://docs.confluent.io/cloud/current/access-management/hierarchy/cloud-environments.html) in your Confluent Cloud account:

~~~shell
confluent environment list
~~~

If you haven't created an environment explicitly, this command will list a default environment. You can use the default environment for this tutorial. 

However, if you would prefer to create an environment, run the following command with a name for your environment:

~~~shell
confluent environment create {ENVIRONMENT NAME}
~~~

Set the environment that you would like to create your cluster in:

~~~shell
confluent environment use {ENVIRONMENT ID}
~~~

Next, create a Kafka cluster: 

~~~shell
confluent kafka cluster create movr-confluent-tutorial --cloud "gcp" --region "us-east1"
~~~

Here the name of the cluster is `movr-confluent-tutorial`, but you can change this for your cluster.

Note that the `--cloud` and `--region` flags are **required** when running this `create` command. See Confluent's documentation on [`confluent kafka cluster create`](https://docs.confluent.io/confluent-cli/current/command-reference/kafka/cluster/confluent_kafka_cluster_create.html).

You will receive similar output, which displays your cluster's details. You'll need some of this information later in the tutorial:

~~~
+---------------+--------------------------------------------------------+
| ID            | lkc-{ID}                                             |
| Name          | movr-confluent-tutorial                                |
| Type          | BASIC                                                  |
| Ingress       |                                                    100 |
| Egress        |                                                    100 |
| Storage       | 5 TB                                                   |
| Provider      | gcp                                                    |
| Availability  | single-zone                                            |
| Region        | us-east1                                               |
| Status        | PROVISIONING                                           |
| Endpoint      | SASL_SSL://pkc-4yyd6.us-east1.gcp.confluent.cloud:9092 |
| API Endpoint  | https://pkac-ew1dj.us-east1.gcp.confluent.cloud        |
| REST Endpoint | https://pkc-4yyd6.us-east1.gcp.confluent.cloud:443     |
+---------------+--------------------------------------------------------+
~~~

To find your cluster's information at a later time, run:

~~~shell 
confluent kafka cluster describe {CLUSTER ID}
~~~

## Step 2. Create a cluster API key and secret 

In this step, you'll create an API key and secret for your Kafka cluster, which you'll need for connecting to your changefeed. 

Create the API key for your Kafka cluster:

~~~shell
confluent api-key create --resource {CLUSTER ID}
~~~

You will receive output displaying your API and secret key.

Then, to make the consumer setup easier later in the tutorial, you can store the API key locally and set it as your active API key:

~~~shell
confluent api-key store --resource {CLUSTER ID}
~~~
~~~shell
confluent api-key use --resource {CLUSTER ID}
~~~

This will prompt you to enter your API and secret key. Use the `--force` flag if you already have a key stored in your local environment. 

## Step 3. Create Kafka topics 

Next, you'll create the Kafka topics for your changefeed messages.

Ensure you have the correct active Kafka cluster:

~~~shell
confluent kafka cluster use {CLUSTER ID}
~~~
~~~
Set Kafka cluster "lkc-{ID}" as the active cluster for environment "env-{ID}".
~~~

Run the following to create a topic:

~~~shell
confluent kafka topic create {users}
~~~

`users` will be the topic name for this tutorial. Change the topic name for your purposes and run the previous command for each topic you would like to create.

{{site.data.alerts.callout_success}}
If you are using a Dedicated Confluent Cloud cluster, you can auto enable topic creation. For further detail, see [Enable automatic topic creation](https://docs.confluent.io/cloud/current/clusters/broker-config.html#enable-automatic-topic-creation). 
{{site.data.alerts.end}}

## Step 4. Create a Confluent Schema Registry 

In this step, you'll create the Schema Registry in your environment. 

Enable the Schema Registry for the active environment: 

~~~shell
confluent schema-registry cluster enable --cloud "gcp" --geo "us"
~~~

The `--cloud` and `--geo` flags are **required** with this `enable` command. See the [`confluent schema-registry cluster enable`](https://docs.confluent.io/confluent-cli/current/command-reference/schema-registry/cluster/confluent_schema-registry_cluster_enable.html) docs for more detail. To match the Kafka cluster setup for this tutorial, the `cloud` is set to Google Cloud Platform and the `geo` to the US.

You will receive output showing the Schema Registry's ID and its endpoint URL:

~~~
+--------------+----------------------------------------------------+
| Id           | lsrc-816zp7                                        |
| Endpoint URL | https://psrc-x77pq.us-central1.gcp.confluent.cloud |
+--------------+----------------------------------------------------+
~~~

## Step 5. Create a Schema Registry API key and secret 

Next, generate an API and secret key for the Schema Registry using the ID from your output:

~~~shell 
confluent api-key create --resource {SCHEMA REGISTRY ID}
~~~

The output will display your API key and secret. You'll need these to create your Kafka consumer and start your changefeed.

## Step 6. Create a Kafka consumer 

In this step, you'll start a Kafka consumer for the changefeed messages.

Run the following command to create a consumer:

~~~shell
confluent kafka topic consume users \
 --value-format avro \
 --from-beginning \
 --sr-endpoint https://{psrc-x77pq.us-central1.gcp}.confluent.cloud \
 --sr-api-key {SCHEMA REGISTRY API Key} \
 --sr-api-secret {SCHEMA REGISTRY SECRET}
~~~

In this command, you need to pass the following Schema Registry details:

- The endpoint from the output in [Step 4](#step-4-create-a-confluent-schema-registry)
- The API and secret key from [Step 5](#step-5-create-a-schema-registry-api-key-and-secret)

Once you run this command, your terminal will wait for messages. 

{{site.data.alerts.callout_success}}
Run `confluent schema-registry cluster describe` to access details for the Schema Registry.
{{site.data.alerts.end}}

## Step 7. Create a changefeed 

To create your changefeed, you'll prepare your CockroachDB cluster and the necessary authentication to your Kafka cluster and Schema Registry.

In a new terminal window, start a SQL session for your CockroachDB cluster:

~~~shell
cockroach sql --url {CONNECTION STRING}
~~~

Before you can create an {{ site.data.products.enterprise }} changefeed, it is necessary to enable rangefeeds on your cluster:

~~~sql 
SET CLUSTER SETTING kv.rangefeed.enabled = true;
~~~

Before running the [`CREATE CHANGEFEED`](create-changefeed.html) statement, you must **URL-encode** both the cluster's and the Schema Registry's API secret key.

Create the changefeed with the following statement:

~~~sql
CREATE CHANGEFEED FOR TABLE users INTO "kafka://pkc-4yyd6.us-east1.gcp.confluent.cloud:9092?tls_enabled=true&sasl_enabled=true&sasl_user=Y4VBMK6ECMXW34TT&sasl_password={URL-ENCODED CLUSTER SECRET KEY}&sasl_mechanism=PLAIN" WITH updated, format = avro, confluent_schema_registry = "https://P5FYPS7VVXS4ELTT:{URL-ENCODED SCHEMA REGISTRY SECRET KEY}@psrc-x77pq.us-central1.gcp.confluent.cloud:443";
~~~

To connect to the Kafka cluster, use the `Endpoint` from your cluster details preceded with the `kafka://` scheme. For example, an endpoint of `pkc-4yyd6.us-east1.gcp.confluent.cloud:9092` would be: `kafka://pkc-4yyd6.us-east1.gcp.confluent.cloud:9092`. 

Since the Kafka cluster uses `SASL` authentication. You need to include the following [parameters](create-changefeed.html#query-parameters):

- `tls_enabled=true`
- `sasl_enabled=true`
- `sasl_user={CLUSTER API KEY}`
- `sasl_password={URL-ENCODED CLUSTER SECRET KEY}`
- `sasl_mechanism=PLAIN`

Use the following options to define the format and schema registry:

- `format = avro`
- `confluent_schema_registry = "https://{API KEY}:{URL-ENCODED SCHEMA REGISTRY SECRET KEY}@{SCHEMA REGISTRY URL}:443"`. Note that the schema registry uses basic authentication, which means that the URL's format is different to the Kafka URL.
- Any other options to configure your changefeed. See [Options](create-changefeed.html#options) for a list of all available {{ site.data.products.enterprise }} changefeed options.

## Step 8. Verify the output

Move to the terminal window in which you started the consumer. As the changefeed runs, you will see the change data messages:

~~~
. . .
{"after":{"users":{"name":{"string":"Michael Clark"},"address":{"string":"85957 Ashley Junctions"},"credit_card":{"string":"4144089313"},"id":{"string":"d84cf3b6-7029-4d4d-aa81-e5caa9cce09e"},"city":{"string":"seattle"}}},"updated":{"string":"1659643584586630201.0000000000"}}
{"after":{"users":{"address":{"string":"17068 Christopher Isle"},"credit_card":{"string":"6664835435"},"id":{"string":"11b99275-92ce-4244-be61-4dae21973f87"},"city":{"string":"amsterdam"},"name":{"string":"John Soto"}}},"updated":{"string":"1659643585384406152.0000000000"}}
{"after":{"users":{"id":{"string":"a4666991-0292-4b00-8df0-d807c10eded5"},"city":{"string":"boston"},"name":{"string":"Anthony Snow"},"address":{"string":"74151 Carrillo Ramp"},"credit_card":{"string":"2630730025"}}},"updated":{"string":"1659643584990243411.0000000000"}}
{"updated":{"string":"1659643584877025654.0000000000"},"after":{"users":{"city":{"string":"seattle"},"name":{"string":"Tanya Holmes"},"address":{"string":"19023 Murphy Mall Apt. 79"},"credit_card":{"string":"6549598808"},"id":{"string":"434d4827-945f-4c7a-8d10-05c03e3bbeeb"}}}}
. . .
~~~

You can also view the messages for your cluster in the Confluent Cloud console in the **Topics** sidebar under the **Messages** tab. 

<img src="{{ 'images/v22.1/confluent-messages-screenshot.png' | relative_url }}" alt="Users topic messages in the Confluent Cloud console." style="border:1px solid #eee;max-width:100%" />

You can use the **Schema** tab to view the schema for a specific topic.

<img src="{{ 'images/v22.1/confluent-schemas-screenshot.png' | relative_url }}" alt="Users vale schema in the Confluent Cloud console." style="border:1px solid #eee;max-width:100%" />

## See also

- [Changefeed Sinks](changefeed-sinks.html)
- [Responses](use-changefeeds.html#responses)
