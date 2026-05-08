---
title: Stream a Changefeed to a Confluent Cloud Kafka Cluster
summary: Learn how to connect a changefeed to stream data to a Confluent Cloud Kafka cluster.
toc: true
docs_area: stream_data
---

CockroachDB changefeeds can stream change data out to [Apache Kafka](https://kafka.apache.org/) with different [configuration settings]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka-sink-configuration) and [options]({% link {{ page.version.version }}/create-changefeed.md %}). [Confluent Cloud](https://www.confluent.io/confluent-cloud/) provides a fully managed service for running Apache Kafka as well as the [Confluent Cloud Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html).

A schema registry is a repository for schemas, which allows you to share and manage schemas between different services. Confluent Cloud Schema Registries map to Kafka topics in your Confluent Cloud environment.

In this tutorial, you will set up a changefeed to stream data from CockroachDB to a Kafka cluster in Confluent Cloud. You will also connect a Schema Registry that retrieves the schemas from your changefeed's messages.

An overview of the workflow involves creating and connecting the following:

1. Confluent Cloud Kafka cluster
1. Confluent Schema Registry
1. Changefeed streaming to your Confluent Cloud Kafka cluster

## Before you begin

You will need the following set up before starting this tutorial:

- A CockroachDB cluster. You can use a CockroachDB {{ site.data.products.cloud }} or CockroachDB {{ site.data.products.core }} cluster. If you are using CockroachDB {{ site.data.products.basic }}, {{ site.data.products.standard }}, or CockroachDB {{ site.data.products.advanced }}, see the [Quickstart with CockroachDB]({% link cockroachcloud/quickstart.md %}) guide. For CockroachDB {{ site.data.products.core }} clusters, see the [install]({% link {{ page.version.version }}/install-cockroachdb-mac.md %}) page.
- A Confluent Cloud account. See Confluent's [Get started](https://www.confluent.io/get-started/) page for details.
- The Confluent CLI. See [Install Confluent CLI](https://docs.confluent.io/confluent-cli/current/install.html) to set this up. This tutorial uses v3.3.0 of the Confluent CLI. Note that you can also complete the steps in this tutorial in Confluent's Cloud console.
- {% include {{ page.version.version }}/cdc/tutorial-privilege-check.md %}

This tutorial uses the Cockroach Labs [`movr`]({% link {{ page.version.version }}/movr.md %}) workload as an example database.

## Step 1. Create a Confluent Cloud Kafka cluster

In this step, you'll use the Confluent CLI to create and configure a Kafka cluster.

1. Ensure you are logged in to Confluent Cloud:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent login --save
    ~~~

    These instructions use the `--save` flag to store your username and password to a local file for convenience during this tutorial, but you can omit this flag if you would prefer to manually authenticate yourself each time.

1. List the [environments](https://docs.confluent.io/cloud/current/access-management/hierarchy/cloud-environments.html) in your Confluent Cloud account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent environment list
    ~~~

    If you haven't created an environment explicitly, this command will list a default environment. You can use the default environment for this tutorial.

1. If you would prefer to create an environment, run the following command with a name for your environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent environment create {ENVIRONMENT NAME}
    ~~~

1. Set the environment that you would like to create your cluster in, using the environment's `ID`, which starts with `env-`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent environment use {ENVIRONMENT ID}
    ~~~

1. Create a Kafka cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent kafka cluster create movr-confluent-tutorial --cloud "gcp" --region "us-east1"
    ~~~

    Here the name of the cluster is `movr-confluent-tutorial`, but you can change this for your cluster.

    Note that the `--cloud` and `--region` flags are **required** when running the `create` command. See Confluent's documentation on [`confluent kafka cluster create`](https://docs.confluent.io/confluent-cli/current/command-reference/kafka/cluster/confluent_kafka_cluster_create.html).

    The `create` command returns your new cluster's details, with a format similar to the following:

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

    You'll need this information later in the tutorial, but you can also access this status at any time with the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent kafka cluster describe {CLUSTER ID}
    ~~~

    {{site.data.alerts.callout_info}}
    It can take up to 5 minutes for your Kafka cluster to provision. The `Status` field in the cluster's details will change from `PROVISIONING` to `UP` once your Kafka cluster is ready.
    {{site.data.alerts.end}}

## Step 2. Create a cluster API key and secret

In this step, you'll create an API key and secret for your Kafka cluster, which you'll need for connecting to your changefeed.

1. Create the API key for your Kafka cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent api-key create --resource {CLUSTER ID}
    ~~~

    You will receive output displaying your API and secret key.

1. To make the consumer setup easier later in the tutorial, you can store the API key locally and set it as your active API key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent api-key store --resource {CLUSTER ID}
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent api-key use {API KEY} --resource {CLUSTER ID}
    ~~~

    This will prompt you to enter your API and secret key. Use the `--force` flag if you already have a key stored in your local environment.

## Step 3. Create Kafka topics

Next, you'll create the Kafka topics for your changefeed messages.

1. Ensure you have the correct active Kafka cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent kafka cluster use {CLUSTER ID}
    ~~~

    ~~~
    Set Kafka cluster "lkc-{ID}" as the active cluster for environment "env-{ID}".
    ~~~

1. Run the following command to create a topic:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    confluent kafka topic create users
    ~~~

    `users` will be the topic name for this tutorial. If needed, you can change the topic name for your purposes and run the previous command for each topic you would like to create.

    {{site.data.alerts.callout_success}}
    If you are using a Dedicated Confluent Cloud cluster, you can enable auto topic creation. For further detail, see [Enable automatic topic creation](https://docs.confluent.io/cloud/current/clusters/broker-config.html#enable-automatic-topic-creation).
    {{site.data.alerts.end}}

## Step 4. Create a Confluent Schema Registry

In this step, you'll create the Schema Registry in your environment.

Enable the Schema Registry for the active environment:

{% include_cached copy-clipboard.html %}
~~~ shell
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

Generate an API and secret key for the Schema Registry using the ID from your output:

{% include_cached copy-clipboard.html %}
~~~ shell
confluent api-key create --resource {SCHEMA REGISTRY ID}
~~~

The output will display your API key and secret. You'll need these to create your Kafka consumer and start your changefeed.

## Step 6. Create a Kafka consumer

In this step, you'll start a Kafka consumer for the changefeed messages.

Run the following command to create a consumer:

{% include_cached copy-clipboard.html %}
~~~ shell
confluent kafka topic consume users \
 --value-format avro \
 --from-beginning \
 --schema-registry-endpoint {SCHEMA REGISTRY ENDPOINT URL} \
 --schema-registry-api-key {SCHEMA REGISTRY API KEY} \
 --schema-registry-api-secret {SCHEMA REGISTRY SECRET}
~~~

In this command, you need to pass the following Schema Registry details:

- The endpoint URL from the output in [Step 4](#step-4-create-a-confluent-schema-registry)
- The API and secret key from [Step 5](#step-5-create-a-schema-registry-api-key-and-secret)

For this command to run successfully, ensure that `confluent kafka cluster describe {CLUSTER ID}` returns a `Status` of `UP`.

Your terminal will wait for messages after this command has run successfully.

{{site.data.alerts.callout_success}}
Run `confluent schema-registry cluster describe` to access details for the Schema Registry, if needed.
{{site.data.alerts.end}}

## Step 7. Prepare your CockroachDB cluster

To create your changefeed, you'll prepare your CockroachDB cluster with the `movr` workload and [enable rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}).

1. In a new terminal window, initiate the `movr` workload for your cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach workload init movr {"CONNECTION STRING"}
    ~~~

1. Run the workload to generate some data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach workload run movr --duration=1m {"CONNECTION STRING"}
    ~~~

1. Start a [SQL session]({% link {{ page.version.version }}/cockroach-sql.md %}) for your CockroachDB cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url {"CONNECTION STRING"}
    ~~~

1. Before you can create a changefeed, it is necessary to enable rangefeeds on your cluster:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

## Step 8. Create a changefeed

Before running the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) statement, you must [**URL-encode**](https://meyerweb.com/eric/tools/dencoder/) both the cluster's and the Schema Registry's API secret key.

You can also [create external connections]({% link {{ page.version.version }}/create-external-connection.md %}) to define a name for the Kafka and Confluent Schema Registry URIs. This allows you to interact with your defined name instead of the provider-specific URI.

1. Construct the Kafka URI:

    Use the `Endpoint` from your cluster details and precede it with the `kafka://` scheme. For example, an endpoint of `pkc-4yyd6.us-east1.gcp.confluent.cloud:9092` would be: `kafka://pkc-4yyd6.us-east1.gcp.confluent.cloud:9092`.

    Since the Kafka cluster uses `SASL` authentication, you need to pass the following [parameters]({% link {{ page.version.version }}/create-changefeed.md %}#query-parameters). This includes the cluster API and secret key you created in [Step 2](#step-2-create-a-cluster-api-key-and-secret):
    - `tls_enabled=true`
    - `sasl_enabled=true`
    - `sasl_user={CLUSTER API KEY}`
    - `sasl_password={URL-ENCODED CLUSTER SECRET KEY}`
    - `sasl_mechanism=PLAIN`

    ~~~
    "kafka://{KAFKA ENDPOINT}?tls_enabled=true&sasl_enabled=true&sasl_user={CLUSTER API KEY}&sasl_password={URL-ENCODED CLUSTER SECRET KEY}&sasl_mechanism=PLAIN"
    ~~~

1. Create an external connection for the Kafka URI:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION kafka AS "kafka://{KAFKA ENDPOINT}?tls_enabled=true&sasl_enabled=true&sasl_user={CLUSTER API KEY}&sasl_password={URL-ENCODED CLUSTER SECRET KEY}&sasl_mechanism=PLAIN"
    ~~~

1. To construct the Confluent Schema Registry URI, you need:
    - Schema Registry API Key created in [Step 5](#step-5-create-a-schema-registry-api-key-and-secret).
    - URL-encoded Schema Registry secret key created in [Step 5](#step-5-create-a-schema-registry-api-key-and-secret).
    - The `Endpoint URL` from the Schema Registry's details created in [Step 4](#step-4-create-a-confluent-schema-registry). Make sure to add the `:443` port to the end of this URL. For example, `psrc-x77pq.us-central1.gcp.confluent.cloud:443`.

    ~~~
    "https://{SCHEMA REGISTRY API KEY}:{URL-ENCODED SCHEMA REGISTRY SECRET KEY}@{SCHEMA REGISTRY ENDPOINT URL}:443"
    ~~~

    {{site.data.alerts.callout_success}}
    {% include {{ page.version.version }}/cdc/schema-registry-timeout.md %}
    {{site.data.alerts.end}}

1. Create an external connection for the Confluent Schema Registry URI:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION confluent_registry AS "https://{SCHEMA REGISTRY API KEY}:{URL-ENCODED SCHEMA REGISTRY SECRET KEY}@{SCHEMA REGISTRY ENDPOINT URL}:443"
    ~~~

1. Create the changefeed with any other options you need to configure your changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE CHANGEFEED FOR TABLE users INTO "external://kafka" WITH updated, format = avro, confluent_schema_registry = "external://confluent_registry";
    ~~~

    See [Options]({% link {{ page.version.version }}/create-changefeed.md %}#options) for a list of all available changefeed options.

    {{site.data.alerts.callout_success}}
    {% include {{ page.version.version }}/cdc/schema-registry-metric.md %}
    {{site.data.alerts.end}}

## Step 9. Verify the output

Move to the terminal window in which you started the Kafka consumer. As the changefeed runs, you will see the change data messages similar to the following:

~~~
. . .
{"after":{"users":{"name":{"string":"Michael Clark"},"address":{"string":"85957 Ashley Junctions"},"credit_card":{"string":"4144089313"},"id":{"string":"d84cf3b6-7029-4d4d-aa81-e5caa9cce09e"},"city":{"string":"seattle"}}},"updated":{"string":"1659643584586630201.0000000000"}}
{"after":{"users":{"address":{"string":"17068 Christopher Isle"},"credit_card":{"string":"6664835435"},"id":{"string":"11b99275-92ce-4244-be61-4dae21973f87"},"city":{"string":"amsterdam"},"name":{"string":"John Soto"}}},"updated":{"string":"1659643585384406152.0000000000"}}
{"after":{"users":{"id":{"string":"a4666991-0292-4b00-8df0-d807c10eded5"},"city":{"string":"boston"},"name":{"string":"Anthony Snow"},"address":{"string":"74151 Carrillo Ramp"},"credit_card":{"string":"2630730025"}}},"updated":{"string":"1659643584990243411.0000000000"}}
{"updated":{"string":"1659643584877025654.0000000000"},"after":{"users":{"city":{"string":"seattle"},"name":{"string":"Tanya Holmes"},"address":{"string":"19023 Murphy Mall Apt. 79"},"credit_card":{"string":"6549598808"},"id":{"string":"434d4827-945f-4c7a-8d10-05c03e3bbeeb"}}}}
. . .
~~~

You can also view the messages for your cluster in the Confluent Cloud console in the **Topics** sidebar under the **Messages** tab.

<img src="{{ 'images/v26.1/confluent-messages-screenshot.png' | relative_url }}" alt="Users topic messages in the Confluent Cloud console." style="border:1px solid #eee;max-width:100%" />

You can use the **Schema** tab to view the schema for a specific topic.

<img src="{{ 'images/v26.1/confluent-schemas-screenshot.png' | relative_url }}" alt="Users vale schema in the Confluent Cloud console." style="border:1px solid #eee;max-width:100%" />

## See also

- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [Messages]({% link {{ page.version.version }}/changefeed-messages.md %})
