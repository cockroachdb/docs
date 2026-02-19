---
title: Integrate CockroachDB with AuthZed
summary: Learn how to provision a joint AuthZed and CockroachDB environment.
toc: true
docs_area: Integrate
---

[AuthZed](https://authzed.com/) is an authorization platform, controlling user's access rights for resources once their identity is known. AuthZed centralizes, unifies, and scales this core security layer so that developers don’t have to implement their own permission logic in every application. 

SpiceDB is the core engine behind all AuthZed products, designed to be entirely agnostic to authentication solutions and identity providers. SpiceDB is a graph engine that centrally stores authorization data (relationships and permissions).

CockroachDB's scalability and resiliency make it well-suited to serve as SpiceDB's [underlying datastore](https://authzed.com/docs/spicedb/concepts/datastores#cockroachdb). AuthZed has standardized its managed services on CockroachDB and recommends CockroachDB for self-hosted, multi-region deployments.

This page describes how to configure CockroachDB to work with AuthZed.

## Before you begin

Refer to the [AuthZed documentation](https://authzed.com/docs) to understand AuthZed's architecture and requirements.

To deploy CockroachDB for AuthZed, you will need the following:

- A [supported CockroachDB SQL Shell binary]({% link {{ page.version.version }}/install-cockroachdb.md %}) for client connections.
- Network access from your SpiceDB runtime to CockroachDB on port `26257` of your CockroachDB host.

## Step 1. Provision a CockroachDB cluster

First you need to provision the CockroachDB cluster that AuthZed will use for its services. Choose one of the following methods to create a new CockroachDB cluster, or use an existing cluster and skip to Step 2.

Be sure to create a **secure** cluster that supports client connections with TLS. This is necessary for the user creation step of this tutorial.

#### Deploy a CockroachDB Self-hosted cluster
You can manually deploy a multi-node, self-hosted CockroachDB cluster, either on-premises or on various cloud platforms.

Learn how to [deploy a self-hosted CockroachDB cluster]({% link {{ page.version.version }}/manual-deployment.md %}).

#### Deploy a CockroachDB Cloud cluster
CockroachDB Cloud is a fully-managed service run by Cockroach Labs, which simplifies the deployment and management of CockroachDB.

[Sign up for a CockroachDB Cloud account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}), optionally using [trial credits]({% link cockroachcloud/free-trial.md %}).

#### Deploy a cluster locally
You can install the CockroachDB binary to manually deploy a multi-node, self-hosted CockroachDB cluster on your local machine.

Learn how to [deploy a CockroachDB cluster locally]({% link {{ page.version.version }}/secure-a-cluster.md %}).

## Step 2. Create a database and user for AuthZed

1. Connect to your CockroachDB cluster using the SQL Shell client. Replace `{certs-dir}` with your certificates directory and `{cluster-host}` with your cluster hostname:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --certs-dir={certs-dir} --host={cluster-host}:26257
    ~~~

1. [Create a database]({% link {{page.version.version}}/create-database.md %}) for AuthZed:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE DATABASE spicedb;
    ~~~

1. [Create a user]({% link {{page.version.version}}/create-user.md %}) for AuthZed and [grant privileges]({% link {{page.version.version}}/grant.md %}) on the database:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE USER authzed_user WITH PASSWORD 'your_secure_password';
    GRANT ALL ON DATABASE spicedb TO authzed_user;
    ~~~

## Step 3. Configure the connection string

When configuring SpiceDB to use CockroachDB, you will need to provide a connection URI. The connection string format for CockroachDB is:

~~~
postgres://authzed_user:your_secure_password@{cluster-host}:26257/spicedb?sslmode=verify-full&sslcert={client-cert}&sslkey={client-key}&sslrootcert={ca-cert}
~~~

Replace the following placeholders:

- `{cluster-host}`: Your CockroachDB cluster hostname or load balancer address
- `{client-cert}`: Path to the client certificate file
- `{client-key}`: Path to the client key file
- `{ca-cert}`: Path to the CA certificate file

For CockroachDB {{ site.data.products.cloud }} clusters, refer to [Connect to a CockroachDB {{ site.data.products.cloud }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}) for connection details.

## Step 4. Install and configure SpiceDB

For instructions on installing and configuring SpiceDB with CockroachDB as the datastore, refer to AuthZed's SpiceDB documentation:

- Install SpiceDB ([macOS](https://authzed.com/docs/spicedb/getting-started/install/macos), [Docker](https://authzed.com/docs/spicedb/getting-started/install/docker), [Kubernetes](https://authzed.com/docs/spicedb/getting-started/install/kubernetes), [Ubuntu/Debian](https://authzed.com/docs/spicedb/getting-started/install/debian), [RHEL/CentOS](https://authzed.com/docs/spicedb/getting-started/install/rhel), [Windows](https://authzed.com/docs/spicedb/getting-started/install/windows))
- [Configure SpiceDB to use CockroachDB](https://authzed.com/docs/spicedb/concepts/datastores#cockroachdb)
- [Deploy SpiceDB with CockroachDB](https://authzed.com/docs/spicedb/concepts/datastores#deployment-process)

Make sure to use the connection string defined in [Step 3](#step-3-configure-the-connection-string) in your SpiceDB configuration.


## Step 5. Define authorization data

Once SpiceDB is deployed with CockroachDB, you can use AuthZed's CLI and API endpoints to define authorization schemas, create relationships, and check permissions. To connect to SpiceDB with AuthZed tools and begin defining authorization data for your organization, refer to the [SpiceDB documentation](https://authzed.com/docs/spicedb/getting-started/first-steps).

## Step 6. Verify the integration

After configuring SpiceDB to use CockroachDB and storing authorization data, you can verify that the data has been stored correctly in CockroachDB:

1. Connect to your CockroachDB cluster using the [SQL Shell client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --certs-dir={certs-dir} --host={cluster-host}:26257
    ~~~

1. Run the following query to verify the accessibilty of the AuthZed schema in CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT namespace, serialized_config FROM public.namespace_config;
    ~~~ 

    The result set contains data about the permission:

    ~~~
    -[ RECORD 1 ]
    namespace         | document
    serialized_config | \x0a08646f63756d656e7412610a06656469746f721a130a110a04757365722a04080310151a032e2e2e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208012a04080310043a06656469746f7212610a067669657765721a130a110a04757365722a04080410151a032e2e2e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208012a04080410043a06766965776572125f0a0561646d696e1a130a110a04757365722a04080510141a032e2e2e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208012a04080510043a0561646d696e1294010a0476696577123d2204080710160a350a102a0408071016120812067669657765720a102a040807101f12081206656469746f720a0f2a04080710281207120561646d696e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208022a04080710043a1125363135613339316264643736396537311282010a0465646974122b2204080810160a230a102a040808101612081206656469746f720a0f2a040808101f1207120561646d696e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208022a04080810043a11253164396466303630383264376535353212790a0672656d6f766512192204080910180a110a0f2a04080910181207120561646d696e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208022a0408091004320561646d696e3a11253964363065336431613866616231663722020802
    -[ RECORD 2 ]
    namespace         | user
    serialized_config | \x0a04757365722200

    Time: 4ms total (execution 4ms / network 0ms)
    ~~~ 

1. Run the following query to verify the accessibilty of AuthZed access control data using CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT namespace, object_id, relation, userset_namespace, userset_object_id, timestamp, expires_at FROM public.relation_tuple;
    ~~~ 

    The result set contains permissions data. This data should match the authorization data you defined with AuthZed:

    ~~~
      namespace | object_id | relation | userset_namespace | userset_object_id |         timestamp          | expires_at
    ------------+-----------+----------+-------------------+-------------------+----------------------------+-------------
      document  | doc1      | admin    | user              | alice             | 2026-01-06 18:28:21.12613  | NULL
      document  | doc1      | viewer   | user              | bob              | 2026-01-06 18:28:23.226998 | NULL
    (2 rows)

    Time: 4ms total (execution 3ms / network 0ms)
    ~~~ 

    In this example, user `alice` has been defined as an `admin` for `doc1`, and user `bob` has been defined as a `viewer` for `doc1`.

If the Cockroach SQL result set matches the authorization data define in [Step 5](#step-5-define-authorization-data), you have verified that CockroachDB has successfully been deployed as the datastore for SpiceDB.

## Next steps

Your CockroachDB/AuthZed integration is ready for use in your application. You can begin building authorization and access control features with AuthZed.

## See also

- [Deploy a Local Cluster from Binary (Secure)]({% link {{ page.version.version }}/secure-a-cluster.md %})
- [Deploy CockroachDB on AWS EC2]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %})
- [cockroach sql]({% link {{ page.version.version }}/cockroach-sql.md %})
