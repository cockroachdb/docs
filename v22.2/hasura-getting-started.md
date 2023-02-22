---
title: Build a GraphQL Application Using Hasura 
summary: Learn how to use Hasura with CockroachDB to create GraphQL queries.
toc: true
twitter: false
referral_id: docs_hasura
docs_area: get_started
---

This tutorial shows you how to create a GraphQL application using [Hasura Cloud](https://cloud.hasura.io) and {{ site.data.products.dedicated }}.

The Hasura GraphQL Engine creates [GraphQL](https://graphql.org/) schemas and resolvers based on the tables and views in your CockroachDB cluster, allowing you to submit GraphQL queries to access and manipulate your data.

Hasura GraphQL Engine v2.16 and later supports CockroachDB v22.2 and later.

## Overview

This tutorial will show you how to configure a Hasura project with a CockroachDB data source, allow connections to your CockroachDB cluster from Hasura Cloud, and create a table that is then used with Hasura GraphQL Engine to retrieve and modify data.

## Before you begin

Before you start this tutorial, you need:

- An existing [{{ site.data.products.dedicated }}](../cockroachcloud/quickstart-trial-cluster.html) cluster, running CockroachDB v22.2 or later.
- A [Hasura Cloud account](https://hasura.io/docs/latest/getting-started/getting-started-cloud/).

## Configure your {{ site.data.products.dedicated }} cluster

1. In the [CockroachDB Cloud console](https://cockroachlabs.cloud/clusters), select your cluster and click **Connect**.
1. If you have not set up [IP Allowlists](../cockroachcloud/network-authorization.html#ip-allowlisting) under **Network Security**, follow the instructions to add connections to your cluster from your machine.
1. Select the SQL user you want to use for the Hasura Cloud connection under **SQL User**. If you have not set up a SQL user for this cluster, follow the instructions to create a new SQL user. Be sure to copy and save the password to a secure location.
1. Click **Next**.
1. Select **Connection String** and run step 1 to download the CA certificate for your cluster.
1. Copy the connection string in step 2 and paste it in a secure location. You will use this connection string later to configure Hasura GraphQL Engine with your cluster.

## Create a new project in Hasura Cloud

1. In the Hasura Cloud console, select **Projects**, then click **New Project**.

1. In the **Create Project** panel select the cloud infrastructure provider and region. 

    The cloud infrastructure provider and region should match your cluster. For example, if you created a {{ site.data.products.dedicated }} cluster in GCP's `us-east1` region, choose a GCP region closest to `us-east1`.

1. Click **Create Free Project**.

### Add environment variables to your project

You will store your cluster CA cert in your Hasura project's environment variables. Storing this connection information in environment variables is considered a best practice.
<!-- Replace when env variables work for connection string. -->
<!-- You will store your cluster CA cert and connection string in your Hasura project's environment variables. Storing this connection information in environment variables is considered a best practice. -->

Create a `SSL_ROOT_CERT` environment variable for your cluster's CA cert.

1. Select **Env vars** in your project settings, and click **New Env Var**.
1. Under **Key** type `SSL_ROOT_CERT`, then press **Enter**.
1. Copy the contents of your {{ site.data.products.dedicated }} cluster's CA certificate file you downloaded earlier.
  
    For example, on Mac you can copy the contents of the CA certificate in a terminal using `pbcopy`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    pbcopy < $HOME/Library/CockroachCloud/certs/fake-puppy-ca.crt
    ~~~

1. Paste the contents of the CA certificate file under **Value**.

    <img src="{{ 'images/v22.2/hasura-ca-cert.png' | relative_url }}" alt="Adding the SSL_ROOT_CERT environment variable to the Hasura project" style="border:1px solid #eee;max-width:50%" />
1. Click **Add**.

<!-- Replace when env variables work for connection string. -->
<!-- Now create a `CRDB_URL` environment variable to store the connection string.

1. Click **New Env Var**.
1. Under **Key** type `CRDB_URL`, then press **Enter**.
1. Paste the connection string for your cluster you copied earlier. Add your SQL user password if necessary to the connection string.
1. Remove the `sslmode` and `sslrootcert` query parameters from the end of the connection string. You will add the SSL settings later.

    For example, if your connection string in the CockroachDB Cloud console is:

    ~~~ 
    postgresql://maxroach:NotAGoodPassword@fake-puppy-595.g95.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/fake-puppy-ca.crt
    ~~~

    You would modify the connection string to:

    ~~~
    postgresql://maxroach:NotAGoodPassword@fake-puppy-595.g95.cockroachlabs.cloud:26257/defaultdb
    ~~~
1. Click **Add**. -->

### Create a Data Source in Hasura Cloud

1. In the overview page in Hasura Cloud, select **Projects**, find the project you created earlier, and click **Launch Console**.
1. Click **Data** in the console header to open the **Data Manager**.
1. Click **Connect Database**.
1. In the **Connect Existing Database** tab configure the connection to your cluster.
    1. Under **Database Display Name** type a name for your connection. Your cluster name is a good option. For example, `fake-puppy`.
    1. Set **Data Source Driver** to **CockroachDB**.
    1. Select **Connection URL**, then paste the connection string for your cluster you copied earlier. Add your SQL user password if necessary to the connection string.
    1. Remove the `sslmode` and `sslrootcert` query parameters from the end of the connection string. You will add the SSL settings later.

        For example, if your connection string in the CockroachDB Cloud console is:

        ~~~ 
        postgresql://maxroach:NotAGoodPassword@fake-puppy-595.g95.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/fake-puppy-ca.crt
        ~~~

        You would modify the connection string to:

        ~~~
        postgresql://maxroach:NotAGoodPassword@fake-puppy-595.g95.cockroachlabs.cloud:26257/defaultdb
        ~~~
    <!-- Replace when env variables work for connection string. -->
    <!-- 1. Select **Environment Variable**, then enter `CRDB_URL` in the **Environment Variable** input box.
        <img src="{{ 'images/v22.2/hasura-data-source.png' | relative_url }}" alt="Adding the connection string to the Hasura Data Manager" style="border:1px solid #eee;max-width:100%" /> -->
   1. Expand **SSL Certificates Settings** and set **SSL Mode** to `verify-full`.
   1. Enter `SSL_ROOT_CERT` under **SSL Root Certificate**, the environment variable you configured earlier.
1. Click **Connect Database**.

## Add the Hasura Cloud network to your cluster allowlist

Your {{ site.data.products.dedicated }} cluster needs to be configured to [allow incoming client connections](../cockroachcloud/network-authorization.html#ip-allowlisting) from Hasura Cloud.

1. In the Hasura Cloud overview page select **Projects**, then click the **Config** icon for your project.

    <img src="{{ 'images/v22.2/hasura-project-config.png' | relative_url }}" alt="Click the project Config icon" style="border:1px solid #eee;max-width:100%" />
1. In the **General** section, copy the IP address listed under **Hasura Cloud IP**.
1. In the CockroachDB Cloud console select your cluster, click **Networking**, then **Add Network**.
1. In the **Add Network** dialog, set **Network name** to `Hasura Cloud`.
1. Under **Network**, select **New Network**. Paste the IP address of your Hasura Cloud instance you copied earlier.
1. Check **CockroachDB Client to access the databases**, then click **Apply**.

## Create a table in your CockroachDB cluster

1. Connect to your cluster using the SQL client.
   
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "{connection string}"
    ~~~

    Where `{connection string}` is the connection string for your cluster you copied earlier.

1. In the SQL client, create an `accounts` table.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      balance INT8
    );
    ~~~

1. Insert some data into the `accounts` table.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    UPSERT INTO accounts (balance) VALUES (1000), (250);
    ~~~

This will create two accounts, one with $1000 and another with $250.

## Track the <code>accounts</code> table in the Hasura Cloud Data Manager

1. In the Hasura Cloud Data Manager click `public` under your connection name.
1. Click the **Track All** button.
1. Click **Yes** when prompted to expose the table to the GraphQL API.

### Create a GraphQL query in the Hasura Cloud API Explorer

In the Hasura Cloud Explorer, you will see the `accounts` table. You can expand `accounts` to construct a GraphQL query against the `accounts` table.

For example, to create a query that finds all accounts with balances greater than or equal to $500:

1. Enter `GetLargeAccounts` as the query name in the Explorer.
1. Expand `accounts` in the Explorer.
1. Check `balance` and `id`, then expand `where`, then `balance`.
1. Check `_gte` to create a "greater than or equal to" where clause for `balance`, then enter `500`.

This creates the following GraphQL query:

{% include_cached copy-clipboard.html %}
~~~ graphql
query GetLargeAccounts {
  accounts(where: {balance: {_gte: "500"}}) {
    balance
    id
  }
}
~~~

Click the **Execute Query** button to run the `GetLargeAccounts` GraphQL query. The returned data should look like the following:

~~~ json
{
  "data": {
    "accounts": [
      {
        "balance": 1000,
        "id": "2ed41abf-e831-42df-aff4-f88a6f2b0afc"
      }
    ]
  }
}
~~~

<img src="{{ 'images/v22.2/hasura-execute-query.png' | relative_url }}" alt="Executing the GraphQL query in the Hasura Cloud API Explorer" style="border:1px solid #eee;max-width:100%" />

## Next steps

Now that you have connected your cluster to Hasura GraphQL Engine, you can use the Explorer to create GraphQL queries to access and modify data in your cluster's tables. You can then use these queries in your application. For example, you can create [Hasura Actions](https://hasura.io/docs/latest/actions/index/?utm_source=cockroachdb) that use these queries. See the [Hasura documentation](https://hasura.io/docs/latest/index/?utm_source=cockroachdb) for detailed information on integrating and deploying Hasura in your applications.