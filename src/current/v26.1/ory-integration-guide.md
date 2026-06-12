---
title: Integrate CockroachDB with Ory
summary: Learn how to provision a joint Ory and CockroachDB environment.
toc: true
docs_area: Integrate
---

[Ory](https://www.ory.com/) is an open-source identity and access management (IAM) platform that provides modular components for authentication and authorization in distributed systems. Key components include:

- [Ory Hydra](https://www.ory.com/hydra) is a server implementation of the [OAuth 2.0 authorization framework](https://oauth.net/2/) and the [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-final.html). Hydra tracks clients, consent requests, and tokens with consistency to prevent replay attacks and duplicate authorizations.
- [Ory Kratos](https://www.ory.com/kratos) stores user identity records, recovery flows, sessions, and login attempts in transactional tables.
- [Ory Keto](https://www.ory.com/keto) provides scalable, relationship-based access control (ReBAC).

CockroachDB's scalability and resiliency make it well-suited to serve as the datastore for Ory components. This page describes how to provision a joint CockroachDB/Ory environment.

## Integration Architecture Overview

This example environment integrates Ory Hydra, Ory Kratos, and Ory Keto with CockroachDB. Each of these components relies on CockroachDB to store their state in a consistent and durable way, enabling them to function correctly even in the presence of partial outages or regional network partitions. Each Ory component is deployed as a stateless service, with its only persistence requirement being a backing SQL database.

CockroachDB provides the database layer that ensures the accuracy and availability of user identities, access control rules, and session tokens. This makes it easier to horizontally scale Ory services, perform rolling updates, or deploy new regions without having to orchestrate complex data migrations.

The following diagram illustrates how a CockroachDB/Ory integration could be designed:

<img src="{{ 'images/v26.1/integrate-ory-single-region.svg' | relative_url }}" alt="Single Region MAZ"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

As illustrated in the diagram above, a single cloud region is shown containing three Availability Zones (AZs): `us-east-1a`, `us-east-1b`, and `us-east-1c`. Each AZ is an isolated failure domain with its own independent power, cooling, and networking. By deploying nodes of the CockroachDB/Ory clusters across all three zones, the system ensures resilience against localized outages. If one AZ becomes unavailable due to a hardware or network issue, the remaining two zones continue to serve client requests without data loss or downtime.

In the middle of the diagram (`Ory VPC`): Ory is deployed as a Kubernetes cluster using [Amazon Elastic Kubernetes Service (EKS)](https://aws.amazon.com/eks/). A worker [`node`](https://kubernetes.io/docs/concepts/architecture/nodes/) is created in each zone, and these nodes are grouped together in a [namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) (`ns`). Together they form a single logical cluster. Traffic is routed to each node via an [ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) (`ing`) and a [service](https://kubernetes.io/docs/concepts/services-networking/service/) (`svc`). Each Ory component (**_Hydra_**, **_Kratos_**, and **_Keto_**) is replicated as a [`pod`](https://kubernetes.io/docs/concepts/workloads/pods/) and distributed across the EKS nodes to provide failover capabilities and remain highly available.

At the bottom of the diagram (`CRDB VPC`): The CockroachDB nodes in each zone form a single logical cluster that replicates data across zones using the consensus protocol (typically [Raft]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft)).

This replication model ensures strong [consistency]({% link {{ page.version.version }}/architecture/overview.md %}#consistency) — all nodes maintain a synchronized and always-on service. Even in the event of zone-level failure, the remaining pods and nodes — for both clusters — ensure that the solution remains available and consistent.

A regional load balancer distributes traffic across the healthy nodes in the cluster. This Network Load Balancer (NLB) improves performance by directing requests to the closest responsive node and provides failover capabilities by rerouting traffic away from any failed or unreachable zones.

In this example environment, both Ory and CockroachDB are deployed within the `us-east-1` region as follows:

- **CockroachDB** is deployed on one Virtual Private Cloud (VPC) in region (`us-east-1`) with three subnets, distributed across distinct AZs. The CockroachDB cluster itself consists of three nodes, each deployed in a separate AZ to enable fault tolerance and quorum-based consistency. A NLB sits in front of the cluster to evenly route incoming requests to the appropriate database node.

- **Ory** is deployed on a separate VPC in the same region (`us-east-1`), also using three subnets, each placed in a different AZ to ensure high availability. An Amazon EKS cluster was deployed with three worker nodes — one in each AZ — to distribute the workload evenly. For the purposes of this example, the EKS cluster is publicly accessible, and the service ports are exposed via a load balancer. All Ory components — Hydra, Kratos, and Keto — are configured to connect to the CockroachDB cluster through the NLB, ensuring consistent and resilient backend access.

## Set up a joint CockroachDB/Ory environment

This tutorial walks you through the manual setup of a joint CockroachDB/Ory environment. By the end of this tutorial, you will have a working environment where Ory’s services (Hydra, Kratos, and Keto) use a CockroachDB cluster for storage.

### Before you begin

To complete this tutorial, you will need:

- An [AWS account](https://aws.amazon.com/resources/create-account/) with permissions to create EKS clusters and EC2 resources.
- A configured [AWS CLI profile](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html).
- [Terraform](https://developer.hashicorp.com/terraform), [kubectl](https://kubernetes.io/docs/reference/kubectl/), [eksctl](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html), and [Helm (v3+)](https://helm.sh/) installed locally.
- Basic knowledge of [Kubernetes](https://kubernetes.io/) concepts.
- (Optional) A domain and DNS configuration if you plan to expose services publicly.

### Step 1. Provision a CockroachDB cluster

First you need to provision the CockroachDB cluster that Ory will use for its services. Choose one of the following methods to create a new CockroachDB cluster, or use an existing cluster and skip to [Step 2](#step-2-create-databases-for-ory-services).

Be sure to create a **secure** cluster that supports client connections with TLS. This is necessary for the user creation step of this tutorial.

#### Deploy a CockroachDB self-hosted cluster
You can manually deploy a multi-node, self-hosted CockroachDB cluster, either on-premises or on various cloud platforms.

Learn how to [deploy a self-hosted CockroachDB cluster]({% link {{ page.version.version }}/manual-deployment.md %}).

#### Deploy a CockroachDB Cloud cluster
CockroachDB Cloud is a fully-managed service run by Cockroach Labs, which simplifies the deployment and management of CockroachDB.

[Sign up for a CockroachDB Cloud account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}), optionally using [trial credits]({% link cockroachcloud/free-trial.md %}).

#### Deploy a cluster locally
You can install the CockroachDB binary to manually deploy a multi-node, self-hosted CockroachDB cluster on your local machine.

Learn how to [deploy a CockroachDB cluster locally]({% link {{ page.version.version }}/secure-a-cluster.md %}).

### Step 2. Create Databases for Ory Services

Before integrating Ory components with CockroachDB, you will need to set up separate databases for each service. Each Ory service manages its own schema and migrations:

- Ory Hydra manages OAuth2 clients, consent sessions, access/refresh tokens
- Ory Kratos handles identity, credentials, sessions, verification tokens
- Ory Keto stores relation tuples (RBAC/ABAC data) for permissions

Keeping these in separate databases simplifies maintenance and ensures isolation between identity, OAuth2, and authorization data.

1. Connect to your CockroachDB cluster using the SQL Shell client. Replace `{certs-dir}` with the certificates directory that you established during the cluster setup, and `{cluster-host}` with your cluster hostname:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --certs-dir={certs-dir} --host={cluster-host}:26257
    ~~~

1. Once connected to the SQL shell, [create the following databases]({% link {{page.version.version}}/create-database.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE hydra;
    CREATE DATABASE kratos;
    CREATE DATABASE keto;
    ~~~

1. [Create a user]({% link {{page.version.version}}/create-user.md %}) and [grant them privileges]({% link {{page.version.version}}/grant.md %}) for each Ory database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE USER ory WITH PASSWORD 'your_secure_password';
    GRANT ALL ON DATABASE hydra TO ory;
    GRANT ALL ON DATABASE kratos TO ory;
    GRANT ALL ON DATABASE keto TO ory;
    ~~~

### Step 3. Configure the connection string

When configuring each Ory service to use CockroachDB, you will need to provide connection URIs. The connection string format for CockroachDB is:

~~~
postgres://ory:your_secure_password@{cluster-host}:26257/{database-name}?sslmode=verify-full&sslcert={client-cert}&sslkey={client-key}&sslrootcert={ca-cert}
~~~

Replace the following placeholders:

- `{cluster-host}`: Your CockroachDB cluster hostname or load balancer address
- `{database-name}`: The database for the specific Ory service (`hydra`, `kratos`, or `keto`)
- `{client-cert}`: Path to the client certificate file
- `{client-key}`: Path to the client key file
- `{ca-cert}`: Path to the CA certificate file

For more information about CockroachDB connection parameters, refer to [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %}).

For CockroachDB {{ site.data.products.cloud }} clusters, refer to [Connect to a CockroachDB {{ site.data.products.cloud }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}) for connection details.

### Step 4. Provision a Kubernetes cluster for Ory

This section describes how to deploy Ory on a self-hosted Kubernetes cluster in EKS.

1. Complete the steps described in the [EKS Getting Started](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) documentation.
  
    This includes installing and configuring the AWS CLI and `eksctl`, which is the command-line tool used to create and delete Kubernetes clusters on EKS, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

2. From your local workstation, start the Kubernetes cluster:

    {{site.data.alerts.callout_success}}
    To ensure that all 3 nodes can be placed into a different AZ, you may want to first [confirm that at least 3 zones are available in the region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe) for your account.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    eksctl create cluster \
    --region us-east-1 \
    --name ory \
    --nodegroup-name standard-workers \
    --managed=false \
    --node-type m5.xlarge \
    --nodes 3 \
    --nodes-min 1 \
    --nodes-max 4 \
    --node-ami auto \
    --node-ami-family AmazonLinux2023
    ~~~

    This creates EKS instances and joins them into a single Kubernetes cluster named `ory`. The `--node-type` flag tells the node pool to use the [`m5.xlarge`](https://aws.amazon.com/ec2/instance-types/) instance type (4 vCPUs, 16 GB memory), which meets Ory's [recommended CPU and memory configuration](https://www.ory.com/blog/kratos-knative-demo).

    Provisioning usually takes between 10-15 minutes. Do not move on to the next step until you see a message like `[✔]  EKS cluster "ory" in "us-east-1" region is ready` and details about your cluster.

3. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) to verify that the stacks `eksctl-ory-cluster` and `eksctl-ory-nodegroup-standard-workers` were successfully created. Be sure that your region is selected in the console.

    Once the Kubernetes cluster is initialized, follow these steps to deploy Ory services:

4. [Install the Helm client](https://helm.sh/docs/intro/install) (version 3.0 or higher) and add the `ory` chart repository:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm repo add ory https://k8s.ory.sh/helm/charts
    ~~~
    
    You should get the following message, confirming the repository was added:
    
    ~~~
    "ory" has been added to your repositories
    ~~~

5. Update your Helm chart repositories to ensure that you're using the [latest CockroachDB chart](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/Chart.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm repo update
    ~~~

### Step 5. Install and configure Ory services on Kubernetes

For instructions on installing and configuring Ory services on Kubernetes, refer to the Ory documentation:

- [Install and configure Ory Hydra](https://k8s.ory.sh/helm/hydra.html)
- [Install and configure Ory Kratos](https://k8s.ory.sh/helm/kratos.html)
- [Install and configure Ory Keto](https://k8s.ory.sh/helm/keto.html)

Make sure to use the three connection strings defined in [Step 3](#step-3-configure-the-connection-string) as the values for `hydra.config.dsn`, `kratos.config.dsn` and `keto.config.dsn`.

### Step 6. Define authorization, identity, and access data

Once Ory Hyrdra, Kratos, and Keto have been deployed on your CockroachDB, you can use Ory's HTTP API, CLI, and SDK for each service.

- Refer to the [Ory Hydra reference documentation](https://www.ory.com/docs/hydra/reference/api) to learn how to use Hydra to define authorization data.
- Refer to the [Ory Kratos reference documentation](https://www.ory.com/docs/kratos/reference/api) to learn how to use Kratos to store user identities, credentials, and sessions. Use 
- Refer to the [Ory Keto reference documentation](https://www.ory.com/docs/keto/reference/rest-api) to learn how to use Keto to store relationship data for user permissions.

### Step 7. Verify the integration

Store authorization, identity, and permissions data in CockroachDB using your Ory deployment, then verify that the data has been stored correctly in CockroachDB. If the following queries return the expected result sets, CockroachDB has successfully been configured as the datastore for Ory services.

#### Ory Hydra

1. Use Hydra to [create an OAuth2.0 client](https://www.ory.com/docs/hydra/cli/hydra-create-oauth2-client), [perform the OAuth2.0 Client Credentials Flow](https://www.ory.com/docs/hydra/cli/hydra-perform-client-credentials), and then [perform a token introspection](https://www.ory.com/docs/hydra/cli/hydra-introspect-token) to confirm the validity of the resulting token.

2. In your CockroachDB SQL client, run the following query to verify the accessibilty of Ory Hydra's OAuth2 client data using CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT id, client_secret, scope, client_secret_expires_at, jwks, token_endpoint_auth_method, request_object_signing_alg, userinfo_signed_response_alg, subject_type, created_at, updated_at, metadata, registration_access_token_signature, redirect_uris, grant_types, response_types FROM public.hydra_client;
    ~~~

    The result set contains data about the OAuth2 client. The `id` should match the `client_id` found in the JSON response of the token introspection:

    ~~~
    -[ RECORD 1 ]
    id                                  | 9692d3f9-fcdc-4526-80c4-fc667d959a5f
    client_secret                       | $pbkdf2-sha256$i=25000,l=32$yt3tVhLriCpIFiLmTl94Bw$zatRVZKz4v7bv+rCZviMidN7Iws92OANloDKwGjLzq8
    scope                               | offline_access offline openid
    client_secret_expires_at            | 0
    jwks                                | {}
    token_endpoint_auth_method          | client_secret_basic
    request_object_signing_alg          | RS256
    userinfo_signed_response_alg        | none
    subject_type                        | public
    created_at                          | 2025-06-11 16:43:55
    updated_at                          | 2025-06-11 16:43:54.848259
    metadata                            | {}
    registration_access_token_signature | QXGo_1vPI2UWzEWoChhZ0fUEtuuKVO6EARVF0BBx55c
    redirect_uris                       | []
    grant_types                         | ["client_credentials"]
    response_types                      | ["code"]

    Time: 4ms total (execution 3ms / network 0ms)
    ~~~

3. Run the following query to verify the accessibilty of Ory Hydra's token creation data using CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT signature, request_id, requested_at, client_id, form_data, session_data, subject, active, challenge_id, expires_at FROM public.hydra_oauth2_access;
    ~~~

    The result set contains data about the access token you generated. The `client_id` should match the `client_id` found in the JSON response of the token introspection:

    ~~~
    -[ RECORD 1 ]
    signature          | 5d666e7d5e54afceeaed54bca47a69eb787acc9be89d3086ca1cf4d55f27f981ae79cbc7e1890c2e5632f86a2dce9074
    request_id         | 8f5b8564-4b3f-47c2-ab4c-c440c31dd733
    requested_at       | 2025-06-11 20:03:48.092544
    client_id          | 9692d3f9-fcdc-4526-80c4-fc667d959a5f
    form_data          | grant_type=client_credentials
    session_data       | FRYn1xS63MhiLoBOeVHp3MO5DTKRM1-usLDjSYyai-f9lHO2MmI_8YJQsAaC9EIo2iYxAqSS3pnv__cmP4SOYm5Hg_fefz78VHfWTb7KGny-6PRyd4eXLpdn_TDT-8yb5vRoZ2pW1aFAwlczeuqw5yN56C_0J24GWYvOFF3AoS3GejcPhyvPe_HkHuuK1Pkm4Xfxfc6KvQfQv6UZfX2unbiDCvk-eJ0KRGdvQkGQiztmdc5Ba6BGAuYfKkNqBmN_-4e27YPT2Ud8sQJKZ3o5xzevDg5gMOTgF1XejxQhlP-ThZM6nABjwjL3wL7hLfTE_eVXcCjj-v2VdLlDPL_iynGlsiBZiflN-bNaFIsXfBom8Ks6tjgR4PfhrVYAdsRABW6VbNIOuKvxhwi5GYaiK8jCmKGqwqX63RXKFlF9SSDIFAynvjeEgt_NyM3RNv2kqkgDtVUVmbdVGWbfw6a7oP9zsNINlQ5HyL6MTsE9dtEMNGz1NgDy727krULU1KkYw9tY7gFXb1UD7pkAc1rp-rTO7xG_z1E0QzaPwYtk7JGit6_gec5fkrLiSSaAAbKWHs6MbQdRQC5JTyB5eA6X6DZozXeO2e5SGB-_K1mQ8FaLxnnMlE1ofmooNolQ_qj6SHdB5_SEJpD4KDa8gib8MuUm9666XFxkOzGOoFlXFJFtyB11mB0ztYnIetKw-aEESehuFV6l0BpExVKjLpfR07w48Jsav4_NPKzlPoEIseh_P33Sk8FF19th_Z9D0EkELVaCGIH6Nu-N9dSiJIqMAquzSzlvUBBChvT5rEw_eas3b8-4M3m6EEA-yPPARoVJ_W6qVfibdmjz_36ex04cPD3Wiak=
    subject            | 8196400e-3849-4c72-b304-f097b8eef1cc
    active             | t
    challenge_id       | NULL
    expires_at         | 2025-06-11 20:03:48.115208

    Time: 3ms total (execution 3ms / network 0ms)
    ~~~

#### Ory Kratos

1. Use Kratos to [create a Registration Flow](https://www.ory.com/docs/kratos/self-service/flows/user-registration), [create a Login Flow](https://www.ory.com/docs/kratos/self-service/flows/user-login), and then [check the login session](https://www.ory.com/docs/identities/sign-in/check-session-token-cookie-api).

1. In your CockroachDB SQL client, run the following query to verify the accessibilty of Ory Kratos's identity data using CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT i.id, i.schema_id, i.traits, i.created_at, i.updated_at, i.nid, state, i.state_changed_at, ic.config as credentials, ict.name as identity_type
    FROM public.identities i 
    join public.identity_credentials ic  on i.id = ic.identity_id
    join public.identity_credential_types ict on ic.identity_credential_type_id = ict.id;
    ~~~

    The result set contains data about the `identity` established when you initialized the Registration Flow. Much of this data, including `id` and `traits`, should match the data found in the Login Flow JSON response:

    ~~~
    -[ RECORD 1 ]
    id               | 3ad9fe8b-ef2e-4fa4-8f3e-4b959ace03e6
    schema_id        | default
    traits           | {"email": "max@roach.com", "name": {"first": "Max", "last": "Roach"}}
    created_at       | 2025-06-15T22:28:38.747278Z
    updated_at       | 2025-06-15T22:28:38.747278Z
    nid              | e3e5cec5-da67-4754-8e85-ad1bb832a79e
    state            | active
    state_changed_at | 2025-06-15T22:28:38.743591684Z
    credentials      | {"hashed_password": "$2a$12$.ySX6DzFP/Kuf.PFJfz0.OVN6bH.V7JOFrWH5LI0Twzbe25GiDl9W"}
    identity_type    | password

    Time: 6ms total (execution 5ms / network 0ms)
    ~~~

#### Ory Keto

1. Use Keto to [create a relation tuple](https://www.ory.com/docs/keto/cli/keto-relation-tuple-create), [determine who has access to objects](https://www.ory.com/docs/keto/cli/keto-expand), and [check user permissions](https://www.ory.com/docs/keto/cli/keto-check).

1. In your CockroachDB SQL client, run the following query to verify the accessibilty of Ory Keto's access control data using CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT t.namespace, (select m.string_representation from public.keto_uuid_mappings m where m.id = t.object) as object_string, t.relation, 
    (select m.string_representation from public.keto_uuid_mappings m where m.id = t.subject_id) as subject_string, t.commit_time FROM public.keto_relation_tuples t;
    ~~~

    The result set contains permissions data. Much of this data, including `object_string`, `relation`, and `subject_string`, should match that provided in the preceding relation tuple data:

    ~~~
    -[ RECORD 1 ]
    namespace      | documents
    object_string  | doc-123
    relation       | viewer
    subject_string | user:alice
    commit_time    | 2025-12-09 21:37:02.207403

    Time: 3ms total (execution 3ms / network 0ms)
    ~~~

## Next steps

Your CockroachDB/Ory integration is ready for use in your application. You can begin building authentication, authorization, and access control features with CockroachDB and Ory.

## See also

- [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %})
- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [cockroach sql]({% link {{ page.version.version }}/cockroach-sql.md %})
- [Optimize Statement Performance Overview]({% link {{ page.version.version }}/make-queries-fast.md %})