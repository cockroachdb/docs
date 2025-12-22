---
title: Integrate CockroachDB with Ory
summary: Learn how to provision a joint Ory and CockroachDB environment.
toc: true
docs_area: Integrate
---

This tutorial demonstrates how to set up a CockroachDB environment that uses [Ory]({% link {{ page.version.version }}/ory-overview.md %}) for Identity and Access Management (IAM). This page describes the architecture of the integration, then walks through how to perform and test it. 

By the end of this tutorial, you will have a working environment where Ory’s services (Hydra, Kratos, and Keto) use a CockroachDB cluster for storage.

## Integration Architecture Overview

This example environment integrates [Ory Hydra]({% link {{ page.version.version }}/ory-overview.md %}#ory-hydra), [Ory Kratos]({% link {{ page.version.version }}/ory-overview.md %}#ory-kratos), and [Ory Keto]({% link {{ page.version.version }}/ory-overview.md %}#ory-keto).

In a CockroachDB/Ory integration, each of these components relies on CockroachDB to store their state in a consistent and durable way, enabling them to function correctly even in the presence of partial outages or regional network partitions. Each Ory component is deployed as a stateless service, with its only persistence requirement being a backing SQL database.

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

This tutorial walks you through the manual setup of a joint CockroachDB/Ory environment. 

### Before you begin

Before starting this tutorial, read the [Ory overview]({% link {{ page.version.version }}/ory-overview.md %}). 

To complete this tutorial, you will need:

- An [AWS account](https://aws.amazon.com/resources/create-account/) with permissions to create EKS clusters and EC2 resources.
- A configured [AWS CLI profile](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html).
- [Terraform](https://developer.hashicorp.com/terraform), [kubectl](https://kubernetes.io/docs/reference/kubectl/), [eksctl](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html), and [Helm (v3+)](https://helm.sh/) installed locally.
- Basic knowledge of [Kubernetes](https://kubernetes.io/) concepts.
- (Optional) A domain and DNS configuration if you plan to expose services publicly.

Estimated setup time: 45–60 minutes.

### Step 1. Provision a CockroachDB cluster

First you need to provision the CockroachDB cluster that Ory will use for its services. Choose one of the following methods to create a new CockroachDB cluster, or use an existing cluster and skip to [Step 2](#step-2-create-databases-for-ory-services).

{{site.data.alerts.callout_info}}
Be sure to create a **secure** cluster. This is necessary for the user creation step of this tutorial.
{{site.data.alerts.end}}

#### Create a secure cluster locally

If you have the CockroachDB binary installed locally, you can manually deploy a multi-node, self-hosted CockroachDB cluster on your local machine.

Learn how to [deploy a CockroachDB cluster locally]({% link {{ page.version.version }}/secure-a-cluster.md %}).

#### Create a CockroachDB Self-Hosted cluster on AWS

You can manually deploy a multi-node, self-hosted CockroachDB cluster on Amazon's AWS EC2 platform, using AWS's managed load-balancing service to distribute client traffic.

Learn how to [deploy a CockroachDB cluster on AWS]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %}).

#### Create a CockroachDB Cloud cluster

CockroachDB Cloud is a fully-managed service run by Cockroach Labs, which simplifies the deployment and management of CockroachDB.

[Sign up for a CockroachDB Cloud account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}) using [trial credits]({% link cockroachcloud/free-trial.md %}).

### Step 2. Create Databases for Ory Services

Before integrating Ory components with CockroachDB, you will need to set up separate databases for each service. Each Ory service manages its own schema and migrations:

- [Ory Hydra]({% link {{ page.version.version }}/ory-overview.md %}#ory-hydra) manages OAuth2 clients, consent sessions, access/refresh tokens
- [Ory Kratos]({% link {{ page.version.version }}/ory-overview.md %}#ory-kratos) handles identity, credentials, sessions, verification tokens
- [Ory Keto]({% link {{ page.version.version }}/ory-overview.md %}#ory-keto) stores relation tuples (RBAC/ABAC data) for permissions

Keeping these in separate databases simplifies maintenance and ensures isolation between identity, OAuth2, and authorization data.

1. Go to your [CockroachDB SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}).

1. Replace `{certs-dir}` with the certificates directory that you established during the cluster setup, and `{crdb-fqdn}` with your CockroachDB load balancer domain name. Then run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --certs-dir={certs-dir} --host={crdb-fqdn}:26257
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
    CREATE USER ory WITH PASSWORD 'securepass';
    GRANT ALL ON DATABASE hydra TO ory;
    GRANT ALL ON DATABASE kratos TO ory;
    GRANT ALL ON DATABASE keto TO ory;
    ~~~

### Step 3. Provision a Kubernetes cluster for Ory

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

### Step 4. Deploy Ory services on Kubernetes

Use Helm charts to deploy Ory Hydra, Kratos, and Keto on Kubernetes:

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="hydra">Deploy Hydra</button>
  <button class="filter-button page-level" data-scope="kratos">Deploy Kratos</button>
  <button class="filter-button page-level" data-scope="keto">Deploy Keto</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="hydra">
1. Copy/Paste the following code block in a `hydra_values.yaml` file and replace `{crdb-fqdn}` with your CockroachDB load balancer domain name. Refer to the [Hydra Helm chart template](https://www.ory.com/docs/hydra/reference/configuration).

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    image:
      repository: oryd/hydra
      tag: latest
      pullPolicy: IfNotPresent
    service:
      public:
        enabled: true
        type: LoadBalancer
        port: 4444
        name: hydra-http-public
      admin:
        enabled: true
        type: LoadBalancer
        port: 4445
        name: hydra-http-admin
    maester:
      enabled: false
    hydra:
      dev: true
      automigration:
        enabled: true
      config:
        serve:
          public:
            port: 4444
          admin:
            port: 4445
        dsn: "cockroach://ory:securepass@{crdb-fqdn}:26257/hydra?sslmode=disable"
    ~~~

2. Install the Ory Hydra Helm chart using your custom values file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --install ory-hydra ory/hydra --namespace ory -f hydra_values.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To allow the Ory Hydra pods to successfully deploy, do not set the [`--wait` flag](https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback) when using Helm commands.
    {{site.data.alerts.end}}

3. Confirm that cluster initialization has completed successfully, with the pods for Hydra showing `1/1` under `READY` and the pod for auto-migrate showing `Completed` under `STATUS`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    hydra-7fd94df448-hwhnq              1/1       Running     0          20m
    hydra-automigrate-hxzsc             1/1       Completed   0          20m
    ~~~

4. Verify that the Hydra services were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get svc
    ~~~

    ~~~
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)          AGE
    ory-hydra-admin        LoadBalancer   172.20.236.212   ae746b705aae34bad9795e0d83f085d3-323598019.us-east-1.elb.amazonaws.com    4445:32070/TCP   22m
    ory-hydra-public       LoadBalancer   172.20.128.144   a78f38833d17a4b6394cf687abebd8c9-546060028.us-east-1.elb.amazonaws.com    4444:32404/TCP   22m
    ~~~

5. To test this deployment, you will need to execute a few API calls over the [Hydra REST API](https://www.ory.com/docs/hydra/reference/api). For this, you need to export the URLs for both admin and public endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
      hydra_admin_hostname=$(kubectl get svc --namespace ory ory-hydra-admin --template "{% raw %}{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}{% endraw %}")
      hydra_public_hostname=$(kubectl get svc --namespace ory ory-hydra-public --template "{% raw %}{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}{% endraw %}")
      export HYDRA_ADMIN_URL=http://$hydra_admin_hostname:4445
      export HYDRA_PUBLIC_URL=http://$hydra_public_hostname:4444
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="kratos">
1. Copy/Paste the following code block in a `kratos_values.yaml` file and replace `{crdb-fqdn}` with your CockroachDB load balancer domain name. Refer to the [Kratos Helm chart template](https://www.ory.com/docs/kratos/reference/configuration).

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    image:
      repository: oryd/kratos
      tag: latest
      pullPolicy: IfNotPresent
    service:
      admin:
        enabled: true
        type: LoadBalancer
        port: 4433
        name: kratos-http-admin
      public:
        enabled: true
        type: LoadBalancer
        port: 4434
        name: kratos-http-public
    kratos:
      development: true
      automigration:
        enabled: true
      config:
        serve:
          admin:
            port: 4433
          public:
            port: 4434
        dsn: "cockroach://ory:securepass@{crdb-fqdn}:26257/kratos?sslmode=disable"
        selfservice:
          default_browser_return_url: "http://127.0.0.1/home"
        identity:
          default_schema_id: default
          schemas:
            - id: default
              url: https://cockroachdb-integration-guides.s3.us-east-1.amazonaws.com/ory/kratos-schema.json
    courier:
      enabled: false
    ~~~

2. Install the Ory Kratos Helm chart using your custom values file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --install ory-kratos ory/kratos --namespace ory -f kratos_values.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To allow the Ory Kratos pods to successfully deploy, do not set the [`--wait` flag](https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback) when using Helm commands.
    {{site.data.alerts.end}}

3. Confirm that cluster initialization has completed successfully, with the pods for Kratos showing `1/1` under `READY` and the pod for auto-migrate showing `Completed` under `STATUS`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    kratos-2ab64de672-nkhnq             1/1       Running     0          20m
    kratos-automigrate-jfsms            1/1       Completed   0          20m
    ~~~

4. Verify that the Kratos services were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get svc
    ~~~

    ~~~
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)          AGE
    ory-kratos-admin       LoadBalancer   172.20.11.131    addef980f1fab499c9c16b2ebe0311a6-1426652526.us-east-1.elb.amazonaws.com   4433:30363/TCP   21m
    ory-kratos-public      LoadBalancer   172.20.185.210   a6d6a72c1776646379830045ccaa2bdb-1651469880.us-east-1.elb.amazonaws.com   4434:31616/TCP   21m
    ~~~
   
5. To test this deployment, you will need to execute a few API calls over the [Kratos REST API](https://www.ory.com/docs/kratos/reference/api). For this, you need to export the URLs for both admin and public endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
      kratos_admin_hostname=$(kubectl get svc --namespace ory ory-kratos-admin --template "{% raw %}{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}{% endraw %}")
      kratos_public_hostname=$(kubectl get svc --namespace ory ory-kratos-public --template "{% raw %}{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}{% endraw %}")
      export KRATOS_ADMIN_URL=http://$kratos_admin_hostname:4433
      export KRATOS_PUBLIC_URL=http://$kratos_public_hostname:4434
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="keto">
1. Copy/Paste the following code block in a `keto_values.yaml` file and replace `{crdb-fqdn}` with the CockroachDB load balancer domain name. Refer to the [Keto Helm chart template](https://www.ory.com/docs/keto/reference/configuration).

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    image:
      repository: oryd/keto
      tag: latest
      pullPolicy: IfNotPresent
    service:
      read:
        enabled: true
        type: LoadBalancer
        name: ory-keto-read
        port: 4466
        appProtocol: http
        headless:
          enabled: false
      write:
        enabled: true
        type: LoadBalancer
        name: ory-keto-write
        port: 4467
        appProtocol: http
        headless:
          enabled: false
    keto:
      automigration:
        enabled: true
      config:
        serve:
          read:
            port: 4466
          write:
            port: 4467
        namespaces:
          - id: 0
            name: default_namespace
          - id: 1
            name: documents
          - id: 2
            name: users
        dsn: "cockroach://ory:securepass@{crdb-fqdn}:26257/keto?sslmode=disable"
    ~~~

2. Install the Ory Keto Helm chart using your custom values file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --install ory-keto ory/keto --namespace ory -f keto_values.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To allow the Ory Keto pods to successfully deploy, do not set the [`--wait` flag](https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback) when using Helm commands.
    {{site.data.alerts.end}}

3. Confirm that cluster initialization has completed successfully, with the pods for keto showing `1/1` under `READY` and the pod for auto-migrate showing `Completed` under `STATUS`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    keto-3ce98ab371-zkaknh              1/1       Running     0          20m
    ~~~

4. Verify that the Keto services were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get svc
    ~~~

    ~~~
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)          AGE
    ory-keto-read          LoadBalancer   172.20.252.154   a20d7e0cdab3c4bc086c15ad4e99b3ba-578912090.us-east-1.elb.amazonaws.com    4466:32018/TCP   20m
    ory-keto-write         LoadBalancer   172.20.114.76    a17754810e49d4314b7797a2f65f5031-451201736.us-east-1.elb.amazonaws.com    4467:30092/TCP   20m
    ~~~

5. To test this deployment, you will need to execute a few API calls over the [Keto REST API](https://www.ory.com/docs/keto/reference/rest-api). For this, you need to export the URLs for both read and write endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
      keto_read_hostname=$(kubectl get svc --namespace ory ory-keto-read --template "{% raw %}{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}{% endraw %}")
      keto_write_hostname=$(kubectl get svc --namespace ory ory-keto-write --template "{% raw %}{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}{% endraw %}")
      export KETO_WRITE_REMOTE=http://$keto_write_hostname:4467
      export KETO_READ_REMOTE=http://$keto_read_hostname:4466
    ~~~

</section>

You now have a high-availability deployment for a joint CockroachDB/Ory environment within a single cloud region. This architecture is designed to protect against failures at the AZ level by distributing nodes of the database cluster across multiple AZs within the same region.

## Test the CockroachDB/Ory Integration

Once both CockroachDB and Ory are provisioned, configured, and network-accessible, the next step is to validate that all components work together as intended.

Below is a practical guide for testing and debugging each part of this integration.

### Test Ory Hydra

To test Ory Hydra, create an OAuth2 client, generate an access token, then introspect it. These steps use the `$HYDRA_ADMIN_URL` and `$HYDRA_PUBLIC_URL` that you exported at the end of the [Ory Hydra deployment](?filters=hydra#step-4-deploy-ory-services-on-kubernetes).

#### 1. Create the OAuth2 client

{% include_cached copy-clipboard.html %}
~~~ shell
hydra create oauth2-client --endpoint $HYDRA_ADMIN_URL --format json --grant-type client_credentials
~~~

Once you have created the OAuth2 client, you can parse the JSON response to get the `client_id` and `client_secret`:

~~~ json
{
  "client_id": "9692d3f9-fcdc-4526-80c4-fc667d959a5f",
  "client_name": "",
  "client_secret": "F-~KQ8bKSeTxBKdZSS6woHSs9C",
  "client_secret_expires_at": 0,
  "client_uri": "",
  "created_at": "2025-06-11T16:43:07Z",
  "grant_types": ["client_credentials"],
  "jwks": {},
  "logo_uri": "",
  "metadata": {},
  "owner": "",
  "policy_uri": "",
  "registration_access_token": "ory_at_8xQlVk7rA_MX1yenToVmA7Wr7MLOLXJZdhh9iYHDEAQ.xGPfP4-AiGuOxAKkX-ZIdSntOJo8fy3a4b75ckE_V-g",
  "registration_client_uri": "http://public.hydra.localhost:4444/oauth2/register/",
  "request_object_signing_alg": "RS256",
  "response_types": ["code"],
  "scope": "offline_access offline openid",
  "skip_consent": false,
  "skip_logout_consent": false,
  "subject_type": "public",
  "token_endpoint_auth_method": "client_secret_basic",
  "tos_uri": "",
  "updated_at": "2025-06-11T16:43:07.320505Z",
  "userinfo_signed_response_alg": "none"
}
~~~ 

#### 2. Generate an access token

Replace `{client_id}` and `{client_secret}` with the values you found in the JSON response:

{% include_cached copy-clipboard.html %}
~~~ shell
hydra perform client-credentials --endpoint $HYDRA_PUBLIC_URL --client-id {client_id} --client-secret {client_secret}
~~~

This will generate an access token for Ory Hydra. Copy the string beside `ACCESS TOKEN`.

~~~
ACCESS TOKEN	ory_at_A2TpIR394rnUOtA0PLhvARKQyODmLIH7Fer5Y8clwe8.J61E8kR3ZH2w529D-5HOkuqoaTZy-CNLlNtvunYpdjg
REFRESH TOKEN	<empty>
ID TOKEN	<empty>
EXPIRY		2025-06-11 19:49:39 +0200 CEST
~~~ 

#### 3. Perform a token introspection to confirm the validity of this new token

Replace `{access_token}` with the string that you just copied:

{% include_cached copy-clipboard.html %}
~~~ shell
hydra introspect token --format json-pretty --endpoint $HYDRA_ADMIN_URL {access_token}
~~~

This should generate a JSON response that includes your `client_id`, `"active": true`, an expiration timestamp (`exp`), and [other data](https://www.ory.com/docs/hydra/reference/api#tag/oAuth2/operation/introspectOAuth2Token):

~~~ json
{
  "active": true,
  "client_id": "9692d3f9-fcdc-4526-80c4-fc667d959a5f",
  "exp": 1749664180,
  "iat": 1749660580,
  "iss": "http://public.hydra.localhost:4444",
  "nbf": 1749660580,
  "sub": "9692d3f9-fcdc-4526-80c4-fc667d959a5f",
  "token_type": "Bearer",
  "token_use": "access_token"
}
~~~

#### 4. Access Hydra data with CockroachDB SQL

In your CockroachDB SQL client, run the following query to verify the accessibilty of Ory Hydra's OAuth2 client data using CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, client_secret, scope, client_secret_expires_at, jwks, token_endpoint_auth_method, request_object_signing_alg, userinfo_signed_response_alg, subject_type, created_at, updated_at, metadata, registration_access_token_signature, redirect_uris, grant_types, response_types FROM public.hydra_client;
~~~

The result set contains data about the OAuth2 client. The `id` should match the `client_id` found in the JSON response above:

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

Then run the following query to verify the accessibilty of Ory Hydra's token creation data using CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT signature, request_id, requested_at, client_id, form_data, session_data, subject, active, challenge_id, expires_at FROM public.hydra_oauth2_access;
~~~

The result set contains data about the access token you generated. The `client_id` should match the `client_id` found in the JSON response above:

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

### Test Ory Kratos

To test Ory Kratos, you need to use the Kratos API endpoints to register the API flow, to start the log in flow, and verify the session token. These steps use the `$KRATOS_PUBLIC_URL` that you exported at the end of the [Ory Kratos deployment](?filters=kratos#step-4-deploy-ory-services-on-kubernetes).

#### 1. Initialize the API flow

Use the Kratos registration endpoint to get a valid Registration Flow ID:

{% include_cached copy-clipboard.html %}
~~~ shell
flowId=$(curl -s -X GET -H "Accept: application/json" $KRATOS_PUBLIC_URL/self-service/registration/api | jq -r '.id')
~~~

You can then submit the registration form using the following payload:

{% include_cached copy-clipboard.html %}
~~~ shell
curl -s -X POST -H "Accept: application/json Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/registration?flow=$flowId -d '{
  "method": "password",
  "password": "HelloCockro@ch123",
  "traits": {
        "email": "max@roach.com",
        "name": {
            "first": "Max",
            "last": "Roach"
        }
  }
}'
~~~

Kratos responds with a JSON payload which includes the signed up `identity`:

~~~ json
{
    "identity": {
        "id": "3ad9fe8b-ef2e-4fa4-8f3e-4b959ace03e6",
        "schema_id": "default",
        "schema_url": "http://ory-kratos-5f7474c79c-wgv9p:4434/schemas/ZGVmYXVsdA",
        "state": "active",
        "state_changed_at": "2025-06-15T22:28:38.743591684Z",
        "traits": {
            "email": "max@roach.com",
            "name": {
                "first": "Max",
                "last": "Roach"
            }
        },
        "metadata_public": null,
        "created_at": "2025-06-15T22:28:38.747278Z",
        "updated_at": "2025-06-15T22:28:38.747278Z",
        "organization_id": null
    },
    "continue_with": null
}
~~~

#### 2. Start the login flow

Having completed the registration, you can now start the Login Flow by fetching a valid Login Flow ID:

{% include_cached copy-clipboard.html %}
~~~ shell
flowId=$(curl -s -X GET -H  "Accept: application/json Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/login/api | jq -r '.id')
~~~

Then you can submit the login form [using a request payload](https://www.ory.com/docs/reference/api#tag/frontend/operation/updateLoginFlow) that includes the password that you submitted when initializing the API flow:

{% include_cached copy-clipboard.html %}
~~~ shell
curl -s -X POST -H  "Accept: application/json" -H "Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/login?flow=$flowId \
-d '{"identifier": "max@roach.com", "password": "HelloCockro@ch123", "method": "password"}'
~~~

Kratos responds with a JSON payload which includes the identity which just authenticated, the session, and the session token:

~~~ json
{
    "session_token": "ory_st_l209ZOnRSEaQRcIauchAUdFC5iYQDQld",
    "session": {
        "id": "fd4bde12-1c3d-4c95-a45f-337c6bdd6905",
        "active": true,
        "expires_at": "2025-06-16T22:50:12.810367548Z",
        "authenticated_at": "2025-06-15T22:50:12.810367548Z",
        "authenticator_assurance_level": "aal1",
        "authentication_methods": [
            {
                "method": "password",
                "aal": "aal1",
                "completed_at": "2025-06-15T22:50:12.810362223Z"
            }
        ],
        "issued_at": "2025-06-15T22:50:12.810367548Z",
        "identity": {
            "id": "3ad9fe8b-ef2e-4fa4-8f3e-4b959ace03e6",
            "schema_id": "default",
            "schema_url": "http://ory-kratos-5f7474c79c-wgv9p:4434/schemas/ZGVmYXVsdA",
            "state": "active",
            "state_changed_at": "2025-06-15T22:28:38.743591Z",
            "traits": {
                "email": "max@roach.com",
                "name": {
                    "first": "Max",
                    "last": "Roach"
                }
            },
            "metadata_public": null,
            "created_at": "2025-06-15T22:28:38.747278Z",
            "updated_at": "2025-06-15T22:28:38.747278Z",
            "organization_id": null
        },
        "devices": [
            {
                "id": "da0ccae2-9865-4ff7-b8b3-1f3f4808327e",
                "ip_address": "10.2.3.40:54026",
                "user_agent": "curl/8.5.0",
                "location": ""
            }
        ]
    },
    "continue_with": null
}
~~~ 

#### 3. Check the session token

The Ory Session Token can be checked at the Kratos [`/sessions/whoami` endpoint](https://www.ory.com/docs/reference/api#tag/frontend/operation/listMySessions) Replace `{session_token}` with the session token ID that was returned in the Login Flow JSON response:

{% include_cached copy-clipboard.html %}
~~~ shell
curl -s -X GET -H "Accept: application/json" -H "Authorization: Bearer {session_token}" $KRATOS_PUBLIC_URL/sessions/whoami
~~~

Kratos responds with a JSON payload which includes data about the current session:

~~~ json
{
    "id": "fd4bde12-1c3d-4c95-a45f-337c6bdd6905",
    "active": true,
    "expires_at": "2025-06-16T22:50:12.810367Z",
    "authenticated_at": "2025-06-15T22:50:12.810367Z",
    "authenticator_assurance_level": "aal1",
    "authentication_methods": [
        {
            "method": "password",
            "aal": "aal1",
            "completed_at": "2025-06-15T22:50:12.810362223Z"
        }
    ],
    "issued_at": "2025-06-15T22:50:12.810367Z",
    "identity": {
        "id": "3ad9fe8b-ef2e-4fa4-8f3e-4b959ace03e6",
        "schema_id": "default",
        "schema_url": "http://ory-kratos-5f7474c79c-wgv9p:4434/schemas/ZGVmYXVsdA",
        "state": "active",
        "state_changed_at": "2025-06-15T22:28:38.743591Z",
        "traits": {
            "email": "max@roach.com",
            "name": {
                "first": "Max",
                "last": "Roach"
            }
        },
        "metadata_public": null,
        "created_at": "2025-06-15T22:28:38.747278Z",
        "updated_at": "2025-06-15T22:28:38.747278Z",
        "organization_id": null
    },
    "devices": [
        {
            "id": "da0ccae2-9865-4ff7-b8b3-1f3f4808327e",
            "ip_address": "10.2.3.40:54026",
            "user_agent": "curl/8.5.0",
            "location": ""
        }
    ]
}
~~~

#### 4. Log out

To log out of the session, you can revoke the session token by calling the [logout API endpoint](https://www.ory.com/docs/reference/api#tag/frontend/operation/performNativeLogout).

Replace `{session_token}` with the session token ID that was returned in the Login Flow JSON response:

{% include_cached copy-clipboard.html %}
 ~~~ shell
curl -s -X DELETE -H "Accept: application/json" -H "Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/logout/api -d '{
"session_token": "{session_token}"
}'
 ~~~

#### 5. Access Kratos data with CockroachDB SQL

In your CockroachDB SQL client, run the following query to verify the accessibilty of Ory Kratos's identity data using CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT i.id, i.schema_id, i.traits, i.created_at, i.updated_at, i.nid, state, i.state_changed_at, ic.config as credentials, ict.name as identity_type
FROM public.identities i 
join public.identity_credentials ic  on i.id = ic.identity_id
join public.identity_credential_types ict on ic.identity_credential_type_id = ict.id;
~~~

The result set contains data about the `identity` established when you initialized the API flow. Much of this data, including `id` and `traits`, should match the data found in the Login Flow JSON response:

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

### Test Ory Keto

To test Ory Keto, create relationships between users and objects. Then use Ory Keto commands to check who has access to what objects. These steps use the `$KETO_WRITE_REMOTE` that you exported at the end of the [Ory Keto deployment](?filters=keto#step-4-deploy-ory-services-on-kubernetes).

#### 1. Create a relation tuple 

Create a Keto relation tuple [using the Keto SDK](https://www.ory.com/docs/keto/cli/keto-relation-tuple-create):

{% include_cached copy-clipboard.html %}
 ~~~ shell
echo '{"namespace":"documents","object":"doc-123","relation":"viewer","subject_id":"user:alice"}'  | keto relation-tuple create /dev/stdin --insecure-disable-transport-security
 ~~~ 

or by [using the Keto REST API](https://www.ory.com/docs/keto/reference/rest-api#tag/relationship/operation/createRelationship):

{% include_cached copy-clipboard.html %}
 ~~~ shell
curl -i -X PUT "$KETO_WRITE_REMOTE"/admin/relation-tuples \
-H "Content-Type: application/json" \
-d '{"namespace":"documents","object":"doc-123","relation":"viewer","subject_id":"user:alice"}'
 ~~~ 

#### 2. See who can access objects

You can use the [Ory Keto expand-API](https://www.ory.com/docs/keto/cli/keto-expand) to display who has access to an object, and why:

{% include_cached copy-clipboard.html %}
 ~~~ shell
keto expand viewer documents photos --insecure-disable-transport-security
 ~~~ 

To assist users with managing permissions for their files, the application has to display who has access to a file and why. In this example, we assume that the application knows the following files and directories:

 ~~~
├─ photos            (owner: maureen; shared with laura)
├─ beach.jpg         (owner: maureen)
├─ mountains.jpg     (owner: laura)
 ~~~ 

#### 3. Check permissions

It's important to test your permission model. To test the permissions manually, you can create relationships and [check permissions with the SDK](https://www.ory.com/docs/keto/cli/keto-check):

{% include_cached copy-clipboard.html %}
 ~~~ shell
keto check \"user:alice\" viewer documents /photos/beach.jpg --insecure-disable-transport-security
# allowed
 ~~~ 

#### 4. Access Keto data with CockroachDB SQL

In your CockroachDB SQL client, run the following query to verify the accessibilty of Ory Keto's access control data using CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT t.namespace, (select m.string_representation from public.keto_uuid_mappings m where m.id = t.object) as object_string, t.relation, 
(select m.string_representation from public.keto_uuid_mappings m where m.id = t.subject_id) as subject_string, t.commit_time FROM public.keto_relation_tuples t;
~~~

The result set contains permissions data. Much of this data, including `object_string`, `relation`, and `subject_string`, should match that provided in the relation tuple data above:

~~~
-[ RECORD 1 ]
namespace      | documents
object_string  | doc-123
relation       | viewer
subject_string | user:alice
commit_time    | 2025-12-09 21:37:02.207403

Time: 3ms total (execution 3ms / network 0ms)
~~~

### Next steps

The tests above confirm that each Ory component in this deployment is properly connected using CockroachDB as the shared data layer. If you get the expected results from these tests, then your integration is ready for use in your application. You can begin building authentication, authorization, and access control features with CockroachDB and Ory.

## See also

- [Ory Overview]({% link {{ page.version.version }}/ory-overview.md %})
- [Deploy a Local Cluster from Binary (Secure)]({% link {{ page.version.version }}/secure-a-cluster.md %})
- [Deploy CockroachDB on AWS EC2]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %})
- [cockroach sql]({% link {{ page.version.version }}/cockroach-sql.md %})
- [CREATE DATABASE]({% link {{page.version.version}}/create-database.md %})
