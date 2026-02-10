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

1. Go to your [CockroachDB SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}).
2. Replace `{certs-dir}` with the certificates directory that you established during the cluster setup, and `{crdb-fqdn}` with your CockroachDB load balancer domain name. Then run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --certs-dir={certs-dir} --host={crdb-fqdn}:26257
    ~~~

3. Once connected to the SQL shell, [create the following database]({% link {{page.version.version}}/create-database.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE DATABASE spicedb;
    ~~~

4. [Create a user]({% link {{page.version.version}}/create-user.md %}) `authz` and [grant them privileges]({% link {{page.version.version}}/grant.md %}) for the `spicedb` database:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE USER authz WITH PASSWORD 'securepass';
    GRANT ALL ON DATABASE spicedb TO authz;
    ~~~

### Step 3. Install SpiceDB binaries

On the SpiceDB side, you need to install the binary/container or use the Kubernetes Operator:

{% include_cached copy-clipboard.html %}
~~~ shell
sudo apt update && sudo apt install -y curl ca-certificates gpg
curl https://pkg.authzed.com/apt/gpg.key | sudo apt-key add -
sudo echo "deb https://pkg.authzed.com/apt/ * *" > /etc/apt/sources.list.d/fury.list
sudo apt update && sudo apt install -y spicedb
~~~

then, run the following command to create the SpiceDB schema:

{% include_cached copy-clipboard.html %}
~~~ shell
spicedb datastore migrate head --datastore-engine=cockroachdb --datastore-conn-uri="postgres://authz:securepass@CRDB_URI:26257/spicedb?sslmode=disable"
~~~

Start the SpiceDB service pointing at your CockroachDB URI:

{% include_cached copy-clipboard.html %}
~~~ shell
spicedb serve --grpc-preshared-key="<preshared_key>" --http-enabled=true --datastore-engine=cockroachdb --datastore-conn-uri="postgres://authz:securepass@CRDB_URI:26257/spicedb?sslmode=disable"
~~~

To interact with SpiceDB through the zed (AuthZed) CLI, you need to install the latest binary releases of zed using the official tap:

{% include_cached copy-clipboard.html %}
~~~ shell
brew install authzed/tap/zed
~~~

Once installed you can connect to the SpiceDB exposed in the client with the command below. For local development we can use the `--insecure` flag to connect over plaintext. Be sure to use the same `preshared_key` you used in the `spicedb serve` command.

{% include_cached copy-clipboard.html %}
~~~ shell
zed context set my_context <SpiceDB_IP>:50051 <preshared_key> --insecure
~~~

You can check the above command worked by running:

{% include_cached copy-clipboard.html %}
~~~ shell
zed version
~~~

If the output of zed version shows the server version as “unknown” then your CLI was unable to connect, so you may need to double-check some values in the previous steps such as the `preshared_key`, the IP or the port your SpiceDB instance is running on. When successfully executed, you should have the following output:

~~~ shell
client: zed v0.31.1
service: v1.45.4
~~~ 

## Test the CockroachDB/AuthZed Integration

Once both CockroachDB and AuthZed are provisioned, configured, and network-accessible, the next step is to validate that all components work together as intended.

Below is a practical guide for testing and debugging each part of this integration.

### 1. Defining the schema

Writing one or more object type definitions is the first step in developing an authorization relationship schema.

<img src="{{ 'images/v26.1/authzed_4.png' | relative_url }}" alt="TODO"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

In the example above, we define the `user` and `document` concepts. The user can be a `viewer`, an `editor` or `admin`. The definition gives the `remove` permission to the `admin` role only. To `edit` a file the user must be either an `editor` or `admin`. The permission to `view` a document is set for the viewer, editor and admin roles. The syntax of the schema definition is the following:

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

Once the schema, which defines the resources and necessary permissions, has been created, it can be saved in SpiceDB using either the zed CLI or its APIs (REST and gRPC). Although the REST API is less performant and not tested at scale, making gRPC the preferred choice, we will utilize the REST API for demonstration purposes to highlight its features.

First, let’s save the schema created earlier as `schema.zed` and execute the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
zed schema write ./schema.zed
~~~

If it works, we should see our authorization schema printed when the following command is executed:

{% include_cached copy-clipboard.html %}
~~~ shell
zed schema read
~~~

There exists another less recommended way to store the schema in SpiceDB, using the REST API. In this case, the schema definition is embedded into the request body:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --location 'http://<SpiceDB_IP>:8443/v1/schema/write' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer <preshared_key>' \
--data '{
"schema": "definition user {} \n definition document { \n relation editor: user \n relation viewer: user \n relation admin: user \n permission view = viewer + editor + admin \n permission edit = editor + admin \n permission remove = admin \n}"
}'

# output:
# {"writtenAt":{"token":"GhUKEzE3NTgxMjkyOTM0MDE2MDYxNDA="}}
~~~

### 2. Creating relationships

In SpiceDB relationships are represented as relation tuples. Each tuple contains a resource, a relation and a subject. In our case the resource is the name of a document, the relation is either admin, viewer or editor, and the subject is the name of a user.

Let’s simulate a new content creation flow: a user `amine` creates a new `document` named (`doc1`) and becomes its `admin`, meaning he can do everything to `doc1` (view, edit, and remove). Let’s assume an additional user `jake` with the viewer role for document (`doc1`).

{% include_cached copy-clipboard.html %}
~~~ shell
zed relationship touch document:doc1 admin user:amine
zed relationship touch document:doc1 viewer user:jake
~~~

You can also use the gRPC (on port 50051 like the one used by zed) and the HTTP APIs (on port 8443) to query SpiceDB. For example, to seed another test user `evan` and add him as `editor` of document `doc1`, you can use following the REST API call.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --location 'http://<SpiceDB_IP>:8443/v1/relationships/write' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer <preshared_key>' \
--data '{
    "updates": [
        {
            "operation": "OPERATION_TOUCH",
            "relationship": {
                "resource": {
                    "objectType": "document",
                    "objectId": "doc1"
                },
                "relation": "editor",
                "subject": {
                    "object": {
                        "objectType": "user",
                        "objectId": "evan"
                    }
                }
            }
        }
    ]
}'

# output :
# {"writtenAt":{"token":"GhUKEzE3NTgxMjk3MDg2NTc4MDQ5ODk="}}
~~~

### 3. Checking permissions

To check that our schema is working correctly we can issue a couple of check requests. As `jake` is only a `viewer` for `doc1` we expect him to have the view permission but not the `edit` or `remove` permissions. 

{% include_cached copy-clipboard.html %}
~~~ shell
zed permission check document:doc1 view user:jake
# output: true
zed permission check document:doc1 edit user:jake
# output: false
~~~

You can also check a permission using the REST API. Let's verify that `jake` doesn’t have the `remove` permission on document `doc1`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --location 'http://<client IP>:8443/v1/permissions/check' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer <preshared_key>' \
--data '{
  "consistency": {
    "minimizeLatency": true
  },
  "resource": {
    "objectType": "document",
    "objectId": "doc1"
  },
  "permission": "remove",
  "subject": {
    "object": {
      "objectType": "user",
      "objectId": "jake"
    }
  }
}'

# output :
# {"checkedAt":{"token":"GhUKEzE3NTgxMjk5NTAwMDAwMDAwMDA="}, "permissionship":"PERMISSIONSHIP_NO_PERMISSION"}
~~~

Conversely, as `amine` is an `admin`, we expect him to have all permissions:

{% include_cached copy-clipboard.html %}
~~~ shell
zed permission check document:doc1 view user:amine
# output: true
zed permission check document:doc1 remove user:amine
# output: true
zed permission check document:doc1 edit user:amine
# output: true
~~~

### 4. Access AuthZed data with CockroachDB SQL

In your CockroachDB SQL client, run the following query to verify the accessibilty of the AuthZed's schema in CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT namespace, serialized_config FROM public.namespace_config;
~~~ 

The result set contains data about the permission:

~~~ sql
-[ RECORD 1 ]
namespace         | document
serialized_config | \x0a08646f63756d656e7412610a06656469746f721a130a110a04757365722a04080310151a032e2e2e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208012a04080310043a06656469746f7212610a067669657765721a130a110a04757365722a04080410151a032e2e2e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208012a04080410043a06766965776572125f0a0561646d696e1a130a110a04757365722a04080510141a032e2e2e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208012a04080510043a0561646d696e1294010a0476696577123d2204080710160a350a102a0408071016120812067669657765720a102a040807101f12081206656469746f720a0f2a04080710281207120561646d696e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208022a04080710043a1125363135613339316264643736396537311282010a0465646974122b2204080810160a230a102a040808101612081206656469746f720a0f2a040808101f1207120561646d696e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208022a04080810043a11253164396466303630383264376535353212790a0672656d6f766512192204080910180a110a0f2a04080910181207120561646d696e22340a320a2c747970652e676f6f676c65617069732e636f6d2f696d706c2e76312e52656c6174696f6e4d65746164617461120208022a0408091004320561646d696e3a11253964363065336431613866616231663722020802
-[ RECORD 2 ]
namespace         | user
serialized_config | \x0a04757365722200

Time: 4ms total (execution 4ms / network 0ms)
~~~ 

Then run the following query to verify the accessibilty of AuthZed access control data using CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT namespace, object_id, relation, userset_namespace, userset_object_id, timestamp, expires_at FROM public.relation_tuple;
~~~ 

The result set contains permissions data. Much of this data, including object_string, relation, and subject_string, should match that provided in the relation tuple data above:

~~~ sql
  namespace | object_id | relation | userset_namespace | userset_object_id |         timestamp          | expires_at
------------+-----------+----------+-------------------+-------------------+----------------------------+-------------
  document  | doc1      | admin    | user              | amine             | 2026-01-06 18:28:21.12613  | NULL
  document  | doc1      | editor   | user              | evan              | 2026-01-06 18:29:40.131476 | NULL
  document  | doc1      | viewer   | user              | jake              | 2026-01-06 18:28:23.226998 | NULL
(3 rows)

Time: 4ms total (execution 3ms / network 0ms)
~~~ 

### Next steps
The tests above confirm that each AuthZed component in this deployment is properly connected using CockroachDB as the shared data layer. If you get the expected results from these tests, then your integration is ready for use in your application. You can begin building authorization and access control features with CockroachDB and AuthZed.

## See also

- [AuthZed Overview]({% link {{ page.version.version }}/authzed-overview.md %})