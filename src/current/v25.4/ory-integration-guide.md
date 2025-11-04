---
title: Integrate CockroachDB with Ory
summary: Learn how to provision a joint Ory and CockroachDB environment.
toc: true
docs_area: Integrate
---

This tutorial demonstrates how to set up a joint environment that uses Ory for Identity and Access Management (IAM) and CockroachDB as the underlying database. This page describes the architecture of the integration, then walks through how to perform it. 

By the end of this tutorial, you should have a working environment in which Ory’s services (Hydra, Kratos, and Keto) are backed by CockroachDB's robust, distributed SQL database.

## Integration Architecture Overview

This example environment integrates [Ory Hydra]({% link {{ page.version.version }}/ory-overview.md %}#ory-hydra), [Ory Kratos]({% link {{ page.version.version }}/ory-overview.md %}#ory-kratos), and [Ory Keto]({% link {{ page.version.version }}/ory-overview.md %}#ory-keto).

Each of these components relies on CockroachDB to store their state in a consistent and durable way, enabling them to function correctly even in the presence of partial outages or regional network partitions.

Ory’s architecture is well-suited to operate with CockroachDB because of Ory's stateless design and API-first philosophy. Each component can be deployed as a stateless service, with its only persistence requirement being the backing SQL database. This makes it straightforward to horizontally scale services, perform rolling updates, or deploy new regions without having to orchestrate complex data migrations.

CockroachDB, in turn, provides the always-consistent database layer that ensures user identities, access control rules, and session tokens are always accurate no matter which region is serving a request. CockroachDB supports horizontal scaling, global deployments, multi-region replicas—all of which can be useful when building systems with critical identity/auth layers (as Ory provides) that must be resilient, available and performant.

<img src="https://github.com/amineelkouhen/crdb-ory-sandbox/raw/main/main/aws/Single-Region-Multi-AZ/images/Single-Region-MAZ.svg" alt="Single Region MAZ"  style="border:1px solid #eee;max-width:100%" />

As illustrated in the diagram above, a single cloud region is shown containing three distinct availability zones: `us-east-1a`, `us-east-1b`, and `us-east-1c`. Each availability zone is an isolated failure domain with its own independent power, cooling, and networking. By deploying nodes of the Ory/CRDB clusters across all three zones, the system ensures resilience against localized outages. If one AZ becomes unavailable due to a hardware or network issue, the remaining two zones continue to serve client requests without data loss or downtime.

In the middle of the diagram (`Ory VPC`): Ory is deployed as a Kubernetes cluster (in EKS). The workers are created in each zone and form a single logical cluster. Each Ory component (**_Hydra_**, **_Kratos_** or **_Keto_**) is replicated as pods and distributed across the EKS cluster to provide failover capabilities and remain highly available.

At the bottom of the diagram (`CRDB VPC`): The CockroachDB nodes in each zone form a single logical cluster that replicates data across zones using the consensus protocol (typically Raft).

A regional load balancer distributes traffic across the healthy nodes in the cluster. This NLB improves performance by directing requests to the closest responsive node and provides failover capabilities by rerouting traffic away from any failed or unreachable zones.

This replication model ensures strong consistency — all nodes maintain a synchronized and always-on service. Even in the event of zone-level failure, the remaining pods/nodes - for both clusters - ensures that the solution remains available and consistent.

This results in a seamless experience for end users, with low latency and high uptime.

In this example environment, both Ory and CockroachDB are within the us-east-1 region:

- **CockroachDB**: One Virtual Private Cloud (VPC) in region (`us-east-1`) with three subnets, distributed across distinct availability zones. The CockroachDB cluster itself consists of three nodes, each deployed in a separate AZ to enable fault tolerance and quorum-based consistency. A Network Load Balancer (NLB) sits in front of the cluster to evenly route incoming requests to the appropriate database node.

- **Ory**: A separate VPC in the same region (`us-east-1`), also using three subnets, each placed in a different availability zone to ensure high availability. An Amazon EKS (Elastic Kubernetes Service) cluster was deployed with three worker nodes — one in each AZ—to distribute the workload evenly.
For the purposes of this example, the EKS cluster is publicly accessible, and the service ports are exposed via a load balancer. All Ory components — Hydra, Kratos, and Keto — are configured to connect to the CockroachDB cluster through the NLB, ensuring consistent and resilient backend access.

## Set up a joint CockroachDB/Ory environment

This tutorial walks you through the manual setup of a joint CockroachDB/Ory environment. Alternatively, you can follow [the instructions at the end of this tutorial](#alternative-terraform-setup) to automate this process using the existing Ory integration github project.

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

First you need to provision the CockroachDB cluster that Ory will use for its services. CockroachDB clusters can be either self-hosted or CockroachDB Cloud deployments.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="self-hosted">Create a CockroachDB Self-Hosted Cluster on AWS</button>
  <button class="filter-button page-level" data-scope="cloud">Create a CockroachDB Cloud Cluster</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="self-hosted">
This section shows you how to manually deploy a multi-node, self-hosted CockroachDB cluster on Amazon's AWS EC2 platform, using AWS's managed load-balancing service to distribute client traffic.

To get started right away, follow the guide to [deploy a CockroachDB cluster on AWS]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %}).

</section>

<section class="filter-content" markdown="1" data-scope="cloud">
CockroachDB Cloud is a fully-managed service run by Cockroach Labs, which simplifies the deployment and management of CockroachDB. This section provides an introduction to CockroachDB Cloud and provides an overview of each type of cluster: CockroachDB Standard, CockroachDB Basic, and CockroachDB Advanced.

To get started right away, you can [sign up for a CockroachDB Cloud account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}) using [trial credits]({% link cockroachcloud/free-trial.md %}).
</section>

### Step 2. Create Databases for Ory Services

Before integrating Ory components with CockroachDB, you will need to set up separate databases for each service. This ensures isolation between identity, OAuth2, and authorization data. This pattern simplifies maintenance, backups, and access control.

Each Ory service manages its own schema and migrations:

- [Ory Hydra]({% link {{ page.version.version }}/ory-overview.md %}#ory-hydra) manages OAuth2 clients, consent sessions, access/refresh tokens
- [Ory Kratos]({% link {{ page.version.version }}/ory-overview.md %}#ory-kratos) handles identity, credentials, sessions, verification tokens
- [Ory Keto]({% link {{ page.version.version }}/ory-overview.md %}#ory-keto) stores relation tuples (RBAC/ABAC data) for permissions

Keeping these in separate databases avoids:

- Migration conflicts between unrelated schemas
- Accidental cross-component data access
- Complexity when scaling or performing rollbacks

Go to your CockroachDB SQL client.

Replace the `CRDB_FQDN` placeholder with your CockroachDB load balancer domain name and run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url "cockroach://root@CRDB_FQDN:26257/defaultdb?sslmode=disable"
~~~

Once connected to the SQL shell, run:
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE kratos;
CREATE DATABASE hydra;
CREATE DATABASE keto;
~~~

Create a user and grant them privileges for each Ory database, instead of using root.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER ory WITH PASSWORD 'securepass';
GRANT ALL ON DATABASE kratos TO ory;
GRANT ALL ON DATABASE hydra TO ory;
GRANT ALL ON DATABASE keto TO ory;
~~~

### Step 3. Provision a Kubernetes cluster for Ory

Kubernetes is a portable, extensible platform for managing containerized workloads and services. For a given workload, you provide Kubernetes with a configuration, and Kubernetes applies that configuration to all Kubernetes nodes that are running the application.

This section describes how to deploy Ory on a self-hosted Kubernetes cluster in EKS.

1. Complete the steps described in the [EKS Getting Started](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) documentation.
  
    This includes installing and configuring the AWS CLI and `eksctl`, which is the command-line tool used to create and delete Kubernetes clusters on EKS, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

2. From your local workstation, start the Kubernetes cluster:

    {{site.data.alerts.callout_success}}
    To ensure that all 3 nodes can be placed into a different availability zone, you may want to first [confirm that at least 3 zones are available in the region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe) for your account.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl create cluster \
    --name ory \
    --nodegroup-name standard-workers \
    --node-type m5.xlarge \
    --nodes 3 \
    --nodes-min 1 \
    --nodes-max 4 \
    --node-ami auto
    ~~~

    This creates EKS instances and joins them into a single Kubernetes cluster named `ory`. The `--node-type` flag tells the node pool to use the [`m5.xlarge`](https://aws.amazon.com/ec2/instance-types/) instance type (4 vCPUs, 16 GB memory), which meets Ory's [recommended CPU and memory configuration](https://www.ory.com/blog/kratos-knative-demo).

    Cluster provisioning usually takes between 10 and 15 minutes. Do not move on to the next step until you see a message like `[✔]  EKS cluster "ory" in "us-east-1" region is ready` and details about your cluster.

3. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) to verify that the stacks `eksctl-ory-cluster` and `eksctl-ory-nodegroup-standard-workers` were successfully created. Be sure that your region is selected in the console.

    Once the kubernetes cluster initialization is done, you can follow the following steps to deploy Ory services:

4. [Install the Helm client](https://helm.sh/docs/intro/install) (version 3.0 or higher) and add the `ory` chart repository:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm repo add ory https://k8s.ory.sh/helm/charts
    ~~~

    ~~~
    "ory" has been added to your repositories
    ~~~

5. Update your Helm chart repositories to ensure that you're using the [latest CockroachDB chart](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/Chart.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm repo update
    ~~~

### Step 4. Deploy Ory services on Kubernetes

Use Helm charts to deploy Ory Hydra, Kratos, and Keto on Kubernetes:

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="hydra">Deploy Hydra on Kubernetes</button>
  <button class="filter-button page-level" data-scope="kratos">Deploy Kratos on Kubernetes</button>
  <button class="filter-button page-level" data-scope="keto">Deploy Keto on Kubernetes</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="hydra">
1. Copy/Paste the following code block in a `hydra_values.yaml` file and replace the `CRDB_FQDN` placeholder with your CockroachDB load balancer domain name. Refer to the [Hydra Helm chart template](https://www.ory.com/docs/hydra/reference/configuration).

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
        dsn: "cockroach://ory:securepass@CRDB_FQDN:26257/hydra?sslmode=disable"
    ~~~

2. Install the Ory Hydra Helm chart, specifying your custom values file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm --install ory-hydra ory/hydra --namespace ory -f hydra_values.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To allow the Ory Hydra pods to successfully deploy, do not set the [`--wait` flag](https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback) when using Helm commands.
    {{site.data.alerts.end}}

3. Confirm that cluster initialization has completed successfully, with the pods for hydra showing `1/1` under `Running` and the pod for auto-migrate showing `Completed` under `STATUS`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    hydra-7fd94df448-hwhnq              1/1       Running     0          20m
    hydra-automigrate-hxzsc             1/1       Completed   0          20m
    ~~~

4. Confirm that the hydra services were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get svc
    ~~~

    ~~~
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)          AGE
    ory-hydra-admin        LoadBalancer   172.20.236.212   ae746b705aae34bad9795e0d83f085d3-323598019.us-east-1.elb.amazonaws.com    4445:32070/TCP   22m
    ory-hydra-public       LoadBalancer   172.20.128.144   a78f38833d17a4b6394cf687abebd8c9-546060028.us-east-1.elb.amazonaws.com    4444:32404/TCP   22m
    ~~~

5. In the next section, you will need to execute a few API calls over the [Hydra REST API](https://www.ory.com/docs/hydra/reference/api). For this, you need to export the URLs for both admin and public endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
      $ hydra_admin_hostname=$(kubectl get svc --namespace ory ory-hydra-admin --template "")
      $ hydra_public_hostname=$(kubectl get svc --namespace ory ory-hydra-public --template "")
      $ export HYDRA_ADMIN_URL=http://$hydra_admin_hostname:4445
      $ export HYDRA_PUBLIC_URL=http://$hydra_public_hostname:4444
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="kratos">
1. Copy/Paste the following code block in a `kratos_values.yaml` file and replace the `CRDB_FQDN` placeholder with your CockroachDB load balancer domain name. Refer to the [Kratos Helm chart template](https://www.ory.com/docs/kratos/reference/configuration).

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
        dsn: "cockroach://ory:securepass@CRDB_FQDN:26257/kratos?sslmode=disable"
        selfservice:
          default_browser_return_url: "http://127.0.0.1/home"
        identity:
          default_schema_id: default
          schemas:
            - id: default
              url: https://raw.githubusercontent.com/amineelkouhen/crdb-ory-sandbox/refs/heads/main/main/aws/Single-Region-Multi-AZ/resources/identity.default.schema.json
    courier:
      enabled: false
    ~~~

2. Install the Ory Kratos Helm chart, specifying your custom values file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm --install ory-kratos ory/kratos --namespace ory -f kratos_values.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To allow the Ory Kratos pods to successfully deploy, do not set the [`--wait` flag](https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback) when using Helm commands.
    {{site.data.alerts.end}}

3. Confirm that cluster initialization has completed successfully, with the pods for kratos showing `1/1` under `Running` and the pod for auto-migrate showing `Completed` under `STATUS`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    kratos-2ab64de672-nkhnq             1/1       Running     0          20m
    kratos-automigrate-jfsms            1/1       Completed   0          20m
    ~~~

4. Confirm that the kratos services were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get svc
    ~~~

    ~~~
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)          AGE
    ory-kratos-admin       LoadBalancer   172.20.11.131    addef980f1fab499c9c16b2ebe0311a6-1426652526.us-east-1.elb.amazonaws.com   4433:30363/TCP   21m
    ory-kratos-public      LoadBalancer   172.20.185.210   a6d6a72c1776646379830045ccaa2bdb-1651469880.us-east-1.elb.amazonaws.com   4434:31616/TCP   21m
    ~~~
   
5. In the next section, you will need to execute a few API calls over the [Kratos REST API](https://www.ory.com/docs/kratos/reference/api). For this, you need to export the URLs for both admin and public endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
      $ kratos_admin_hostname=$(kubectl get svc --namespace ory ory-kratos-admin --template "")
      $ kratos_public_hostname=$(kubectl get svc --namespace ory ory-kratos-public --template "")
      $ export KRATOS_ADMIN_URL=http://$kratos_admin_hostname:4433
      $ export KRATOS_PUBLIC_URL=http://$kratos_public_hostname:4434
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="keto">
1. Copy/Paste the following code block in a `keto_values.yaml` file and replace the `CRDB_FQDN` placeholder by the CockroachDB load balancer domain name. Refer to the [Keto Helm chart template](https://www.ory.com/docs/keto/reference/configuration).

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
        dsn: "cockroach://ory:securepass@CRDB_FQDN:26257/keto?sslmode=disable"
    ~~~

2. Install the Ory Keto Helm chart, specifying your custom values file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm --install ory-keto ory/keto --namespace ory -f keto_values.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To allow the Ory Keto pods to successfully deploy, do not set the [`--wait` flag](https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback) when using Helm commands.
    {{site.data.alerts.end}}

3. Confirm that cluster initialization has completed successfully, with the pods for keto showing `1/1` under `Running` and the pod for auto-migrate showing `Completed` under `STATUS`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    keto-3ce98ab371-zkaknh              1/1       Running     0          20m
    ~~~

4. Confirm that the kratos services were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get svc
    ~~~

    ~~~
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)          AGE
    ory-keto-read          LoadBalancer   172.20.252.154   a20d7e0cdab3c4bc086c15ad4e99b3ba-578912090.us-east-1.elb.amazonaws.com    4466:32018/TCP   20m
    ory-keto-write         LoadBalancer   172.20.114.76    a17754810e49d4314b7797a2f65f5031-451201736.us-east-1.elb.amazonaws.com    4467:30092/TCP   20m
    ~~~

5. In the next section, you will need to execute a few API calls over the [Keto REST API](https://www.ory.com/docs/keto/reference/rest-api). For this, you need to export the URLs for both read and write endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
      $ keto_read_hostname=$(kubectl get svc --namespace ory ory-keto-read --template "")
      $ keto_write_hostname=$(kubectl get svc --namespace ory ory-keto-write --template "")
      $ export KETO_WRITE_REMOTE=http://$keto_write_hostname:4467
      $ export KETO_READ_REMOTE=http://$keto_read_hostname:4466
    ~~~

</section>

You now have a high-availability deployment for a joint Ory/CRDB environment within a single cloud region. This architecture is designed to protect against failures at the availability zone (AZ) level by distributing nodes of the database cluster across multiple AZs within the same region.

### Alternative: Terraform setup

Provisioning a distributed identity stack can be time-consuming when done manually. The [Ory/CockroachDB sandbox](https://github.com/amineelkouhen/crdb-ory-sandbox) project encapsulates all necessary steps — from creating the CockroachDB cluster and its three Ory databases, to deploying Ory (Kratos, Hydra, and Keto) into an EKS cluster.
With just a few variables defined (such as cluster region, Ory image versions, and AWS credentials), Terraform spins up the joint environment in a few clicks (or one command), wiring all components together automatically.

It uses the official AWS Terraform provider to create and configure the required infrastructure for the database layer, and standard Kubernetes or Docker resources for deploying Ory services. This not only accelerates setup but also ensures reproducibility across environments, whether you are experimenting locally, running automated CI/CD tests, or deploying to production.

Terraform will provision two logical clusters with:

- For CockroachDB:
   * VPC and subnets (each in a distinct availability zone)
   * Network Load Balancers
   * 3-node CockroachDB cluster (each worker in a distinct subnet)

- For Ory:
   * VPC and subnets (each in a distinct availability zone)
   * 3-worker EKS cluster (each worker in a distinct subnet)
   * Ory pods are exposed as services behind Load Balancers

Sample output includes URLs and IPs for the deployed environment:

 ~~~ shell
Outputs:
####################################### Client #######################################

client-public-IP = "52.40.254.77"

####################################### CRDB Cluster #################################

console-url = "http://amine.cluster.sko-iam-demo.com:8080/"
connexion-string = "postgresql://root@amine.cluster.sko-iam-demo.com:26257/defaultdb"
console-url = "http://amine.cluster.sko-iam-demo.com:8080/"

crdb-cluster-private-ips = [
"10.1.1.75",
"10.1.2.176",
"10.1.3.188",
]
crdb-cluster-public-ips = [
"174.129.63.86",
"54.226.135.115",
"54.242.175.190",
]

####################################### EKS Ory Cluster #################################
 ~~~ 

## Test the CockroachDB/Ory Integration

Once both CockroachDB and Ory are provisioned, configured, and network-accessible, the next crucial step is to validate that all components work together as intended.

Below is a practical guide for testing and debugging each part of this integration.

### Test Ory Hydra

To test Ory Hydra, you can create an OAuth2 client, generate an access token, then introspect it using the following Hydra commands:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ hydra create oauth2-client --endpoint $HYDRA_ADMIN_URL --format json --grant-type client_credentials
 ~~~

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

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ hydra perform client-credentials --endpoint $HYDRA_PUBLIC_URL --client-id 9692d3f9-fcdc-4526-80c4-fc667d959a5f --client-secret F-~KQ8bKSeTxBKdZSS6woHSs9C
 ~~~

 ~~~ shell
ACCESS TOKEN	ory_at_A2TpIR394rnUOtA0PLhvARKQyODmLIH7Fer5Y8clwe8.J61E8kR3ZH2w529D-5HOkuqoaTZy-CNLlNtvunYpdjg
REFRESH TOKEN	<empty>
ID TOKEN	<empty>
EXPIRY		2025-06-11 19:49:39 +0200 CEST
 ~~~ 

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ hydra introspect token --format json-pretty --endpoint $HYDRA_ADMIN_URL ory_at_A2TpIR394rnUOtA0PLhvARKQyODmLIH7Fer5Y8clwe8.J61E8kR3ZH2w529D-5HOkuqoaTZy-CNLlNtvunYpdjg
 ~~~

 ~~~ shell
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

### Test Ory Kratos

To initialize the API flow, the client calls the API-flow initialization endpoint which returns a JSON response. All you need is a valid Registration Flow ID:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ flowId=$(curl -s -X GET -H "Accept: application/json" $KRATOS_PUBLIC_URL/self-service/registration/api | jq -r '.id')
 ~~~

Then you can submit the registration form using the following payload:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ curl -s -X POST -H "Accept: application/json Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/registration?flow=$flowId -d '{
  "method": "password",
  "password": "HelloCockro@ch123",
  "traits": {
        "email": "amine.elkouhen@cockroachlabs.com",
        "name": {
            "first": "Amine M.",
            "last": "Kouhen"
        }
  }
}'
 ~~~

Ory Identities responds with a JSON payload which includes the signed up identity:

 ~~~ json
{
    "identity": {
        "id": "3ad9fe8b-ef2e-4fa4-8f3e-4b959ace03e6",
        "schema_id": "default",
        "schema_url": "http://ory-kratos-5f7474c79c-wgv9p:4434/schemas/ZGVmYXVsdA",
        "state": "active",
        "state_changed_at": "2025-06-15T22:28:38.743591684Z",
        "traits": {
            "email": "amine.elkouhen@cockroachlabs.com",
            "name": {
                "first": "Amine M.",
                "last": "Kouhen"
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

Completing the registration, you can now start the login flow by fetching the Login Flow. All you need is a valid flow ID:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ flowId=$(curl -s -X GET -H  "Accept: application/json Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/login/api | jq -r '.id')
 ~~~

Then you can submit the login form using the following payload, first with a wrong password:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ curl -s -X POST -H  "Accept: application/json" -H "Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/login?flow=$flowId \
-d '{"identifier": "amine.elkouhen@cockroachlabs.com", "password": "the-wrong-password", "method": "password"}'
 ~~~

The server typically responds with HTTP 400 Bad Request and the Login Flow in the response payload as JSON. You will get the following validation errors `The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number`:

  ~~~ json
  {
    "id": "1532c85f-74a5-4c80-82b4-252b9a25eb7f",
    "organization_id": null,
    "type": "api",
    "expires_at": "2025-06-15T23:39:24.138178Z",
    "issued_at": "2025-06-15T22:39:24.138178Z",
    "request_url": "http://a6d6a72c1776646379830045ccaa2bdb-1651469880.us-east-1.elb.amazonaws.com:4434/self-service/login/api",
    "ui": {
        "action": "http://ory-kratos-5f7474c79c-wgv9p:4434/self-service/login?flow=1532c85f-74a5-4c80-82b4-252b9a25eb7f",
        "method": "POST",
        "nodes": [
            {
                "type": "input",
                "group": "default",
                "attributes": {
                    "name": "csrf_token",
                    "type": "hidden",
                    "value": "",
                    "required": true,
                    "disabled": false,
                    "node_type": "input"
                },
                "messages": [],
                "meta": {}
            },
            {
                "type": "input",
                "group": "default",
                "attributes": {
                    "name": "identifier",
                    "type": "text",
                    "value": "amine.elkouhen@cockroachlabs.com",
                    "required": true,
                    "disabled": false,
                    "node_type": "input"
                },
                "messages": [],
                "meta": {
                    "label": {
                        "id": 1070002,
                        "text": "E-Mail",
                        "type": "info",
                        "context": {
                            "title": "E-Mail"
                        }
                    }
                }
            },
            {
                "type": "input",
                "group": "password",
                "attributes": {
                    "name": "password",
                    "type": "password",
                    "required": true,
                    "autocomplete": "current-password",
                    "disabled": false,
                    "node_type": "input"
                },
                "messages": [],
                "meta": {
                    "label": {
                        "id": 1070001,
                        "text": "Password",
                        "type": "info"
                    }
                }
            },
            {
                "type": "input",
                "group": "password",
                "attributes": {
                    "name": "method",
                    "type": "submit",
                    "value": "password",
                    "disabled": false,
                    "node_type": "input"
                },
                "messages": [],
                "meta": {
                    "label": {
                        "id": 1010022,
                        "text": "Sign in with password",
                        "type": "info"
                    }
                }
            }
        ],
        "messages": [
            {
                "id": 4000006,
                "text": "The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.",
                "type": "error"
            }
        ]
    },
    "created_at": "2025-06-15T22:39:24.234661Z",
    "updated_at": "2025-06-15T22:39:24.234661Z",
    "refresh": false,
    "requested_aal": "aal1",
    "state": "choose_method"
  }
  ~~~
  
Let's try with a valid password and submit the login flow:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ curl -s -X POST -H  "Accept: application/json" -H "Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/login?flow=$flowId \
-d '{"identifier": "amine.elkouhen@cockroachlabs.com", "password": "HelloCockro@ch123", "method": "password"}'
 ~~~

Ory Identities responds with a JSON payload which includes the identity which just authenticated, the session, and the Ory Session Token:

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
                "email": "amine.elkouhen@cockroachlabs.com",
                "name": {
                    "first": "Amine M.",
                    "last": "Kouhen"
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

The Ory Session Token can be checked at the `http://$KRATOS_PUBLIC_URL/sessions/whoami` endpoint using the session token returned earlier (`ory_st_l209ZOnRSEaQRcIauchAUdFC5iYQDQld`):

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ curl -s -X GET -H "Accept: application/json" -H "Authorization: Bearer ory_st_l209ZOnRSEaQRcIauchAUdFC5iYQDQld" $KRATOS_PUBLIC_URL/sessions/whoami
 ~~~

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
            "email": "amine.elkouhen@cockroachlabs.com",
            "name": {
                "first": "Amine M.",
                "last": "Kouhen"
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

To logout the session, you can revoke the Ory session token by calling the logout API endpoint:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ curl -s -X DELETE -H "Accept: application/json" -H "Content-Type: application/json" $KRATOS_PUBLIC_URL/self-service/logout/api -d '{
"session_token": "ory_st_l209ZOnRSEaQRcIauchAUdFC5iYQDQld"
}'
 ~~~

### Test Ory Keto

To test Ory Keto, you can create a relation tuple using the Keto SDK:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ echo '{"namespace":"documents","object":"doc-123","relation":"viewer","subject_id":"user:alice"}'  | keto relation-tuple create /dev/stdin --insecure-disable-transport-security
 ~~~ 

or by using the Keto REST API:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ curl -i -X PUT "$KETO_WRITE_REMOTE"/admin/relation-tuples \
-H "Content-Type: application/json" \
-d '{"namespace":"documents","object":"doc-123","relation":"viewer","subject_id":"user:alice"}'
 ~~~ 

You can use Ory Keto's expand-API to display who has access to an object, and why:

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ keto expand viewer documents photos --insecure-disable-transport-security
 ~~~ 

To assist users with managing permissions for their files, the application has to display who has access to a file and why. In this example, we assume that the application knows the following files and directories:

 ~~~ shell
├─ photos            (owner: maureen; shared with laura)
├─ beach.jpg         (owner: maureen)
├─ mountains.jpg     (owner: laura)
 ~~~ 

It's important to test your permission model. To test the permissions manually, you can create relationships and check permissions through the API or SDK.

{% include_cached copy-clipboard.html %}
 ~~~ shell
$ keto check \"user:alice\" viewer documents /photos/beach.jpg --insecure-disable-transport-security
# allowed
 ~~~ 

By following this guide, you have successfully set up a global infrastructure identity and access management system with Ory and CockroachDB. This setup ensures scalability, high availability, and resilience while securing your enterprise assets.

### Simulate realistic workloads

You can validate the behavior of this integration under realistic conditions.
The [workload simulator](https://github.com/amineelkouhen/crdb-ory-load-test) project is a lightweight Golang-coded utility that generates concurrent API requests against the Ory endpoints (mainly Hydra, Kratos, and Keto) to emulate real-world authentication, token issuance, and permission checks.

It can spawn hundreds of simulated users performing signup, login, OAuth2 token exchange, and access-control queries, thereby stressing both Ory’s application logic and the underlying CockroachDB cluster.
This allows you to measure performance, latency, and resilience, observe how CockroachDB handles concurrent transactions, and tune replication or connection pooling parameters.

Results include detailed breakdowns:

 ~~~ shell
🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧
✅  Kratos Load generation and identity checks complete
⏱️  Duration:                10s
⚙️  Concurrency:             101
🚦  Checks/sec:              89.8
🧪  Mode:                    LIVE
🟢  Active:                  898
🔴  Inactive:                0
✏️  Writes:                  10
👁️  Reads:                   898
📊  Read/Write ratio:        89.8:1
🚨  Failed writes to Kratos: 0
🚨  Failed reads to Kratos:  0
🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧
 ~~~ 

## See also

- [Ory Overview]({% link {{ page.version.version }}/ory-overview.md %})
