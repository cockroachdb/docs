---
title: Deploy CockroachDB with the CockroachDB Operator
summary: Deploy a secure 3-node CockroachDB cluster with the CockroachDB operator.
toc: true
toc_not_nested: false
secure: true
docs_area: deploy
---

This page describes how to start and stop a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

## Prerequisites and best practices

### Kubernetes version

To deploy CockroachDB v25.1 or later, Kubernetes 1.30 or higher is required. Cockroach Labs strongly recommends that you use a Kubernetes version that is eligible for [patch support by the Kubernetes project](https://kubernetes.io/releases/).

### Helm version

The CockroachDB Helm chart requires Helm 3.0 or higher. If you attempt to use an incompatible Helm version, an error like the following occurs:

~~~
Error: UPGRADE FAILED: template: cockroachdb/templates/tests/client.yaml:6:14: executing "cockroachdb/templates/tests/client.yaml" at <.Values.networkPolicy.enabled>: nil pointer evaluating interface {}.enabled
~~~

There are two Helm charts that must be deployed:

- `operator`: The {{ site.data.products.cockroachdb-operator }} chart to be installed first.
- `cockroachdb`: The CockroachDB application chart to be installed after the operator is ready.

### Network

Service Name Indication (SNI) is an extension to the TLS protocol that allows a client to indicate which hostname it is attempting to connect to at the start of the TCP handshake process. The server can present multiple certificates on the same IP address and TCP port number, and one server can serve multiple secure websites or API services even if they use different certificates.

Due to its order of operations, the PostgreSQL wire protocol's implementation of TLS is incompatible with SNI-based routing in the Kubernetes ingress controller. Instead, use a TCP load balancer for CockroachDB that is not shared with other services.

If you want to secure your cluster to use TLS certificates for all network communications, Helm must be installed with RBAC privileges. Otherwise, you will get an `attempt to grant extra privileges` error.

### Localities

CockroachDB clusters use localities to efficiently distribute replicas. This is especially important for [multi-region deployments](#multi-region-deployments). With the {{ site.data.products.cockroachdb-operator }}, you specify mappings between locality levels and the location on a Kubernetes node where the value for that locality can be found.

In cloud provider deployments (e.g., [GKE](#hosted-gke), [EKS](#hosted-eks), or [AKS](#hosted-aks)), the [`topology.kubernetes.io/region`](https://kubernetes.io/docs/reference/labels-annotations-taints/#topologykubernetesioregion) and [`topology.kubernetes.io/zone`](https://kubernetes.io/docs/reference/labels-annotations-taints/#topologykubernetesiozone) values on Kubernetes nodes are populated by cloud provider. For further granularity, you can define arbitrary locality labels (e.g., `province`, `datacenter`, `rack`), but these need to be applied individually to the Kubernetes node when initialized so that CockroachDB can understand where the node lives and distribute replicas accordingly.

On bare metal Kubernetes deployments, you must plan a hierarchy of localities that suit your CockroachDB node distribution, then apply these values individually to nodes when they are initialized. Although you can set most of these values arbitrarily, you must set region and zone locations in the reserved `topology.kubernetes.io/region` and `topology.kubernetes.io/zone` namespaces, respectively.

For more information on how locality labels are used by CockroachDB, refer to the [`--locality` documentation]({% link {{ page.version.version }}/cockroach-start.md %}#locality).

### Architecture

The {{ site.data.products.cockroachdb-operator }} is only supported in environments with an ARM64 or AMD64 architecture.

### Resources

When starting Kubernetes, select machines with at least 4 vCPUs and 16 GiB of memory, and provision at least 2 vCPUs and 8 GiB of memory to CockroachDB per pod. These minimum settings are used by default in this deployment guide, and are appropriate for testing purposes only. On a production deployment, you should adjust the resource settings for your workload.

### Storage

Kubernetes deployments use external persistent volumes that are often replicated by the provider. CockroachDB replicates data automatically, and this redundant layer of [replication]({% link {{ page.version.version }}/architecture/overview.md %}#replication) can impact performance. Using [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local) may improve performance.

### Multi-region deployments

The following deployment requirements and best practices apply to multi-region deployments with the {{ site.data.products.cockroachdb-operator }}:

- Plan an operator deployment in each region. Each operator handles CockroachDB node management in its own region, so you must factor that there are multiple operator deployments into your upgrade and maintenance strategy to ensure availability.
- VPC peering and CoreDNS are needed to resolve services and discovery across regions. Refer to the documentation for your cloud solution to configure your cross-region network accordingly.
- Make sure that region is part of your [locality](#localities) configuration and nodes are tagged consistently with their deployment region. For deployments with a cloud service provider this is handled automatically, but must be applied manually for bare metal deployments.
- A single certificate authority (CA) across all regions is required. One namespace per region is recommended to simplify certificate management.

## Step 1. Start Kubernetes

You can use the hosted [Google Kubernetes Engine (GKE)](#hosted-gke) service, hosted [Amazon Elastic Kubernetes Service (EKS)](#hosted-eks), or [Microsoft Azure Kubernetes Service (AKS)](#hosted-aks) to quickly start Kubernetes.

{{site.data.alerts.callout_success}}
Cloud providers such as GKE, EKS, and AKS are not required to run CockroachDB on Kubernetes. You can use any cluster hardware with the minimum recommended Kubernetes version and at least 3 pods, each presenting sufficient resources to start a CockroachDB node. However, note that support for other deployments may vary.
{{site.data.alerts.end}}

### Hosted GKE

1. Complete the **Before You Begin** steps described in the [Google Kubernetes Engine Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Kubernetes Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    The documentation offers the choice of using Google's Cloud Shell product or using a local shell on your machine. Choose to use a local shell if you want to be able to view the DB Console using the steps in this guide.

1. From your local workstation, start the Kubernetes cluster, specifying one of the available [regions](https://cloud.google.com/compute/docs/regions-zones#available) (e.g., `us-east1`).

    The process can take a few minutes, so do not move on to the next step until you see a `Creating cluster cockroachdb...done` message and details about your cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud container clusters create cockroachdb --machine-type n2-standard-4 --region {region-name} --num-nodes 1
    ~~~
    ~~~ shell
    Creating cluster cockroachdb...done.
    ~~~

    {{site.data.alerts.callout_info}}
    Since this region can differ from your default `gcloud` region, be sure to include the `--region` flag to run `gcloud` commands against this cluster.
    {{site.data.alerts.end}}

    This creates GKE instances and joins them into a single Kubernetes cluster named `cockroachdb`. The `--region` flag specifies a [regional three-zone cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-regional-cluster), and `--num-nodes` specifies one Kubernetes worker node in each zone.
    
    The `--machine-type` flag tells the node pool to use the [n2-standard-4](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 16 GB memory), which meets our [recommended CPU and memory configuration]({% link {{ page.version.version }}/recommended-production-settings.md %}#basic-hardware-recommendations).
    
    {{site.data.alerts.callout_info}}
    Consider creating another, dedicated node group for the operator pod for system resource availability.
    {{site.data.alerts.end}}

1. Get the email address associated with your Google Cloud account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud info | grep Account
    ~~~
    ~~~ shell
    Account: [your.google.cloud.email@example.org]
    ~~~

    The preceding command returns your email address in all lowercase. However, in the next step, you must enter the address using the accurate capitalization. For example, if your address is `YourName@example.com`, you must use `YourName@example.com` and not `yourname@example.com`.

1. [Create the RBAC roles](https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control#prerequisites_for_using_role-based_access_control) CockroachDB needs for running on GKE, using the address from the previous step:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create clusterrolebinding $USER-cluster-admin-binding \
      --clusterrole=cluster-admin \
      --user={your.google.cloud.email@example.org}
    ~~~
    ~~~ shell
    clusterrolebinding.rbac.authorization.k8s.io/your.username-cluster-admin-binding created
    ~~~

### Hosted EKS

1. Complete the steps described in the [EKS Getting Started](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) documentation.

    This includes installing and configuring the AWS CLI and `eksctl`, which is the command-line tool used to create and delete Kubernetes clusters on EKS, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    If you are running [EKS-Anywhere](https://aws.amazon.com/eks/eks-anywhere/), CockroachDB requires that you [configure your default storage class](https://kubernetes.io/docs/tasks/administer-cluster/change-default-storage-class/) to auto-provision persistent volumes. Alternatively, you can define a custom storage configuration as required by your install pattern.

1. From your local workstation, start the Kubernetes cluster:

    To ensure that all 3 nodes can be placed into a different availability zone, you may want to first [confirm that at least 3 zones are available in the region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe) for your account.

    Cluster provisioning usually takes between 10 and 15 minutes. Do not move on to the next step until you see a message like `[✔] EKS cluster "cockroachdb" in "us-east-1" region is ready` and details about your cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    eksctl create cluster \
      --name cockroachdb \
      --nodegroup-name standard-workers \
      --node-type m6i.xlarge \
      --nodes 3 \
      --nodes-min 1 \
      --nodes-max 4 \
      --node-ami auto
    ~~~

    This creates EKS instances and joins them into a single Kubernetes cluster named `cockroachdb`. The `--node-type` flag tells the node pool to use the [m6i.xlarge](https://aws.amazon.com/ec2/instance-types/) instance type (4 vCPUs, 16 GB memory), which meets our [recommended CPU and memory configuration]({% link {{ page.version.version }}/recommended-production-settings.md %}#basic-hardware-recommendations).

    {{site.data.alerts.callout_info}}
    Consider creating another, dedicated node group for the operator pod for system resource availability.
    {{site.data.alerts.end}}

1. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) to verify that the stacks `eksctl-cockroachdb-cluster` and `eksctl-cockroachdb-nodegroup-standard-workers` were successfully created. Be sure that your region is selected in the console.

### Hosted AKS

1. Complete the **Before you begin**, **Define environment variables**, and **Create a resource groups** steps described in the [AKS quickstart guide](https://learn.microsoft.com/azure/aks/learn/quick-kubernetes-deploy-cli). This includes setting up the Azure CLI and the `az` tool, which is the command-line tool to create and manage Azure cloud resources. 

    Set the environment variables as desired for your CockroachDB deployment. For these instructions, set the `MY_AKS_CLUSTER_NAME` variable to `cockroachdb`.

    Do not follow the **Create an AKS cluster** steps or following sections of the AKS quickstart guide, as these topics will be described specifically for CockroachDB in this documentation.

1. From your workstation, create the Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    az aks create \
      --resource-group $MY_RESOURCE_GROUP_NAME \
      --name $MY_AKS_CLUSTER_NAME \
      --node-count 3 \
      --generate-ssh-keys
    ~~~

1. Configure authentication for the {{ site.data.products.cockroachdb-operator }}. The operator can use [Azure Managed Identities](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) if they are configured.

    If Azure Managed Identities are not configured for the {{ site.data.products.cockroachdb-operator }}, create an application in your Azure tenant and create a secret named `azure-cluster-identity-credentials-secret` that contains `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` to hold the application credentials. You can use the following example YAML to define this application:

      ~~~ yaml
      apiVersion: v1
      kind: Secret
      metadata:
        name: azure-cluster-identity-credentials-secret
      type: Opaque
      stringData:
        azure-credentials: |
        azure_tenant_id: {tenant ID}
        azure_client_id: {client ID}
        azure_client_secret: {client secret}
      ~~~

      For more information on how to use these variables, refer to the [`Azure.Identity` documentation](https://learn.microsoft.com/dotnet/api/azure.identity.environmentcredential?view=azure-dotnet).

### Bare metal deployments

For bare metal deployments, the specific Kubernetes infrastructure deployment steps should be similar to those described in [Hosted GKE](#hosted-gke) and [Hosted EKS](#hosted-eks).

- You must plan a hierarchy of [locality labels](#localities) that suit your CockroachDB node distribution, then apply these labels individually to nodes when they are initialized. Although you can set most of these values arbitrarily, you must set region and zone locations in the reserved `topology.kubernetes.io/region` and `topology.kubernetes.io/zone` namespaces, respectively.

## Step 2. Start CockroachDB

### Install the operator sub-chart

1. Check out the CockroachDB Helm repository from GitHub:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachdb/helm-charts.git
    ~~~

1. Set your environment variables. This step is optional but recommended in order to use the example commands and templates described in the following instructions. Note the default Kubernetes namespace of `cockroach-ns`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export CRDBOPERATOR=crdb-operator
    export CRDBCLUSTER=cockroachdb
    export NAMESPACE=cockroach-ns
    ~~~

1. Install the operator sub-chart:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create namespace $NAMESPACE
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm install $CRDBOPERATOR ./cockroachdb-parent/charts/operator -n $NAMESPACE
    ~~~

### Initialize the cluster

1. Open `cockroachdb-parent/charts/cockroachdb/values.yaml`, a values file that tells Helm how to configure the Kubernetes cluster, in your text editor.

1. Modify the `cockroachdb.crdbCluster.regions` section to describe the number of CockroachDB nodes to deploy and what region(s) to deploy them in. Replace the default `cloudProvider` with the appropriate value (`gcp`, `aws`, `azure`). For bare metal deployments, you can remove the `cloudProvider` field. The following example initializes three nodes on Google Cloud in the `us-central1` region:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        regions:
          - code: us-central1
            nodes: 3
            cloudProvider: gcp
            namespace: cockroach-ns
    ~~~

    {{site.data.alerts.callout_info}}
    If you intend to deploy CockroachDB nodes across multiple different regions, follow the additional steps described in [Deploy across multiple regions](#deploy-across-multiple-regions).
    {{site.data.alerts.callout_end}}

1. Modify `cockroachdb.crdbCluster.podTemplate.spec.resources` in the values file with the CPU and memory limits and requests for each node to use. For example, to define default values of 4vCPU and 16GiB of memory:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        podTemplate:
          spec:
            resources:
              limits:
                cpu: 4000m
                memory: 16Gi
              requests:
                cpu: 4000m
                memory: 16gi
    ~~~

    For more information on configuring node resource allocation, refer to [Resource management]({% link {{ page.version.version }}/configure-cockroachdb-operator.md %})

1. Modify the TLS configuration as desired. For a secure deployment, set `cockroachdb.tls.enabled` in the values file to `true`. You can either allow the operator to generate self-signed certificates, provide a custom CA certificate and generate other certificates, or use your own certificates.
    - **All self-signed certificates**: By default, the certificates are created automatically by a self-signer utility, which requires no configuration beyond setting a custom certificate duration if desired. This utility creates self-signed certificates for the nodes and root client which are stored in a secret. You can see these certificates by running `kubectl get secrets`:
        
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl get secrets
        ~~~
        ~~~
        crdb-cockroachdb-ca-secret                 Opaque                                2      23s
        crdb-cockroachdb-client-secret             kubernetes.io/tls                     3      22s
        crdb-cockroachdb-node-secret               kubernetes.io/tls                     3      23s
        ~~~
        
        {{site.data.alerts.callout_info}}
        If you are deploying on OpenShift you must also set `cockroachdb.tls.selfSigner.securityContext.enabled` to `false` to mitigate stricter security policies.
        {{site.data.alerts.end}}
    - **Custom CA certificate**: If you wish to supply your own CA certificates to the deployed nodes but allow automatic generation of client certificates, create a Kubernetes secret with the custom CA certificate. To perform these steps using the `cockroach cert` command:
        
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        mkdir certs
        ~~~
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        mkdir my-safe-directory
        ~~~
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key
        ~~~
        
        Set `cockroachdb.tls.selfSigner.caProvided` to `true` and specify the secret where the certificate is stored:
        
        ~~~ yaml
        cockroachdb:
          tls:
            enabled: true
            selfSigner:
              enabled: true
              caProvided: true
              caSecret: {ca-secret-name}
        ~~~
        
        {{site.data.alerts.callout_info}}
        If you are deploying on OpenShift you must also set `cockroachdb.tls.selfSigner.securityContext.enabled` to `false` to mitigate stricter security policies.
        {{site.data.alerts.end}}
    - **All custom certificates**: Set up your certificates and load them into your Kubernetes cluster as secrets using the following commands:
        
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        mkdir certs
        ~~~
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        mkdir my-safe-directory
        ~~~
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key
        ~~~
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        cockroach cert create-client root --certs-dir=certs --ca-key=my-safe-directory/ca.key
        ~~~
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl create secret generic cockroachdb-root --from-file=certs
        ~~~
        ~~~ shell
        secret/cockroachdb-root created
        ~~~
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        cockroach cert create-node --certs-dir=certs --ca-key=my-safe-directory/ca.key localhost 127.0.0.1 my-release-cockroachdb-public my-release-cockroachdb-public.cockroach-ns my-release-cockroachdb-public.cockroach-ns.svc.cluster.local *.my-release-cockroachdb *.my-release-cockroachdb.cockroach-ns *.my-release-cockroachdb.cockroach-ns.svc.cluster.local
        kubectl create secret generic cockroachdb-node --from-file=certs
        ~~~
        ~~~ shell
        secret/cockroachdb-node created
        ~~~
        
        {{site.data.alerts.callout_info}}
        The subject alternative names are based on a release called `my-release` in the `cockroach-ns` namespace. Make sure they match the services created with the release during Helm install.
        {{site.data.alerts.end}}
        
        If you wish to supply certificates with [cert-manager](https://cert-manager.io/), set `cockroachdb.tls.certManager.enabled` to `true`, and `cockroachdb.tls.certManager.issuer` to an IssuerRef (as they appear in certificate resources) pointing to a clusterIssuer or issuer that you have set up in the cluster:
        
        ~~~ yaml
        cockroachdb:
          tls:
            enabled: true
            certManager:
              enabled: true
              caConfigMap: cockroachdb-ca
              nodeSecret: cockroachdb-node
              clientRootSecret: cockroachdb-root
              issuer:
                group: cert-manager.io
                kind: Issuer
                name: cockroachdb-cert-issuer
                clientCertDuration: 672h
                clientCertExpiryWindow: 48h
                nodeCertDuration: 8760h
                nodeCertExpiryWindow: 168h
        ~~~
        
        The following Kubernetes application describes an example issuer.
        
        ~~~ yaml
        apiVersion: v1
        kind: Secret
        metadata:
          name: cockroachdb-ca
          namespace: cockroach-ns
        data:
          tls.crt: [BASE64 Encoded ca.crt]
          tls.key: [BASE64 Encoded ca.key]
        type: kubernetes.io/tls
        ---
        apiVersion: cert-manager.io/v1alpha3
        kind: Issuer
        metadata:
          name: cockroachdb-cert-issuer
          namespace: cockroach-ns
        spec:
          ca:
            secretName: cockroachdb-ca
        ~~~
        
        If your certificates are stored in TLS secrets, such as secrets generated by `cert-manager`, the secret will contain files named: `ca.crt`, `tls.crt`, and `tls.key`.
        
        For CockroachDB, rename these files as applicable to match the following naming scheme: `ca.crt`, `node.crt`, `node.key`, `client.root.crt`, and `client.root.key`.
        
        Add the following to the values file:
        
        ~~~ yaml
        cockroachdb:
          tls:
            enabled: true
            externalCertificates:
              enabled: true
              certificates:
                nodeSecretName: {node_secret_name}
                nodeClientSecretName: {client_secret_name}
        ~~~
        
        Replacing the following:
        - `{node_secret_name}`: The name of the Kubernetes secret that contains the generated client certificate and key.
        - `{client_secret_name}`: The name of the Kubernetes secret that contains the generated node certificate and key.
        
        For a detailed tutorial of a TLS configuration with manual certificates, refer to [Authenticate with cockroach cert](#authenticate-with-cockroach-cert).

1. In `cockroachdb.crdbCluster.localityMappings`, provide [locality mappings](#localities) that define locality levels and map them to node labels where the locality information of each Kubernetes node is stored. When CockroachDB is initialized on a node, it processes these values as though they are provided through the [`cockroach start --locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag. 

    If `localityMappings` is not configured, by default the {{ site.data.products.cockroachdb-operator }} uses the `region` and `zone` locality labels, mapped implicitly to the [`topology.kubernetes.io/region`](https://kubernetes.io/docs/reference/labels-annotations-taints/#topologykubernetesioregion) and [`topology.kubernetes.io/zone`](https://kubernetes.io/docs/reference/labels-annotations-taints/#topologykubernetesiozone) node labels.
    - In cloud provider deployments, the `topology.kubernetes.io/region` and `topology.kubernetes.io/zone` values on a node are populated by the cloud provider.
    - In bare metal deployments, the `topology.kubernetes.io/region` and `topology.kubernetes.io/zone` node label values are not set implicitly by a cloud provider when initializing the node, so you must set them manually or configure custom locality labels.

    To add more granular levels of locality to your nodes or use different locality labels, add custom locality levels as values in the `cockroachdb.crdbCluster.localityMappings` list. Any custom `localityMappings` configuration overrides the default `region` and `zone` configuration, so if you append an additional locality level but wish to keep the `region` and `zone` labels you must declare them manually.

    The following example uses the existing `region` and `zone` labels and adds an additional `datacenter` locality mapping that is more granular than `zone`. This example declares that the `dc` locality information is stored in the `example.datacenter.locality` node label:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        localityMappings:
          - nodeLabel: "topology.kubernetes.io/region"
            localityLabel: "region"
          - nodeLabel: "topology.kubernetes.io/zone"
            localityLabel: "zone"
          - nodeLabel: "example.datacenter.locality"
            localityLabel: "dc"
    ~~~

    The list of `localityMappings` is processed in a top-down hierarchy, where each entry is processed as a lower locality level than the previous locality. In this example, if a Kubernetes node is initialized in the `us-central1` region, `us-central1-c` zone, and `dc2` datacenter, its `cockroach start --locality` flag would be equivalent to the following:

    ~~~ shell
    cockroach start --locality region=us-central1,zone=us-central1-c,dc=dc2
    ~~~

    Optionally, review the `cockroachdb.crdbCluster.podTemplate.spec.topologySpreadConstraints` configuration and set `topologyKey` to the `nodeLabel` value of a locality level that has distinct values for each node. By default the lowest locality level is `zone`, so the following configuration sets that value as the `topologyKey`:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        podTemplate:
          spec:
            topologySpreadConstraints:
              # maxSkew defines the degree to which the pods can be unevenly distributed.
            - maxSkew: 1
              # topologyKey defines the key for topology spread.
              topologyKey: topology.kubernetes.io/zone
    ~~~

    For more information on localities and topology planning, see the [topology patterns documentation]({% link {{ page.version.version }}/topology-patterns.md %}).

1. Modify other relevant parts of the configuration such as other `topologySpreadConstraints` fields, `service.ports`,  and others as needed for your configuration.

1. Run the following command to install the CockroachDB chart using Helm:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm install $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb -n $NAMESPACE
    ~~~

    You can override the default parameters using the `--set key=value[,key=value]` argument while installing the chart:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm install $CRDBCLUSTER  ./cockroachdb-parent/charts/cockroachdb --set clusterDomain=cluster-test.local -n $NAMESPACE
    ~~~

#### Deploy across multiple regions

The Helm chart supports specifying multiple region definitions in `cockroachdb.crdbCluster.regions` with their respective node counts. Make sure to review the prerequisites and best practices for a [multi-region deployment](#multi-region-deployments).

For each region, modify the `regions` configuration as described in [Initialize the cluster](#initialize-the-cluster) and perform `helm install` against the respective Kubernetes cluster.

The following example shows a configuration across two regions, `us-central1` and `us-east1`, with 3 nodes in each cluster:

~~~ yaml
cockroachdb:
  clusterDomain: cluster.gke.gcp-us-east1
  crdbCluster:
    regions:
      - code: us-central1
        nodes: 3
        cloudProvider: gcp
        domain: cluster.gke.gcp-us-central1
        namespace: cockroach-ns
      - code: us-east1
        nodes: 3
        cloudProvider: gcp
        domain: cluster.gke.gcp-us-east1
        namespace: cockroach-ns
~~~

While applying the installation in a given region, do the following:
- Verify that the domain matches `cockroachdb.clusterDomain` in the values file.
- Ensure that `cockroachdb.crdbCluster.regions` captures the information for regions that have already been deployed, including the current region. This allows CockroachDB in the current region to connect to clusters deployed in the existing regions.

## Step 3. Use the built-in SQL client

To use the CockroachDB SQL client, follow these steps to launch a secure pod running the `cockroach` binary.

1. Download the secure client Kubernetes application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -O https://raw.githubusercontent.com/cockroachdb/helm-charts/master/examples/client-secure.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    This client tool logs into CockroachDB as `root` using the root certificates.
    {{site.data.alerts.end}}

1. Edit the yaml file with the following values:
    - `spec.serviceAccountName: my-release-cockroachdb`
    - `spec.image: cockroachdb/cockroach:`
    - `spec.volumes[0].project.sources[0].secret.name: my-release-cockroachdb-client-secret`

1. Launch a pod using this file and keep it running indefinitely:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create -f client-secure.yaml
    ~~~

1. Get a shell into the pod and start the CockroachDB [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach/cockroach-certs \
    --host=cockroachdb-public
    ~~~
    ~~~ shell
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    # Server version: CockroachDB CCL v21.1.0 (x86_64-unknown-linux-gnu, built 2021/04/23 13:54:57, go1.13.14) (same version as client)
    # Cluster ID: a96791d9-998c-4683-a3d3-edbf425bbf11
    #
    # Enter \? for a brief introduction.
    #
    root@cockroachdb-public:26257/defaultdb>
    ~~~

    This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other cockroach client commands (e.g., cockroach node), repeat this step using the appropriate cockroach command. If you'd prefer to delete the pod and recreate it when needed, run `kubectl delete pod cockroachdb-client-secure`.

1. Run some basic [CockroachDB SQL statements]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %}):

    ~~~ sql
    CREATE DATABASE bank;
    CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    INSERT INTO bank.accounts VALUES (1, 1000.50);
    SELECT * FROM bank.accounts;
      id | balance
    +----+---------+
      1 | 1000.50
    (1 row)
    ~~~

1. [Create a user with a password]({% link {{ page.version.version }}/create-user.md %}#create-a-user-with-a-password):

    ~~~ sql
    CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ~~~

    You will need this username and password to access the DB Console later.

1. Exit the SQL shell and pod:

  ~~~ sql
  \q
  ~~~

## Step 4. Access the DB Console

To access the cluster's [DB Console]({% link {{ page.version.version }}/ui-overview.md %}):

1. On secure clusters, [certain pages of the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) can only be accessed by `admin` users.

    Get a shell into the pod and start the CockroachDB [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach/cockroach-certs \
    --host=cockroachdb-public
    ~~~

1. Assign `roach` to the `admin` role (you only need to do this once):

    ~~~ sql
    GRANT admin TO roach;
    ~~~

1. Exit the SQL shell and pod:

    ~~~ sql
    \q
    ~~~

1. In a new terminal window, port-forward from your local machine to the `cockroachdb-public` service:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl port-forward service/cockroachdb-public 8080
    ~~~
    ~~~ shell
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

    Run the `port-forward` command on the same machine as the web browser in which you want to view the DB Console. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring `kubectl` locally and running the preceding `port-forward` command on your local machine.

1. Go to [`https://localhost:8080`](https://localhost:8080/) and log in with the username and password you created earlier.

    {{site.data.alerts.callout_info}}
    If you are using Google Chrome, and get an error about not being able to reach `localhost` because its certificate has been revoked, go to `chrome://flags/#allow-insecure-localhost`, enable "Allow invalid certificates for resources loaded from localhost", and then restart the browser. This degrades security for all sites running on `localhost`, not just CockroachDB's DB Console, so enable the feature only temporarily.
    {{site.data.alerts.end}}

1. In the DB Console, verify that the cluster is running as expected:
    1. View the [**Node List**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-list) to ensure that all nodes successfully joined the cluster.
    1. Click the **Databases** tab on the left to verify that `bank` is listed.

## Next steps

Read the following pages for detailed information on cluster scaling, certificate management, resource management, best practices, and other cluster operation details:

- [Pod scheduling]({% link {{ page.version.version }}/schedule-cockroachdb-operator.md %})
- [Resource management]({% link {{ page.version.version }}/configure-cockroachdb-operator.md %})
- [Certificate management]({% link {{ page.version.version }}/secure-cockroachdb-operator.md %})
- [Cluster scaling]({% link {{ page.version.version }}/scale-cockroachdb-operator.md %})
- [Cluster monitoring]({% link {{ page.version.version }}/monitor-cockroachdb-operator.md %})
- [Upgrade a cluster]({% link {{ page.version.version }}/upgrade-cockroachdb-operator.md %})
- [Override deployment templates]({% link {{ page.version.version }}/override-templates-cockroachdb-operator.md %})
- [CockroachDB performance on Kubernetes]({% link {{ page.version.version }}/cockroachdb-operator-performance.md %})

## Examples

### Authenticate with `cockroach cert`

The following example uses [cockroach cert commands]({% link {{ page.version.version }}/cockroach-cert.md %}) to generate and sign the CockroachDB node and client certificates. To learn more about the supported methods of signing certificates, refer to [Authentication]({% link {{ page.version.version }}/authentication.md %}#using-digital-certificates-with-cockroachdb).

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir certs my-safe-directory
    ~~~

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-ca \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-client root \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the {{ site.data.products.cockroachdb-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.client.root \
      --from-file=tls.key=certs/client.root.key \
      --from-file=tls.crt=certs/client.root.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~
    ~~~ shell
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes, specifying the namespace you used when deploying the cluster. This example uses the `cockroach-ns` namespace:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node localhost \
      127.0.0.1 \
      cockroachdb-public \
      cockroachdb-public.cockroach-ns \
      cockroachdb-public.cockroach-ns.svc.cluster.local \
      *.cockroachdb \
      *.cockroachdb.cockroach-ns \
      *.cockroachdb.cockroach-ns.svc.cluster.local \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the {{ site.data.products.cockroachdb-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.node \
      --from-file=tls.key=certs/node.key \
      --from-file=tls.crt=certs/node.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~
    ~~~ shell
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get secrets
    ~~~
    ~~~ shell
    NAME                      TYPE                                   DATA   AGE
    cockroachdb.client.root   Opaque                                   3    13s
    cockroachdb.node          Opaque                                   3     3s
    default-token-6js7b       kubernetes.io/service-account-token      3     9h
    ~~~

1. Add `cockroachdb.tls.externalCertificates.certificates.nodeSecretName` and `cockroachdb.tls.externalCertificates.certificates.nodeClientSecretName` to the values file used to deploy the cluster:

    ~~~ yaml
    cockroachdb:
    tls:
      enabled: true
      externalCertificates:
        enabled: true
        certificates:
          nodeSecretName: cockroachdb.node
          nodeClientSecretName: cockroachdb.client.root
    ~~~
