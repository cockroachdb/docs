---
title: Integrate CockroachDB with AuthZed
summary: Learn how to provision a joint AuthZed and CockroachDB environment.
toc: true
docs_area: Integrate
---

[AuthZed](https://authzed.com/) is a platform focused exclusively on *authorization*. In contrast to authentication, which verifies a user's identity, authorization decides a user's access rights for resources once their identity is known. AuthZed centralizes, unifies, and scales this core security layer so developers don’t have to implement their own permission logic in every application. 

SpiceDB is the core engine behind all AuthZed products. It is designed to be entirely agnostic to authentication solutions and identity providers. SpiceDB is a graph engine that centrally stores authorization data (relationships and permissions). Authorization requests (for example, checkPermission, lookupResources) are resolved via a dispatcher that traverses the permission graph.

SpiceDB is available in multiple forms depending on deployment and support needs:

- [SpiceDB (Open Source)](https://authzed.com/spicedb): The foundational, community-driven version of the authorization engine, free to use and self-hosted under the Apache 2.0 license.
- [SpiceDB Enterprise](https://authzed.com/products/spicedb-enterprise): A self-managed enterprise edition that includes audit logging, fine-grained API control, FIPS-validated cryptography, and dedicated support.
- [AuthZed Dedicated](https://authzed.com/products/authzed-dedicated): A fully managed, single-tenant SaaS offering that provides all enterprise features along with global, regionally distributed deployments and integrated APIs for permission filtering.
- [AuthZed Cloud](https://authzed.com/products/authzed-cloud): A multi-tenant managed platform designed for teams that want to start quickly without operational overhead.

Across all these tiers, CockroachDB provides resiliency and scalability as SpiceDB's underlying datastore.

## Set up a joint CockroachDB/AuthZed environment

Imagine that you’re building a global content management application that uses SpiceDB, as the access control system backed by CockroachDB across multiple regions. This tutorial walks you through the manual setup of a joint CockroachDB/AuthZed environment.

### Before you begin

To complete this tutorial, you will need:

- A local copy of a [supported CockroachDB binary]({% link {{ page.version.version }}/install-cockroachdb.md %}).
- Network access from your SpiceDB runtime to port `26257`.

### Step 1. Provision a CockroachDB cluster

First you need to provision the CockroachDB cluster that AuthZed will use for its services. Choose one of the following methods to create a new CockroachDB cluster, or use an existing cluster and skip to Step 2.

Be sure to create a **secure** cluster. This is necessary for the user creation step of this tutorial.

#### Create a secure cluster locally
If you have the CockroachDB binary installed locally, you can manually deploy a multi-node, self-hosted CockroachDB cluster on your local machine.

Learn how to [deploy a CockroachDB cluster locally]({% link {{ page.version.version }}/secure-a-cluster.md %}).

#### Create a CockroachDB Self-Hosted cluster on AWS
You can manually deploy a multi-node, self-hosted CockroachDB cluster on Amazon's AWS EC2 platform, using AWS's managed load-balancing service to distribute client traffic.

Learn how to [deploy a CockroachDB cluster on AWS]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %}).

#### Create a CockroachDB Cloud cluster
CockroachDB Cloud is a fully-managed service run by Cockroach Labs, which simplifies the deployment and management of CockroachDB.

[Sign up for a CockroachDB Cloud account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}) using [trial credits]({% link cockroachcloud/free-trial.md %}).

### Step 2. Create a database for AuthZed

Before integrating AuthZed with CockroachDB, you will need to set up a dedicated database.

1. Replace `{certs-dir}` with the certificates directory that you established during the cluster setup, and `{crdb-fqdn}` with your CockroachDB load balancer domain name. Then run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --certs-dir={certs-dir} --host={crdb-fqdn}:26257
    ~~~

1. Once connected to the SQL shell, [create the following database]({% link {{page.version.version}}/create-database.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE DATABASE spicedb;
    ~~~

1. [Create a user]({% link {{page.version.version}}/create-user.md %}) `authz` and [grant them privileges]({% link {{page.version.version}}/grant.md %}) for the `spicedb` database:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE USER authz WITH PASSWORD 'securepass';
    GRANT ALL ON DATABASE spicedb TO authz;
    ~~~

### Step 3. Install and configure SpiceDB

1. Install the SpiceDB binary for your given system (supported systems include [macOS](https://authzed.com/docs/spicedb/getting-started/install/macos), [Docker](https://authzed.com/docs/spicedb/getting-started/install/docker), [Kubernetes](https://authzed.com/docs/spicedb/getting-started/install/kubernetes), [Ubuntu/Debian](https://authzed.com/docs/spicedb/getting-started/install/debian), [RHEL/CentOS](https://authzed.com/docs/spicedb/getting-started/install/rhel), and [Windows](https://authzed.com/docs/spicedb/getting-started/install/windows)).

2. Define your CockroachDB cluster as the datastore for SpiceDB. Replace the `{crdb-uri}` placeholder with your cluster URI, and replace the `{client-authz-cert}`, `{client-authz-key}`, and `{ca-cert}` placeholders with paths to the relevant certificate files in your certs directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    spicedb datastore migrate head \
    --datastore-engine=cockroachdb \
    --datastore-conn-uri="postgres://authz:securepass@{crdb-uri}:26257/spicedb?sslmode=verify-full&sslcert={client-authz-cert}&sslkey={client-authz-key}&sslrootcert={ca-cert}"
    ~~~

3. Start the SpiceDB service pointing at your CockroachDB URI. Replace the same placeholders as those in the preceding command. In addition, define a `{preshared-key}`, to be used in further commands:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    spicedb serve \
    --grpc-preshared-key="{preshared-key}" \
    --http-enabled=true \
    --datastore-engine=cockroachdb \
    --datastore-conn-uri="postgres://authz:securepass@{crdb-uri}:26257/spicedb?sslmode=verify-full&sslcert={client-authz-cert}&sslkey={client-authz-key}&sslrootcert={ca-cert}"
    ~~~

### Step 4. Install the AuthZed CLI

1. To interact with SpiceDB through the zed (AuthZed) CLI, [install the latest binary releases of zed](https://authzed.com/docs/spicedb/getting-started/installing-zed).

2. Once installed, connect to the SpiceDB instance exposed in the client with the following command. For local development, you can use the `--insecure` flag to connect over plaintext. Be sure to use the same `{preshared-key}` that you used in the preceding step. Replace the `{spicedb-ip}` placeholder with the IP of your SpiceDB instance:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    zed context set my_context {spicedb-ip}:50051 {preshared-key} --insecure
    ~~~

3. Check that the command worked by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    zed version
    ~~~

    If the output indicates that the server version is `unknown`, then your CLI was unable to connect. You may need to verify the values in previous steps, such as the `{preshared-key}`, the IP or the port that your SpiceDB instance is running on. 

    When successfully executed, `zed version` should output something similar to the following:

    ~~~
    client: zed v0.31.1
    service: v1.45.4
    ~~~ 

### Step 5. Define the authorization schema

The first step in developing an authorization relationship schema is defining one or more object types. For example, you could define the following object relationships:

<img src="{{ 'images/v26.1/authzed_schema.png' | relative_url }}" alt="AuthZed sample schema diagram"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

The main two items in this example are the `user` and `document` objects. The `user` can be a `viewer`, an `editor` or an `admin`. The definition gives the `remove` permission to the `admin` role only. To `edit` a file the user must be either an `editor` or an `admin`. The permission to `view` a document is set for the `viewer`, `editor` and `admin` roles. 

1. Define the schema by writing the following file:

    {% include_cached copy-clipboard.html %}
    ~~~
    definition user {}

    definition document {
        relation editor: user
        relation viewer: user
        relation admin: user

        permission view = viewer + editor + admin
        permission edit = editor + admin
        permission remove = admin
    }
    ~~~

    Save this file as `schema.zed`.

1. Apply the schema to SpiceDB, pointing to the saved `schema.zed` file. 

    You can interact with SpiceDB using the zed CLI, with the [HTTP API](https://authzed.com/docs/spicedb/api/http-api) or with the [gRPC API](https://buf.build/authzed/api/docs/main:authzed.api.v1). These instructions will use the zed CLI.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    zed schema write ./schema.zed
    ~~~

1. To verify that this has worked, run the following command, which should print the applied schema:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    zed schema read
    ~~~

### Step 6. Define authorization relationships

In SpiceDB, relationships are represented as tuples. Each tuple contains a _resource_, a _relation_ and a _subject_. In this example, the resource is the name of a `document`, the relation is either `admin`, `viewer` or `editor`, and the subject is the name of a `user`.

Define a new relationship for a `document` called `doc1`. Use the following command to make `alice` an `admin` for `doc1`. This means that she can `view`, `edit`, and `remove` the document.

{% include_cached copy-clipboard.html %}
~~~ shell
zed relationship touch document:doc1 admin user:alice
~~~

Define a new relationship for `doc1`. Use the following command to make `bob` a `viewer` for `doc1`. This means that he can only `view` the document.

{% include_cached copy-clipboard.html %}
~~~ shell
zed relationship touch document:doc1 viewer user:bob
~~~

## Test the CockroachDB/AuthZed Integration

Once both CockroachDB and AuthZed are provisioned and configured, and the authorization relationships have been defined in SpiceDB, validate that the relationships are accessible in the CockroachDB data store.

### Check user permissions with the AuthZed CLI

To check that our schema is working correctly, issue `check` requests. As `bob` is only a `viewer` for `doc1`, you can expect him to have the `view` permission but not the `edit` or `remove` permissions:

{% include_cached copy-clipboard.html %}
~~~ shell
zed permission check document:doc1 view user:bob
# true
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
zed permission check document:doc1 edit user:bob
# false
~~~

Because `alice` is an `admin`, she has all permissions:

{% include_cached copy-clipboard.html %}
~~~ shell
zed permission check document:doc1 view user:alice
# true
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
zed permission check document:doc1 remove user:alice
# true
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
zed permission check document:doc1 edit user:alice
# true
~~~

### Access AuthZed data with CockroachDB SQL

1. Go to your [CockroachDB SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}).

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

    The result set contains permissions data. Much of this data, including `object_id`, `relation`, and `userset_object_id`, should match that provided in the relation tuple in [Step 6](#step-6-define-authorization-relationships) of the setup instructions:

    ~~~
      namespace | object_id | relation | userset_namespace | userset_object_id |         timestamp          | expires_at
    ------------+-----------+----------+-------------------+-------------------+----------------------------+-------------
      document  | doc1      | admin    | user              | alice             | 2026-01-06 18:28:21.12613  | NULL
      document  | doc1      | viewer   | user              | bob              | 2026-01-06 18:28:23.226998 | NULL
    (2 rows)

    Time: 4ms total (execution 3ms / network 0ms)
    ~~~ 

### Next steps
These tests confirm that AuthZed is successfully using CockroachDB as its data store. If you get the expected results from these tests, then your integration is ready for use in your application. You can begin building authorization and access control features with CockroachDB and AuthZed.

## See also

- [Deploy a Local Cluster from Binary (Secure)]({% link {{ page.version.version }}/secure-a-cluster.md %})
- [Deploy CockroachDB on AWS EC2]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %})
- [cockroach sql]({% link {{ page.version.version }}/cockroach-sql.md %})
