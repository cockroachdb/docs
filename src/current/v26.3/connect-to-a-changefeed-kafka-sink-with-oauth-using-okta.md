---
title: Connect to a Changefeed Kafka Sink with OAuth Using Okta
summary: Learn how to set up OAuth through Okta for a changefeed streaming to Kafka.
toc: true
docs_area: stream_data
---

CockroachDB [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) can stream change data out to [Apache Kafka](https://kafka.apache.org/) using OAuth authentication.

{% include {{ page.version.version }}/cdc/oauth-description.md %}

In this tutorial, you will set up OAuth authentication for your Kafka changefeed sink using [Okta](https://www.okta.com/). You will create an OAuth 2.0 endpoint in Okta that will provide a temporary credential token that the changefeed will use to connect to your Kafka cluster.

An overview of the workflow involves:

1. Creating an Okta application integration and authorization server scope.
1. Configuring the Kafka cluster.
1. Streaming the changefeed to the Kafka cluster.

## Before you begin

Before starting this tutorial, you will need:

- A CockroachDB cluster. You can use a CockroachDB {{ site.data.products.cloud }} or CockroachDB {{ site.data.products.core }} cluster.
    - If you are using CockroachDB {{ site.data.products.basic }}, {{ site.data.products.standard }}, or {{ site.data.products.advanced }}, see the [Quickstart with CockroachDB]({% link cockroachcloud/quickstart.md %}) guide. For CockroachDB {{ site.data.products.core }} clusters, see the [install]({% link {{ page.version.version }}/install-cockroachdb-mac.md %}) page.
- An [Okta Developer account](https://developer.okta.com/signup/).
- (Optional) A Kafka cluster. This tutorial includes [Kafka cluster setup](#step-3-create-a-kafka-sink). Note that this tutorial was tested with Kafka [version 2.8.2](https://kafka.apache.org/downloads). The Kafka cluster configuration may vary with different versions, but the Okta setup and changefeed creation will be the same.
- {% include {{ page.version.version }}/cdc/tutorial-privilege-check.md %}

This tutorial uses the Cockroach Labs [`movr`]({% link {{ page.version.version }}/movr.md %}) workload as an example database.

## Step 1. Create an Okta application and scope

In this step, you will create an application integration in your Okta developer account.

1. Log in to your Okta Developer account and navigate to **Applications** in the sidebar.

1. In the dropdown, click **Applications** and then **Create App Integration**.

1. On the **Create a new app integration** menu, select **API services** for OAuth 2.0 access tokens. Click **Next**.

1. Add an **App integration name** and then **Save**.

## Step 2. Configure an Okta authorization server with a scope

Once you have created the application integration, you'll configure an [authorization server](https://help.okta.com/oie/en-us/Content/Topics/Security/api-build-oauth-servers.htm) with a [scope](https://help.okta.com/oie/en-us/Content/Topics/Security/api-config-scopes.htm?cshid=create-scopes). The authorization server produces the OAuth 2.0 tokens the changefeed will use to connect to the Kafka sink. Scopes contained within an authorization server provide a way to limit access that operations have to the OAuth 2.0 access tokens.

1. Navigate to **Security** in the sidebar and then **API**. From here, you can add a new authorization server, or use the default authorization server. This tutorial will use the default server.

1. Click on the name of your authorization server and then select the **Scopes** tab.

1. Select **Add Scope**:
    - Add `kafka` as the name for your scope and include an optional description.
    - For **User Consent**, leave the default **Implicit** selected.
    - Check the box to set this as the **Default Scope**.
    - Optionally check **Include in public metadata** if you wish to include this scope in public metadata.

1. Click **Create**.

## Step 3. Create a Kafka sink

If you do not already have a Kafka cluster, create one with the instructions in this step. Note that the following instructions install Kafka v2.8.2 on a Linux machine:

1. Update the latest version of packages on your machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    sudo apt update
    ~~~

1. Install the `default-jre` package, which is a requirement for Kafka:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    sudo apt install default-jre -y
    ~~~

1. Download Kafka v2.8.2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://archive.apache.org/dist/kafka/2.8.2/kafka_2.13-2.8.2.tgz --output kafka_2
    ~~~

1. Extract the Kafka download:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    tar -xvf kafka_2
    ~~~

## Step 4. Update Kafka configuration

In this step, you will update configuration files in your Kafka cluster to set up the SASL mechanism for handling OAuth tokens.

1. Move to the following directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd kafka_2.13-2.8.2/config
    ~~~

1. Open the `server.properties` file to edit:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    vi server.properties
    ~~~

    Add the following to the end of the `server.properties` file:

    {% include_cached copy-clipboard.html %}
    ~~~
    sasl.enabled.mechanisms=OAUTHBEARER
    sasl.mechanism.inter.broker.protocol=OAUTHBEARER
    security.inter.broker.protocol=SASL_PLAINTEXT
    listeners=PLAINTEXT://:9092,SASL_PLAINTEXT://:9093
    advertised.listeners=PLAINTEXT://:9092,SASL_PLAINTEXT://:9093
    auto.create.topics.enable=true

    listener.name.sasl_plaintext.oauthbearer.sasl.login.callback.handler.class=br.com.jairsjunior.security.oauthbearer.OauthAuthenticateLoginCallbackHandler
    listener.name.sasl_plaintext.oauthbearer.sasl.server.callback.handler.class=br.com.jairsjunior.security.oauthbearer.OauthAuthenticateValidatorCallbackHandler
    ~~~

    This defines:
    - The SASL mechanism as `OAUTHBEARER`.
    - The ports that Kafka brokers listen for client and inter-broker communication. In this tutorial, you'll be writing to the cluster through port `:9093`. The configuration also lists `:9092` for a non-credentialed listener that can read from the cluster without needing to authenticate in the same way as the writer.
    - The login callback handler that will receive the OAuth token.
    - The server callback handler that will verify the token.

1. Create a file in the `config` directory called `kafka_server_jaas.conf`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    vi kafka_server_jaas.conf
    ~~~

    Add the following contents:

    {% include_cached copy-clipboard.html %}
    ~~~
    KafkaServer {
    org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required;
    };
    ~~~

    The [`OAuthBearerLoginModule`](https://kafka.apache.org/20/javadoc/org/apache/kafka/common/security/oauthbearer/OAuthBearerLoginModule.html) will ask the `OauthAuthenticateLoginCallbackHandler` (configured in the `server.properties` file) to return an `OAuthBearerToken`.

## Step 5. Prepare Kafka OAuth libraries

The SASL callback handlers added in [Step 4](#step-4-update-kafka-configuration) are part of a separate library that you will need to install.

1. Clone the library:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/jairsjunior/kafka-oauth.git ~/kafka-oauth
    ~~~

1. Install [Apache Maven](https://maven.apache.org/what-is-maven.html), a tool for building Java-based projects:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    sudo apt install maven
    ~~~

1. Move to the `kafka-oauth` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd ~/kafka-oauth
    ~~~

1. Run the following to compile and package the project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mvn package
    ~~~

## Step 6. Add OAuth environment variables

In this step, you'll export the environment variables that contain your OAuth client credentials. You will need the following information from your Okta developer account:

- Your [Okta domain](https://developer.okta.com/docs/guides/find-your-domain/main/), for example `dev-12345678.okta.com`
- The absolute paths to your:
    - `kafka-oauth` directory
    - `kafka_2.13-2.8.2` directory (or your Kafka version)
- Your client ID and client secret from your Okta application (created in [Step 1](#step-1-create-an-okta-application-and-scope)). You will need to build the value for the variable as `{client ID}:{client secret}` and [base64 encode](https://www.base64encode.org/) the whole value.

Export the following environment variables, or add them to your configuration file (e.g., `.bash_profile` or `.bashrc`) replacing the values in curly braces with those mentioned in the preceding list:

~~~
export OAUTH_WITH_SSL=true
export OAUTH_LOGIN_SERVER="{Okta domain}"
export OAUTH_LOGIN_ENDPOINT="/oauth2/default/v1/token"
export OAUTH_LOGIN_GRANT_TYPE="client_credentials"
export OAUTH_LOGIN_SCOPE="kafka"
export OAUTH_AUTHORIZATION="Basic {base64-encoded client credential value}"
export OAUTH_INTROSPECT_SERVER="{Okta domain}"
export OAUTH_INTROSPECT_ENDPOINT="/oauth2/default/v1/introspect"
export OAUTH_INTROSPECT_AUTHORIZATION="Basic {base64-encoded client credential value}"

export CLASSPATH="{absolute path to kafka-oauth}/target/*"
export KAFKA_OPTS="-Djava.security.auth.login.config={absolute path to kafka_2.13-2.8.2}/config/kafka_server_jaas.conf"
~~~

## Step 7. Start your Kafka server

In this step, you will start your Kafka server, create a topic, and run your consumer:

1. Move to the following directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd kafka_2.13-2.8.2
    ~~~

1. Start the Zookeeper server in one terminal:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./bin/zookeeper-server-start.sh ./config/zookeeper.properties
    ~~~

1. Start the Kafka server in another terminal:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./bin/kafka-server-start.sh ./config/server.properties
    ~~~

1. In another separate terminal window, create a topic to consume:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic vehicles
    ~~~

    To consume messages for this topic, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic vehicles
    ~~~

## Step 8. Create a changefeed

In this step, you will create a changefeed authenticating with Okta.

The Kafka URI must follow this format:

{% include_cached copy-clipboard.html %}
~~~
'kafka://{kafka cluster address}:9093?topic_name={vehicles}&sasl_client_id={your client ID}&sasl_client_secret={your base64-encoded client secret}&sasl_enabled=true&sasl_mechanism=OAUTHBEARER&sasl_token_url={your url-encoded Okta domain}'
~~~

Note the following:

- You can include your client ID directly (without any encoding).
- You must [base64 encode](https://www.base64encode.org/) your client secret.
- You must [URL encode](https://www.urlencoder.org/) your Okta developer token URL, e.g., `https://dev-12345678.okta.com/oauth2/default/v1/token` will encode to `https%3A%2F%2Fdev-12345678.okta.com%2Foauth2%2Fdefault%2Fv1%2Ftoken`.

Since this is a long URI to run, you can create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) to represent this URI:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE EXTERNAL CONNECTION kafka_oauth AS 'kafka://{kafka cluster address}:9093?topic_name={vehicles}&sasl_client_id={your client ID}&sasl_client_secret={your base64-encoded client secret}&sasl_enabled=true&sasl_mechanism=OAUTHBEARER&sasl_token_url={your url-encoded Okta domain}';
~~~

Create a changefeed that will emit messages to the topic consumer:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE movr.vehicles INTO 'external://kafka_oauth' WITH updated, resolved;
~~~

In the terminal set up to consume messages, you will receive your changefeed output:

~~~
{"after": {"city": "paris", "creation_time": "2019-01-02T03:04:05", "current_location": "1342 Gonzalez Forks", "ext": {"color": "red"}, "id": "2c28a231-8193-4120-8ce5-eabce1956279", "owner_id": "acdc9565-0f73-43fe-9669-9783c5c46169", "status": "in_use", "type": "skateboard"}, "updated": "1681240149199419939.0000000000"}
{"after": {"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "54992 Andrew Centers Apt. 22", "ext": {"color": "yellow"}, "id": "6b2aa0b8-01b3-46b4-a13e-6864f43c40cd", "owner_id": "9ae69087-c79a-4fd4-80dc-547a85e27068", "status": "in_use", "type": "scooter"}, "updated": "1681240149394513851.0000000000"}
{"after": {"city": "paris", "creation_time": "2019-01-02T03:04:05", "current_location": "7737 Beth Courts Apt. 55", "ext": {"color": "green"}, "id": "8a61bffd-c2a7-4ce1-b209-9ea42941290b", "owner_id": "620b36ed-8ea3-4d6d-b196-100ba1d7ed9d", "status": "in_use", "type": "skateboard"}, "updated": "1681240149812979187.0000000000"}
{"after": {"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "89716 Nicole Pike", "ext": {"brand": "Merida", "color": "black"}, "id": "56ae280a-baa9-4a29-8045-63e332a076bd", "owner_id": "9ae69087-c79a-4fd4-80dc-547a85e27068", "status": "available", "type": "bike"}, "updated": "1681240150474241185.0000000000"}
{"after": {"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "73179 Lori Field Suite 75", "ext": {"brand": "Santa Cruz", "color": "black"}, "id": "b13829a2-5f72-422b-9133-8f831db2056c", "owner_id": "a6e479b1-d3de-4ef4-a87f-1c6ef039e5ed", "status": "available", "type": "bike"}, "updated": "1681240150866277113.0000000000"}
{"after": {"city": "paris", "creation_time": "2019-01-02T03:04:05", "current_location": "31633 Mccoy Ville Suite 71", "ext": {"color": "blue"}, "id": "cb1feb9c-77f5-43c7-b014-ed7bcf54baab", "owner_id": "34f007c6-526c-493b-8d5c-5aefc7d46684", "status": "in_use", "type": "skateboard"}, "updated": "1681240151182949864.0000000000"}
{"after": {"city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "19693 Brittney Corner", "ext": {"brand": "Schwinn", "color": "blue"}, "id": "2a5c2551-d533-4046-96c0-ca906938e618", "owner_id": "b56d0dc5-2f03-4ec7-b716-512187d7d382", "status": "available", "type": "bike"}, "updated": "1681240151511828799.0000000000"}
{"after": {"city": "rome", "creation_time": "2019-01-02T03:04:05", "current_location": "88642 Kellie Corners", "ext": {"color": "red"}, "id": "c6e37516-a5a4-4ec4-a2a4-a85978682a99", "owner_id": "bc97858c-9317-4801-bf2a-3737bab0cb5b", "status": "available", "type": "scooter"}, "updated": "1681240153310673143.0000000000"}
{"resolved":"1681240120058450985.0000000000"}
{"after": {"city": "seattle", "creation_time": "2019-01-02T03:04:05", "current_location": "49180 Denise Parks", "ext": {"brand": "Merida", "color": "blue"}, "id": "de1efbf4-e88e-4da6-aeb7-102caf49625c", "owner_id": "6e075f6f-d21f-4400-8000-000000000865", "status": "in_use", "type": "bike"}, "updated": "1681240153581341257.0000000000"}
{"after": {"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "28858 Daniel Mews Suite 65", "ext": {"brand": "Merida", "color": "red"}, "id": "c3571a10-4cbb-49d1-a56b-59524ea2be59", "owner_id": "df1e705f-86f0-4c48-8010-1266ca2a2cbc", "status": "in_use", "type": "bike"}, "updated": "1681240153619761123.0000000000"}
{"after": {"city": "rome", "creation_time": "2019-01-02T03:04:05", "current_location": "21506 Frey Curve Apt. 75", "ext": {"brand": "Schwinn", "color": "blue"}, "id": "342a0ec2-6ee2-4264-aea1-92ba5292edcb", "owner_id": "beb18283-1c3d-4829-8555-68527df2beb4", "status": "available", "type": "bike"}, "updated": "1681240153748859635.0000000000"}
{"after": {"city": "paris", "creation_time": "2019-01-02T03:04:05", "current_location": "89765 Hood Port", "ext": {"color": "black"}, "id": "babcc708-d7de-48bd-87c9-bda8684d0aaf", "owner_id": "6d88921e-4471-4ae3-9619-772f9160d822", "status": "in_use", "type": "skateboard"}, "updated": "1681240153892129720.0000000000"}
{"after": {"city": "amsterdam", "creation_time": "2019-01-02T03:04:05", "current_location": "97125 Smith Isle Apt. 92", "ext": {"color": "blue"}, "id": "57f2a922-5b6d-491b-9991-64da5d697e67", "owner_id": "17fd8d62-ad55-4f29-8bca-ced7f961c4b5", "status": "in_use", "type": "scooter"}, "updated": "1681240156512186329.0000000000"}
{"after": {"city": "paris", "creation_time": "2019-01-02T03:04:05", "current_location": "80741 Williams Mall Suite 23", "ext": {"color": "yellow"}, "id": "dfa2fca6-702f-4e08-8571-b9a08c19c209", "owner_id": "30594646-8e94-46ab-a8ba-4cf583ade2b3", "status": "available", "type": "scooter"}, "updated": "1681240156710477264.0000000000"}
{"after": {"city": "rome", "creation_time": "2019-01-02T03:04:05", "current_location": "34552 Rebecca Extensions", "ext": {"color": "black"}, "id": "6dc61302-0484-4f03-8840-7a04c0b9d466", "owner_id": "ab0fac0d-8995-45e6-9ba9-8e38734a3f7b", "status": "in_use", "type": "scooter"}, "updated": "1681240157185859752.0000000000"}
{"after": {"city": "los angeles", "creation_time": "2019-01-02T03:04:05", "current_location": "28661 Briggs Pike", "ext": {"color": "green"}, "id": "bcb411c2-2a87-4231-9c11-b0f1a86e83e5", "owner_id": "a9eecbfb-15b5-4000-8000-000000000cf7", "status": "in_use", "type": "scooter"}, "updated": "1681240158676902425.0000000000"}
{"after": {"city": "paris", "creation_time": "2019-01-02T03:04:05", "current_location": "90976 Perry Expressway", "ext": {"color": "blue"}, "id": "9cd48bfe-4590-494d-ac4a-0bced463b7b0", "owner_id": "c3afaaab-e3e9-4364-90c3-753707ed07ca", "status": "in_use", "type": "scooter"}, "updated": "1681240159069463980.0000000000"}
{"after": {"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "61949 Denise Groves", "ext": {"brand": "Schwinn", "color": "blue"}, "id": "66c4f8c3-8bb6-4fff-8f94-062d62b687ac", "owner_id": "9ae69087-c79a-4fd4-80dc-547a85e27068", "status": "available", "type": "bike"}, "updated": "1681240159411671253.0000000000"}
~~~

## See also

- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %})