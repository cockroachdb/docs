---
title: Deploy CockroachDB in a Kubernetes Cluster with the Operator
summary: Deploy a secure 3-node CockroachDB cluster with the Kubernetes operator.
toc: true
toc_not_nested: false
secure: true
docs_area: deploy
---

This page shows you how to start and stop a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster.

## Prerequisites and best practices

### Kubernetes version

To deploy CockroachDB v25.1 or later, Kubernetes 1.30 or higher is required. Cockroach Labs strongly recommends that you use a Kubernetes version that is eligible for [patch support by the Kubernetes project](https://kubernetes.io/releases/).

### Helm version

The CockroachDB Helm chart requires Helm 3.0 or higher. If you attempt to use an incompatible Helm version, an error like the following occurs:

```
Error: UPGRADE FAILED: template: cockroachdb/templates/tests/client.yaml:6:14: executing "cockroachdb/templates/tests/client.yaml" at <.Values.networkPolicy.enabled>: nil pointer evaluating interface {}.enabled
```

The Helm chart consists of two sub-charts:

* `operator` - The CockroachDB operator chart to be installed first.
* `cockroachdb` - The CockroachDB application chart to be installed after the operator is ready.

### Network

Service Name Indication (SNI) is an extension to the TLS protocol which allows a client to indicate which hostname it is attempting to connect to at the start of the TCP handshake process. The server can present multiple certificates on the same IP address and TCP port number, and one server can serve multiple secure websites or API services even if they use different certificates.

Due to its order of operations, the PostgreSQL wire protocol's implementation of TLS is not compatible with SNI-based routing in the Kubernetes ingress controller. Instead, use a TCP load balancer for CockroachDB that is not shared with other services.

If you want to secure your cluster to use TLS certificates for all network communications, Helm must be installed with RBAC privileges or else you will get an "attempt to grant extra privileges" error.

### Localities

CockroachDB clusters use locality labels to determine an efficient distribution of replicas. This is especially important in the case of multi-region deployments. In cloud provider deployments such as EKS/AKS/GKE, the `topology.kubernetes.io/region` and `topology.kubernetes.io/zone` labels are applied implicitly to Kubernetes nodes and populated by the regions and zones specific to the cloud provider. Other locality labels can be arbitrarily defined for further granularity, such as province, datacenter, rack, etc., but these need to be applied individually to the Kubernetes node when initialized so that CockroachDB can understand where the node lives and distribute replicas accordingly.

In the case of baremetal Kubernetes deployments, you must plan a hierarchy of locality labels that suit your CockroachDB node distribution, then apply these labels individually to nodes when they are initialized. Most of these values can be set arbitrarily, but region and zone locations must be set in the reserved `topology.kubernetes.io/region` and `topology.kubernetes.io/zone` namespace, respectively.

For more information on how locality labels are used by CockroachDB, see the [--locality flag documentation](cockroach-start.html#locality).

### Architecture

The operator is only supported in environments with an ARM64 or AMD64 architecture.

### Resources

When starting Kubernetes, select machines with at least 4 vCPUs and 16 GiB of memory, and provision at least 2 vCPUs and 8 Gi of memory to CockroachDB per pod. These minimum settings are used by default in this deployment guide, and are appropriate for testing purposes only. On a production deployment, you should adjust the resource settings for your workload.

### Storage

Kubernetes deployments use external persistent volumes that are often replicated by the provider. CockroachDB replicates data automatically, and this redundant layer of replication can impact performance. Using [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local) may improve performance.

## Step 1. Start Kubernetes

You can use the hosted [Google Kubernetes Engine (GKE)](#hosted-gke) service, hosted [Amazon Elastic Kubernetes Service (EKS)](#hosted-eks), or [Microsoft Azure Kubernetes Service (AKS)](#hosted-aks) to quickly start Kubernetes.

{{site.data.alerts.callout_info}}
GKE/EKS/AKS are not required to run CockroachDB on Kubernetes. Any cluster hardware with the minimum recommended Kubernetes version and at least 3 pods, each presenting sufficient resources to start a CockroachDB node, can also be used. However, note that support for other deployments may vary.
{{site.data.alerts.end}}

### Hosted GKE

1. Complete the **Before You Begin** steps described in the [Google Kubernetes Engine Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Kubernetes Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    The documentation offers the choice of using Google's Cloud Shell product or using a local shell on your machine. Choose to use a local shell if you want to be able to view the DB Console using the steps in this guide.

2. From your local workstation, start the Kubernetes cluster, specifying one of the available [regions](https://cloud.google.com/compute/docs/regions-zones#available) (e.g., `us-east1`):

    Since this region can differ from your default `gcloud` region, be sure to include the `--region` flag to run `gcloud` commands against this cluster.

    ```shell
    $ gcloud container clusters create cockroachdb --machine-type n2-standard-4 --region {region-name} --num-nodes 1
    
    Creating cluster cockroachdb...done.
    ```

    This creates GKE instances and joins them into a single Kubernetes cluster named `cockroachdb`. The `--region` flag specifies a [regional three-zone cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-regional-cluster), and `--num-nodes` specifies one Kubernetes worker node in each zone.
    
    The `--machine-type` flag tells the node pool to use the [n2-standard-4](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 16 GB memory), which meets our [recommended CPU and memory configuration](recommended-production-settings#basic-hardware-recommendations).
    The process can take a few minutes, so do not move on to the next step until you see a `Creating cluster cockroachdb...done` message and details about your cluster.
    
    {{site.data.alerts.callout_info}}
    Consider creating another, dedicated node group for the operator pod for system resource availability.
    {{site.data.alerts.end}}

3. Get the email address associated with your Google Cloud account:

    ```shell
    $ gcloud info | grep Account

    Account: [your.google.cloud.email@example.org]
    ```

    This command returns your email address in all lowercase. However, in the next step, you must enter the address using the accurate capitalization. For example, if your address is YourName@example.com, you must use YourName@example.com and not yourname@example.com.

4. [Create the RBAC roles](https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control#prerequisites_for_using_role-based_access_control) CockroachDB needs for running on GKE, using the address from the previous step:

    ```shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding \
      --clusterrole=cluster-admin \
      --user={your.google.cloud.email@example.org}

    clusterrolebinding.rbac.authorization.k8s.io/your.username-cluster-admin-binding created
    ```

### Hosted EKS

1. Complete the steps described in the [EKS Getting Started](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) documentation.

    This includes installing and configuring the AWS CLI and `eksctl`, which is the command-line tool used to create and delete Kubernetes clusters on EKS, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    If you are running [EKS-Anywhere](https://aws.amazon.com/eks/eks-anywhere/), CockroachDB requires that you [configure your default storage class](https://kubernetes.io/docs/tasks/administer-cluster/change-default-storage-class/) to auto-provision persistent volumes. Alternatively, you can define a custom storage configuration as required by your install pattern.

2. From your local workstation, start the Kubernetes cluster:

    To ensure that all 3 nodes can be placed into a different availability zone, you may want to first [confirm that at least 3 zones are available in the region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe) for your account.

    ```shell
    $ eksctl create cluster \
      --name cockroachdb \
      --nodegroup-name standard-workers \
      --node-type m6i.xlarge \
      --nodes 3 \
      --nodes-min 1 \
      --nodes-max 4 \
      --node-ami auto
    ```

    This creates EKS instances and joins them into a single Kubernetes cluster named `cockroachdb`. The `--node-type` flag tells the node pool to use the [m6i.xlarge](https://aws.amazon.com/ec2/instance-types/) instance type (4 vCPUs, 16 GB memory), which meets our [recommended CPU and memory configuration](recommended-production-settings#basic-hardware-recommendations).
    Cluster provisioning usually takes between 10 and 15 minutes. Do not move on to the next step until you see a message like `[✔] EKS cluster "cockroachdb" in "us-east-1" region is ready` and details about your cluster.

    {{site.data.alerts.callout_info}}
    Consider creating another, dedicated node group for the operator pod for system resource availability.
    {{site.data.alerts.end}}

3. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) to verify that the stacks `eksctl-cockroachdb-cluster` and `eksctl-cockroachdb-nodegroup-standard-workers` were successfully created. Be sure that your region is selected in the console.

### Hosted AKS

1. Complete the **Before you begin**, **Define environment variables**, and **Create a resource groups** steps described in the [AKS quickstart guide](https://learn.microsoft.com/azure/aks/learn/quick-kubernetes-deploy-cli). This includes setting up the Azure CLI and the `az` tool, which is the command-line tool to create and manage Azure cloud resources. 

    Set the environment variables as desired for your CRDB deployment. For these instructions, set the `MY_AKS_CLUSTER_NAME` variable to `cockroachdb`.

    Do not follow the **Create an AKS cluster** steps or following sections of the quickstart guide, as these topics will be described specifically for CRDB in this documentation.

2. From your workstation, create the Kubernetes cluster:

    ```shell
    $ az aks create \
      --resource-group $MY_RESOURCE_GROUP_NAME \
      --name $MY_AKS_CLUSTER_NAME \
      --node-count 3 \
      --generate-ssh-keys
    ```

3. Create an application in your Azure tenant and create a secret named `azure-cluster-identity-credentials-secret` which contains `AZURE_CLIENT_ID` and `AZURE_CLIENT_SECRET` to hold the application credentials. The following example YAML can be used to define this application:

    ```shell
    apiVersion: v1
    kind: Secret
      metadata:
        name: azure-cluster-identity-credentials-secret
        type: Opaque
        stringData:
          azure-credentials: |
          azure_client_id: 11111111-1111-1111-1111-111111111111
          azure_client_secret: s3cr3t
    ```

    See the [Azure.Identity documentation](https://learn.microsoft.com/dotnet/api/azure.identity.environmentcredential?view=azure-dotnet) for more information on how to use these variables.

### Baremetal/other deployments

For baremetal deployments, the specific Kubernetes infrastructure deployment steps should be similar to those described in [Hosted GKE](#hosted-gke) and [Hosted EKS](#hosted-eks).

* Be prepared to apply labels to your Kubernetes nodes upon initialization, that can be used by CockroachDB as [locality labels](#localities). In other cloud provider deployments, some of these labels are applied automatically by the provider. These must be applied manually in a baremetal deployment.

## Step 2. Start CockroachDB

### Install the Operator sub-chart

1. Check out the CockroachDB Helm repository from GitHub:

    ```shell
    $ git clone https://github.com/cockroachdb/helm-charts.git
    ```

2. Set your environment variables. This step is optional but recommended in order to use the example commands and templates described in these instructions. Note the default Kubernetes namespace of `cockroach-ns`.

    ```shell
    $ export CRDBOPERATOR=crdb-operator
    $ export CRDBCLUSTER=cockroachdb
    $ export NAMESPACE=cockroach-ns
    ```

3. Install the Operator sub-chart:

    ```shell
    $ kubectl create namespace $NAMESPACE
    $ helm install $CRDBOPERATOR ./cockroachdb-parent/charts/operator -n $NAMESPACE
    ```

### Initialize the cluster

1. Open `cockroachdb-parent/charts/cockroachdb/values.yaml`, a values file that tells Helm how to configure the Kubernetes cluster, in your text editor of choice.

2. Modify the `cockroachdb.crdbCluster.regions` section to describe the number of nodes to deploy and what region(s) to deploy them in. The default configuration uses `k3d`, replace with the `cloudProvider` of choice (`gcp`, `aws`, `azure`). For other deployments such as baremetal, the `cloudProvider` field is optional and can be removed altogether. The following example initializes three nodes on Google Cloud in the `us-central1` region:

    ```yaml
    cockroachdb:
      crdbCluster:
        regions:
          - code: us-central1
            nodes: 3
            cloudProvider: gcp
            namespace: cockroach-ns
    ```

    If you intend to deploy CockroachDB nodes across multiple different regions, follow the additional steps described in [Deploy across multiple regions](#deploy-across-multiple-regions).

3. Modify the values file with the CPU and memory requests and limits for each node to use, in the `cockroachdb.crdbCluster.resources` section. The default values are 4vCPU and 16GB of memory but this section must be uncommented similar to the following example:

    See [Resource management](configure-cockroachdb-kubernetes-operator.html) for more information on configuring node resource allocation.

4. Modify the TLS configuration as desired. For a secure deployment, set `cockroachdb.tls.enabled` in the values file to `true`. You can either use the default self-signer utility to generate all certificates, provide a custom CA certificate and generate other certificates, or use your own certificates.
    - **All self-signed certificates**: By default, the certificates are created by the self-signer utility which requires no configuration beyond setting a custom certificate duration if desired. This utility creates self-signed certificates for the nodes and root client which are stored in a secret. You can see these certificates by running `kubectl get secrets`:
        
        ```shell
        $ kubectl get secrets
        
        crdb-cockroachdb-ca-secret                 Opaque                                2      23s
        crdb-cockroachdb-client-secret             kubernetes.io/tls                     3      22s
        crdb-cockroachdb-node-secret               kubernetes.io/tls                     3      23s
        ```
        
        {{site.data.alerts.callout_info}}
        If you are deploying on OpenShift you must also set `cockroachdb.tls.selfSigner.securityContext.enabled` to `false` to mitigate stricter security policies.
        {{site.data.alerts.end}}
    - **Custom CA certificate**: If you wish to supply your own CA certificates to the deployed nodes but allow the self-signer utility to generate client certificates, create a Kubernetes secret with the custom CA certificate. To perform these steps using the `cockroach cert` command:
        
        ```shell
        $ mkdir certs
        $ mkdir my-safe-directory
        $ cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key
        ```
        
        Set `cockroachdb.tls.selfSigner.caProvided` to true and specify the secret where the certificate is stored:
        
        ```yaml
        cockroachdb:
          tls:
            enabled: true
            selfSigner:
              enabled: true
              caProvided: true
              caSecret: <ca-secret-name>
        ```
        
        {{site.data.alerts.callout_info}}
        If you are deploying on OpenShift you must also set `cockroachdb.tls.selfSigner.securityContext.enabled` to `false` to mitigate stricter security policies.
        {{site.data.alerts.end}}
    - **All custom certificates**: Set up your certificates and load them into your Kubernetes cluster as Secrets using the following commands:
        
        ```shell
        $ mkdir certs
        $ mkdir my-safe-directory
        $ cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key
        $ cockroach cert create-client root --certs-dir=certs --ca-key=my-safe-directory/ca.key
        $ kubectl create secret generic cockroachdb-root --from-file=certs
        
        secret/cockroachdb-root created
        
        $ cockroach cert create-node --certs-dir=certs --ca-key=my-safe-directory/ca.key localhost 127.0.0.1 my-release-cockroachdb-public my-release-cockroachdb-public.cockroach-ns my-release-cockroachdb-public.cockroach-ns.svc.cluster.local *.my-release-cockroachdb *.my-release-cockroachdb.cockroach-ns *.my-release-cockroachdb.cockroach-ns.svc.cluster.local
        $ kubectl create secret generic cockroachdb-node --from-file=certs
        
        secret/cockroachdb-node created
        ```
        
        {{site.data.alerts.callout_info}}
        The subject alternative names are based on a release called `my-release` in the `cockroach-ns` namespace. Make sure they match the services created with the release during Helm install.
        {{site.data.alerts.end}}
        
        If you wish to supply certificates with [cert-manager](https://cert-manager.io/), set `cockroachdb.tls.certManager.enabled` to `true`, and `cockroachdb.tls.certManager.issuer` to an IssuerRef (as they appear in certificate resources) pointing to a clusterIssuer or issuer that you have set up in the cluster. The following k8s application describes an example issuer:
        
        ```yaml
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
        ```
        
        If your certificates are stored in tls secrets such as secrets generated by cert-manager, the secret will contain files named: `ca.crt`, `tls.crt`, and `tls.key`.
        
        For CockroachDB, rename these files as applicable to match the following naming scheme: `ca.crt`, `node.crt`, `node.key`, `client.root.crt`, and `client.root.key`.
        
        Add the following to the values file:
        
        ```yaml
        cockroachdb:
        tls:
          enabled: true
          externalCertificates:
            enabled: true
            certificates:
              nodeSecretName: {node_secret_name}
              nodeClientSecretName: {client_secret_name}
        ```
        
        Replacing the following:
        - `{node_secret_name}`: The name of the Kubernetes secret that contains the generated client certificate and key.
        - `{client_secret_name}`: The name of the Kubernetes secret that contains the generated node certificate and key.
        
        See [Example: Authenticate with cockroach cert](#example-authenticate-with-cockroach-cert) for a more detailed walkthrough of a TLS configuration with manual certificates.

5. Review [locality labels](#localities) as needed for your Kubernetes host. These labels are written as a list of Kubernetes node values where the locality information of each node is stored, defined in `cockroachdb.crdbCluster.localityLabels`. When CockroachDB is initialized on a node, these values are processed as though they are provided through the [cockroach start –locality](cockroach-start#locality) flag. 

    If no locality labels are provided in `cockroachdb.crdbCluster.localityLabels`, the default locality labels are `region` and `zone`, stored in `topology.kubernetes.io/region` and `topology.kubernetes.io/zone` respectively. Cloud providers like EKS/AKS/GKE auto-populate these values describing the node’s region and zone, so for cloud provider deployments the locality labels can be left as-is:

    ```yaml
    cockroachdb:
      crdbCluster:
        localityLabels: []
    ```

    For baremetal deployments, you can use the default `localityLabels` configuration to use the default values for `region` and `zone` (`topology.kubernetes.io/region` and `topology.kubernetes.io/zone`), but will need to be set manually these values manually when the node is initialized because there is no cloud provider to do so automatically.

    To add more granular levels of locality to your nodes, add custom locality levels as values in the `cockroachdb.crdbCluster.localityLabels` list. Any custom `localityLabels` configuration overrides the default `region` and `zone` configuration, so if you append an additional locality level but wish to keep the `region` and `zone` labels you must declare them manually.

    The following example uses the existing `region` and `zone` labels and adds an additional `datacenter` locality label that is more granular than `zone`. This example declares that the `datacenter` locality information is stored in the `example.datacenter.locality` variable on the node:

    ```yaml
    cockroachdb:
      crdbCluster:
        localityLabels:
          - topology.kubernetes.io/region
          - topology.kubernetes.io/zone
          - example.datacenter.locality
    ```

    In this example, if a Kubernetes node is initialized in the `us-central1` region, `us-central1-c` zone, and `dc2` datacenter, its `cockroach start –locality` command would be similar to the following command:

    ```shell
    cockroach start --locality region=us-central1,zone=us-central1-c,example.datacenter.locality=dc2
    ```

    Optionally, review the `cockroachdb.crdbCluster.topologySpreadConstraints` configuration and set `topologyKey` to a locality variable that will have distinct values for each node. The default recommendation is to set this to a zone as follows:

    ```yaml
    cockroachdb:
      crdbCluster:
        topologySpreadConstraints:
          topologyKey: topology.kubernetes.io/zone
    ```

6. Modify other relevant parts of the configuration such as other `topologySpreadConstraints` fields, `service.ports`,  and others as needed for your configuration.

7. Run the following command to install the CockroachDB chart using Helm:

    ```shell
    $ helm install $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb -n $NAMESPACE
    ```

    You can override the default parameters using the `--set key=value[,key=value]` argument while installing the chart:

    ```shell
    $ helm install $CRDBCLUSTER  ./cockroachdb-parent/charts/cockroachdb --set clusterDomain=cluster-test.local -n $NAMESPACE
    ```

#### Deploy across multiple regions

The Helm chart supports specifying multiple region definitions in `cockroachdb.crdbCluster.regions` with their respective node counts. You must ensure the required networking is set up to allow for service discovery across regions. Also, ensure that the same CA cert is used across all the regions.

For each region, modify the `regions` configuration as described in [Initialize the cluster](#initialize-the-cluster) and perform `helm install` against the respective Kubernetes cluster. While applying the installation in a given region, do the following:

* Verify that the domain matches `cockroachdb.clusterDomain` in the values file
* Ensure that `cockroachdb.crdbCluster.regions` captures the information for regions that have already been deployed, including the current region. This allows CockroachDB in the current region to connect to clusters deployed in the existing regions.

The following example shows a configuration across two regions with 3 nodes in each cluster:

```yaml
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
```

## Step 3. Use the built-in SQL client

To use the CockroachDB SQL client, follow these steps to launch a secure pod running the `cockroach` binary.

1. Download the secure client k8s application:

    ```shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/helm-charts/master/examples/client-secure.yaml
    ```

    {{site.data.alerts.callout_danger}}
    Be mindful that this client tool logs into CockroachDB as root using the root certificates.
    {{site.data.alerts.end}}

2. Edit the yaml file with the following values:
    * `spec.serviceAccountName: my-release-cockroachdb`
    * `spec.image: cockroachdb/cockroach:`
    * `spec.volumes[0].project.sources[0].secret.name: my-release-cockroachdb-client-secret`

3. Launch a pod using this file and keep it running indefinitely:

    ```shell
    $ kubectl create -f client-secure.yaml
    ```

4. Get a shell into the pod and start the CockroachDB [built-in SQL client](cockroach-sql.html):

    ```shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach/cockroach-certs \
    --host=cockroachdb-public

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
    ```

    This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other cockroach client commands (e.g., cockroach node), repeat step 2 using the appropriate cockroach command. If you'd prefer to delete the pod and recreate it when needed, run `kubectl delete pod cockroachdb-client-secure`.

5. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    ```sql
    > CREATE DATABASE bank;
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    > SELECT * FROM bank.accounts;
      id | balance
    +----+---------+
      1 | 1000.50
    (1 row)
    ```

6. [Create a user with a password](create-user.html#create-a-user-with-a-password):

    ```sql
    > CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ```

    You will need this username and password to access the DB Console later.

7. Exit the SQL shell and pod:

  ```sql
  > \q
  ```

## Step 4. Access the DB Console

To access the cluster's [DB Console](ui-overview.html):

1. On secure clusters, [certain pages of the DB Console](ui-overview.html#db-console-access) can only be accessed by admin users.

    Get a shell into the pod and start the CockroachDB [built-in SQL client](cockroach-sql.html):

    ```shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach/cockroach-certs \
    --host=cockroachdb-public
    ```

2. Assign `roach` to the `admin` role (you only need to do this once):

    ```sql
    > GRANT admin TO roach;
    ```

3. Exit the SQL shell and pod:

    ```sql
    > \q
    ```

4. In a new terminal window, port-forward from your local machine to the `cockroachdb-public` service:

    ```shell
    $ kubectl port-forward service/cockroachdb-public 8080
    Forwarding from 127.0.0.1:8080 -> 8080
    ```

    The port-forward command must be run on the same machine as the web browser in which you want to view the DB Console. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring kubectl locally and running the above port-forward command on your local machine.

5. Go to [https://localhost:8080](https://localhost:8080/) and log in with the username and password you created earlier.

    {{site.data.alerts.callout_info}}
    If you are using Google Chrome, and you are getting an error about not being able to reach `localhost` because its certificate has been revoked, go to `chrome://flags/#allow-insecure-localhost`, enable "Allow invalid certificates for resources loaded from localhost", and then restart the browser. Enabling this Chrome feature degrades security for all sites running on `localhost`, not just CockroachDB's DB Console, so be sure to enable the feature only temporarily.
    {{site.data.alerts.end}}

6. In the UI, verify that the cluster is running as expected:
    1. View the [Node List](ui-cluster-overview-page.html#node-list) to ensure that all nodes successfully joined the cluster.
    2. Click the **Databases** tab on the left to verify that `bank` is listed.

## Next steps

Read the following pages for detailed information on cluster scaling, certificate management, resource management, best practices, and other cluster operation details:

* [Pod scheduling](schedule-cockroachdb-kubernetes-operator.html)
* [Resource management](configure-cockroachdb-kubernetes-operator.html)
* [Certificate management](secure-cockroachdb-kubernetes-operator.html)
* [Cluster scaling](scale-cockroachdb-kubernetes-operator.html)
* [Cluster monitoring](monitor-cockroachdb-kubernetes-operator.html)
* [Upgrade a cluster](upgrade-cockroachdb-kubernetes-operator.html)
* [CockroachDB performance on Kubernetes](kubernetes-operator-performance.html)

## Appendix

### Example: Authenticate with `cockroach cert`

This example uses [cockroach cert commands](cockroach-cert.html) to generate and sign the CockroachDB node and client certificates. To learn more about the supported methods of signing certificates, refer to [Authentication](authentication.html#using-digital-certificates-with-cockroachdb).

1. Create two directories:

    ```shell
    $ mkdir certs my-safe-directory
    ```

2. Create the CA certificate and key pair:

    ```shell
    $ cockroach cert create-ca \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ```

3. Create a client certificate and key pair for the root user:

    ```shell
    $ cockroach cert create-client root \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ```

4. Upload the client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the operator:

    ```shell
    $ kubectl create secret generic cockroachdb.client.root \
      --from-file=tls.key=certs/client.root.key \
      --from-file=tls.crt=certs/client.root.crt \
      --from-file=ca.crt=certs/ca.crt

    secret/cockroachdb.client.root created
    ```

5. Create the certificate and key pair for your CockroachDB nodes, specifying the namespace you used when deploying the cluster. This example uses the `cockroach-ns` namespace:

    ```shell
    $ cockroach cert create-node localhost \
      127.0.0.1 \
      cockroachdb-public \
      cockroachdb-public.cockroach-ns \
      cockroachdb-public.cockroach-ns.svc.cluster.local \
      *.cockroachdb \
      *.cockroachdb.cockroach-ns \
      *.cockroachdb.cockroach-ns.svc.cluster.local \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ```

6. Upload the node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the operator:

    ```shell
    $ kubectl create secret generic cockroachdb.node \
      --from-file=tls.key=certs/node.key \
      --from-file=tls.crt=certs/node.crt \
      --from-file=ca.crt=certs/ca.crt

    secret/cockroachdb.node created
    ```

7. Check that the secrets were created on the cluster:

    ```shell
    $ kubectl get secrets

    NAME                      TYPE                                   DATA   AGE
    cockroachdb.client.root   Opaque                                   3    13s
    cockroachdb.node          Opaque                                   3     3s
    default-token-6js7b       kubernetes.io/service-account-token      3     9h
    ```

8. Add `cockroachdb.tls.externalCertificates.certificates.nodeSecretName` and `cockroachdb.tls.externalCertificates.certificates.nodeClientSecretName` to the values file used to deploy the cluster:

    ```yaml
    cockroachdb:
    tls:
      enabled: true
      externalCertificates:
        enabled: true
        certificates:
          nodeSecretName: cockroachdb.node
          nodeClientSecretName: cockroachdb.client.root
    ```
