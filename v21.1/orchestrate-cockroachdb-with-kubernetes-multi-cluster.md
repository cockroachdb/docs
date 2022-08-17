---
title: Orchestrate CockroachDB Across Multiple Kubernetes Clusters
summary: Orchestrate the deployment, management, and monitoring of CockroachDB across multiple Kubernetes clusters in different regions.
toc: true
toc_not_nested: true
---

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="gke">GKE</button>
    <button class="filter-button" data-scope="eks">EKS</button>
</div>

This page shows you how to orchestrate a secure CockroachDB deployment across three [Kubernetes](http://kubernetes.io/) clusters, each in a different geographic region, using [StatefulSets](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) to manage the containers within each cluster and linking them together via DNS. This will result in a single, multi-region CockroachDB cluster running on Kubernetes.

{{site.data.alerts.callout_success}}
To deploy CockroachDB in a single Kubernetes cluster instead, see [Kubernetes Single-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).
{{site.data.alerts.end}}

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

- [Kubernetes terminology](#kubernetes-terminology)
- [UX differences from running in a single cluster](#ux-differences-from-running-in-a-single-cluster)
- [Limitations](#limitations)

### Kubernetes terminology

Feature | Description
--------|------------
[node](https://kubernetes.io/docs/concepts/architecture/nodes/) | A physical or virtual machine. In this tutorial, you'll run GKE or EKS instances and join them as worker nodes in three independent Kubernetes clusters, each in a different region.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, each pod will run on a separate GKE or EKS instance and include one Docker container running a single CockroachDB node. You'll start with 3 pods in each region and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) | A CSR, or certificate signing request, is a request to have a TLS certificate verified by a certificate authority (CA). A CSR is issued for the CockroachDB node running in each pod, as well as each client as it connects to the Kubernetes cluster.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or role-based access control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod`), the client must have a `Role` that allows it to do so.
[namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) | A namespace provides a scope for resources and names within a Kubernetes cluster. Names of resources must be unique within a namespace, but not across namespaces. Most Kubernetes client commands will use the `default` namespace by default, but can operate on resources in other namespaces as well. In this tutorial, CockroachDB pods will be deployed in their own namespace in each Kubernetes cluster.
[kubectl](https://kubernetes.io/docs/reference/kubectl/overview/) | `kubectl` is the command-line interface for running commands against Kubernetes clusters.
[kubectl context](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#kubectl-context-and-configuration) | When multiple Kubernetes clusters are deployed on your account, `kubectl` "context" specifies a cluster to connect to.

### UX differences from running in a single cluster

These instructions create 3 StatefulSets that each run 3 CockroachDB pods in a separate Kubernetes cluster deployed in its own region. If you haven't often worked with multiple Kubernetes clusters, remember that `kubectl` commands are run against a cluster in a specific context. Either run `kubectl use-context <cluster-context>` frequently to switch contexts between commands, or append `--context <cluster-context>` to the commands you run to ensure they are run against the correct cluster.

<section class="filter-content" markdown="1" data-scope="gke">
Each Kubernetes cluster's DNS server is pointed at the other clusters' DNS servers so that DNS lookups for certain zone-scoped suffixes (e.g., `*.us-west1-a.svc.cluster.local`) can be deferred to the appropriate cluster's DNS server. To make this work, we create the StatefulSets in namespaces named after the region in which each Kubernetes cluster is deployed. To run a command against one of the pods, append `--namespace <cluster-namespace>` to your commands. Alternatively, run `kubectl config set-context <context-name> --namespace <namespace-name>` to set the default namespace for a context.

Because the CockroachDB pods run in a non-default namespace, client applications wanting to talk to CockroachDB from the default namespace would need to use a zone-scoped service name (e.g., `cockroachdb-public.us-west1-a`) rather than `cockroachdb-public`, as in a single-cluster setting. However, the setup script used by these instructions sets up an additional [`ExternalName` service](https://kubernetes.io/docs/concepts/services-networking/service/#externalname) in the default namespace such that the clients in the default namespace can simply talk to the `cockroachdb-public` address.
</section>

<section class="filter-content" markdown="1" data-scope="eks">
To enable the pods to communicate across regions, we peer the VPCs in all 3 regions with each other and configure a CoreDNS service in each region to route DNS traffic to the appropriate pods. To make this work, we create the StatefulSets in namespaces named after the region in which each Kubernetes cluster is deployed. To run a command against one of the pods, append `--namespace <cluster-namespace>` to your commands. Alternatively, run `kubectl config set-context <context-name> --namespace <namespace-name>` to set the default namespace for a context.
</section>

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

<section class="filter-content" markdown="1" data-scope="gke">
#### Exposing DNS servers

{{site.data.alerts.callout_danger}}
Until December 2019, Google Cloud Platform restricted clients to using a load balancer in the same region. In the approach documented below, the DNS servers from each Kubernetes cluster are hooked together by exposing them via a load balanced IP address that is visible to the public Internet. None of the services in your Kubernetes cluster will be accessible publicly, but their names could leak out to a motivated attacker.

You can now [enable global access](https://cloud.google.com/load-balancing/docs/internal/setting-up-internal#ilb-global-access) on Google Cloud Platform to allow clients from one region to use an internal load balancer in another. We will update this tutorial accordingly.
{{site.data.alerts.end}}
</section>

## Step 1. Start Kubernetes clusters

Our multi-region deployment approach relies on pod IP addresses being routable across three distinct Kubernetes clusters and regions. Both the hosted Google Kubernetes Engine (GKE) and Amazon Elastic Kubernetes Service (EKS) satisfy this requirement.

If you want to run on another cloud or on-premises, use this [basic network test](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/multiregion#pod-to-pod-connectivity) to see if it will work.

<section class="filter-content" markdown="1" data-scope="gke">
1. Complete the **Before You Begin** steps described in the [Google Kubernetes Engine Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Kubernetes Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    {{site.data.alerts.callout_success}}The documentation offers the choice of using Google's Cloud Shell product or using a local shell on your machine. Choose to use a local shell if you want to be able to view the DB Console using the steps in this guide.{{site.data.alerts.end}}

1. From your local workstation, start the first Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb1 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb1...done.
    ~~~

    This creates GKE instances in the zone specified and joins them into a single Kubernetes cluster named `cockroachdb1`.

    {{site.data.alerts.callout_info}}
    The process can take a few minutes, so do not move on to the next step until you see a `Creating cluster cockroachdb1...done` message and details about your cluster.
    {{site.data.alerts.end}}

1. Start the second Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb2 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb2...done.
    ~~~

1. Start the third Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb3 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb3...done.
    ~~~

1. Get the `kubectl` "contexts" for your clusters:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl config get-contexts
    ~~~

    ~~~
    CURRENT   NAME                                                  CLUSTER                                               AUTHINFO                                              NAMESPACE
    *         gke_cockroach-shared_us-east1-b_cockroachdb1          gke_cockroach-shared_us-east1-b_cockroachdb1          gke_cockroach-shared_us-east1-b_cockroachdb1
              gke_cockroach-shared_us-west1-a_cockroachdb2          gke_cockroach-shared_us-west1-a_cockroachdb2          gke_cockroach-shared_us-west1-a_cockroachdb2
              gke_cockroach-shared_us-central1-a_cockroachdb3       gke_cockroach-shared_us-central1-a_cockroachdb3       gke_cockroach-shared_us-central1-a_cockroachdb3                        
    ~~~

    {{site.data.alerts.callout_info}}
    `kubectl` commands are run against the `CURRENT` context by default. You can change the current context with this command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl config use-context <context-name>
    ~~~

    When sending commands to another context, you need to use the `--context` flag to specify the context. For clarity, every `kubectl` command in this tutorial uses the `--context` flag to indicate the proper context.
    {{site.data.alerts.end}}

1. Get the email address associated with your Google Cloud account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud info | grep Account
    ~~~

    ~~~
    Account: [your.google.cloud.email@example.org]
    ~~~

    {{site.data.alerts.callout_danger}}
    This command returns your email address in all lowercase. However, in the next step, you must enter the address using the accurate capitalization. For example, if your address is YourName@example.com, you must use YourName@example.com and not yourname@example.com.
    {{site.data.alerts.end}}

1. For each Kubernetes cluster, [create the RBAC roles](https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control#prerequisites_for_using_role-based_access_control) CockroachDB needs for running on GKE, using the email address and relevant "context" name from the previous steps:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org> --context <cluster-context-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org> --context <cluster-context-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org> --context <cluster-context-3>
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="eks">
1. Complete the steps described in the [EKS Getting Started](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) documentation.

    This includes installing and configuring the AWS CLI and `eksctl`, which is the command-line tool used to create and delete Kubernetes clusters on EKS, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

1. From your local workstation, create three Kubernetes clusters. For each cluster, specify a unique region and a **non-overlapping** IP range for the VPC in CIDR notation (e.g., 10.0.0.0/16). Refer to the AWS documentation for valid [regions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions) and [CIDR blocks](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Subnets.html#VPC_Sizing).

    {{site.data.alerts.callout_danger}}
    In order to enable VPC peering between the regions, the CIDR blocks of the VPCs **must not** overlap. This value cannot change once the cluster has been created, so be sure that your IP ranges do not overlap.
    {{site.data.alerts.end}}

    {{site.data.alerts.callout_success}}
    To ensure that all 3 nodes can be placed into a different availability zone, you may want to first [confirm that at least 3 zones are available in the region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe) for your account.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl create cluster \
    --name cockroachdb1 \
    --nodegroup-name standard-workers \
    --node-type m5.xlarge \
    --nodes 3 \
    --node-ami auto \
    --region <aws-region-1> \
    --vpc-cidr <ip-range-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl create cluster \
    --name cockroachdb2 \
    --nodegroup-name standard-workers \
    --node-type m5.xlarge \
    --nodes 3 \
    --node-ami auto \
    --region <aws-region-2> \
    --vpc-cidr <ip-range-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl create cluster \
    --name cockroachdb3 \
    --nodegroup-name standard-workers \
    --node-type m5.xlarge \
    --nodes 3 \
    --node-ami auto \
    --region <aws-region-3> \
    --vpc-cidr <ip-range-3>
    ~~~

    Each command creates three EKS instances in a region, one for each CockroachDB node you will deploy. Note that each instance is assigned to a different availability zone in the region.

    In each region, the EKS instances are joined into a separate Kubernetes cluster: `cockroachdb1`, `cockroachdb2`, and `cockroachdb3`. The `--node-type` flag tells the node pool to use the [`m5.xlarge`](https://aws.amazon.com/ec2/instance-types/) instance type (4 vCPUs, 16 GB memory), which meets our [recommended CPU and memory configuration](recommended-production-settings.html#basic-hardware-recommendations).

    {{site.data.alerts.callout_info}}
    Cluster provisioning usually takes between 10 and 15 minutes. Do not move on to the next step until you see a message like `[✔]  EKS cluster "cockroachdb1" in "us-east-1" region is ready` for each cluster.
    {{site.data.alerts.end}}

1. Open the [Amazon EC2 console](https://console.aws.amazon.com/ec2/) and verify that three instances, using the node group name you specified, are running in each region. You will need to toggle between each region in the console.

1. Get the context name for each of the 3 regions. When running `kubectl` commands against each region's cluster, you will need to specify the context name for that region.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl config get-contexts
    ~~~

    ~~~
    CURRENT   NAME                                           CLUSTER                               AUTHINFO                                       NAMESPACE
    *         maxroach@cockroachdb1.eu-central-1.eksctl.io   cockroachdb1.eu-central-1.eksctl.io   maxroach@cockroachdb1.eu-central-1.eksctl.io
              maxroach@cockroachdb2.ca-central-1.eksctl.io   cockroachdb2.ca-central-1.eksctl.io   maxroach@cockroachdb2.ca-central-1.eksctl.io
              maxroach@cockroachdb3.eu-north-1.eksctl.io     cockroachdb3.eu-north-1.eksctl.io     maxroach@cockroachdb3.eu-north-1.eksctl.io
    ~~~

    {{site.data.alerts.callout_info}}
    `kubectl` commands are run against the "current" context by default. You can change the current context with `kubectl config use-context <context-name>`.

    When running commands on another region, you need to use the `--context` flag to specify that region's context. For clarity, every `kubectl` command in this tutorial uses the `--context` flag to indicate the proper context.
    {{site.data.alerts.end}}

1. Create three namespaces, one corresponding to each region. The CockroachDB cluster in each region will run in this namespace.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create namespace <cluster-namespace> --context <cluster-context>
    ~~~

    It's simplest for the namespace and region to have the same name, e.g.:

    ~~~ shell
    kubectl create namespace eu-central-1 --context maxroach@cockroachdb1.eu-central-1.eksctl.io
    ~~~

    {{site.data.alerts.callout_info}}
    `kubectl` commands are run against the namespace named `default` by default. You can change the default namespace for a given context with `kubectl config set-context <context-name> --namespace <namespace-name>`.

    For clarity, every `kubectl` command in this tutorial uses the `--namespace` flag to indicate the proper namespace.
    {{site.data.alerts.end}}

## Step 2. Configure your network

### Set up VPC peering

For pods to communicate across three separate Kubernetes clusters, the VPCs in all regions need to be peered. Network traffic can then be routed between the VPCs. For more information about VPC peering, see the [AWS documentation](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html).

1. Open the [Amazon VPC console](https://console.aws.amazon.com/vpc/) and note the ID of the VPC in each region. The VPC ID is found in the section called Your VPCs.

1. Navigate to the Peering Connections section and [create a VPC peering connection](https://docs.aws.amazon.com/vpc/latest/peering/create-vpc-peering-connection.html#create-vpc-peering-connection-local) between each of the 3 regions. When you create a peering connection, you will first select a requester VPC in the current region and then an accepter VPC in another region, specified by pasting the VPC ID.

    {{site.data.alerts.callout_success}}
    You need to create a total of 3 VPC peering connections between your 3 VPCs, which means switching regions at least once in the console. For example, if you are deploying in `eu-central-1`, `eu-north-1`, and `ca-central-1`, you can select `eu-central-1` in the console and create VPC peering connections to both `eu-north-1` and `ca-central-1`. Then switch to either `eu-north-1` or `ca-central-1` to create the VPC peering connection between those two regions.
    {{site.data.alerts.end}}

1. To complete the VPC peering connections, switch to each destination region and [accept the pending connection](https://docs.aws.amazon.com/vpc/latest/peering/create-vpc-peering-connection.html#accept-vpc-peering-connection) in the VPC console.

1. For all 3 regions, navigate to the Route Tables section and find `PublicRouteTable`. [Update this route table](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-routing.html) with 2 new entries that point traffic to the other 2 peered VPCs. The **Destination** should be the CIDR block of a destination region, and the **Target** should be the VPC peering connection between the current and the destination region.

### Create inbound rules

For each region, navigate to the Security Groups section of the [Amazon EC2 console](https://console.aws.amazon.com/ec2/) and locate the security group that enables communication between nodes in the cluster. It should have a name like `ClusterSharedNodeSecurityGroup`. [Add Custom TCP inbound rules](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html#adding-security-group-rule) to this security group to allow TCP communication on two ports:

- `26257` for inter-node and client-node communication. This enables the nodes to work as a cluster, the load balancer to route traffic to the nodes, and applications to connect to the load balancer.
- `8080` for exposing the DB Console to the user, and for routing the load balancer to the health check endpoint.

{{site.data.alerts.callout_info}}
Remember to create these inbound rules in all 3 regions. This enables CockroachDB to communicate across each Kubernetes cluster.
{{site.data.alerts.end}}

#### Inter-region communication

 Field | Value
-------|-------------------
Port Range | **26257**
Source | The IP range of each region's VPC in CIDR notation (e.g., 10.12.0.0/16)

This important rule enables node communication between Kubernetes clusters in different regions. You need to create a separate rule for each region in your deployment.

{% include {{ page.version.version }}/prod-deployment/aws-inbound-rules.md %}

### Set up load balancing

The Kubernetes cluster in each region needs to have a [Network Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html) pointed at its CoreDNS service, which you will configure in the next step.

1. Upload our load balancer manifest [`dns-lb-eks.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/multiregion/eks/dns-lb-eks.yaml) to the Kubernetes clusters in all 3 regions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/eks/dns-lb-eks.yaml --context <cluster-context-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/eks/dns-lb-eks.yaml --context <cluster-context-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/eks/dns-lb-eks.yaml --context <cluster-context-3>
    ~~~

    You should see the load balancer appear in the Load Balancers section of the EC2 console in each region. This load balancer will route traffic to CoreDNS in the region.

1. For each region, navigate to the Load Balancer section of the [EC2 console](https://console.aws.amazon.com/ec2/) and get the DNS name of the Network Load Balancer you created in the previous step.

1. For each region's load balancer, look up the IP addresses mapped to the load balancer's DNS name:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    dig <nlb-dns-name>
    ~~~

    ~~~
    ...

    ;; ANSWER SECTION:
    ac63a423fbf6231cba51235e1e51e6ec-132cf6c423e67123.elb.eu-central-1.amazonaws.com. 60 IN A ip1
    ac63a423fbf6231cba51235e1e51e6ec-132cf6c423e67123.elb.eu-central-1.amazonaws.com. 60 IN A ip2
    ac63a423fbf6231cba51235e1e51e6ec-132cf6c423e67123.elb.eu-central-1.amazonaws.com. 60 IN A ip3

    ...
    ~~~

    `ip1`, `ip2`, and `ip3` correspond to the 3 availability zones in the region where Network Load Balancers have been set up. You will need these IP addresses when configuring your network in the next step.

### Configure CoreDNS

Each Kubernetes cluster has a [CoreDNS](https://coredns.io/) service that responds to DNS requests for pods in its region. CoreDNS can also forward DNS requests to pods in other regions.

To enable traffic forwarding to CockroachDB pods in all 3 regions, you need to [modify the ConfigMap](https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/#coredns-configmap-options) for the CoreDNS Corefile in each region.

1. Download and open our ConfigMap template [`configmap.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/multiregion/eks/configmap.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/eks/configmap.yaml
    ~~~

1. After [obtaining the IP addresses of EKS instances](#set-up-load-balancing) in all 3 regions, you can use this information to define a **separate ConfigMap for each region**. Each unique ConfigMap lists the forwarding addresses for the pods in the 2 other regions.

    ~~~
    ...
       region2.svc.cluster.local:53 {       # <---- Modify
           log
           errors
           ready
           cache 10
           forward . ip1 ip2 ip3 {      # <---- Modify
                force_tcp
           }
       }
       region3.svc.cluster.local:53 {       # <---- Modify
           log
           errors
           ready
           cache 10
           forward . ip1 ip2 ip3 {      # <---- Modify
                force_tcp
           }
       }
    ~~~

    For each region, modify `configmap.yaml` by replacing:

    <ul><li><code>region2</code> and <code>region3</code> with the namespaces in which the CockroachDB pods will run in the other 2 regions. You defined these namespaces after <a href="#step-1-start-kubernetes-clusters">starting the Kubernetes clusters</a>.</li><li><code>ip1</code>, <code>ip2</code>, and <code>ip3</code> with the IP addresses of the Network Load Balancers in the region, which you looked up in the previous step.</li></ul>

    You will end up with 3 different ConfigMaps. Give each ConfigMap a unique filename like `configmap-1.yaml`.

    {{site.data.alerts.callout_info}}
    If you configure your Network Load Balancer to support UDP traffic, you can drop the `force_tcp` line.
    {{site.data.alerts.end}}

1. For each region, first back up the existing ConfigMap:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl -n kube-system get configmap coredns -o yaml > <configmap-backup-name>
    ~~~

    Then apply the new ConfigMap:

    {% include_cached copy-clipboard.html %}
    ~~~
    kubectl apply -f <configmap-name> --context <cluster-context>
    ~~~

1. For each region, check that your CoreDNS settings were applied:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get -n kube-system cm/coredns --export -o yaml --context <cluster-context>
    ~~~

### Exclude VPCs from SNAT

You will need to tell AWS to exclude your VPCs from [source network address translation (SNAT)](https://docs.aws.amazon.com/eks/latest/userguide/external-snat.html). This ensures that cross-VPC traffic is handled correctly by AWS while still allowing access to the public internet from the pods.

Set `AWS_VPC_K8S_CNI_EXCLUDE_SNAT_CIDRS` to recognize the values of your 3 CIDR blocks. Do this for all 3 regions:

{% include_cached copy-clipboard.html %}
~~~
kubectl set env ds aws-node -n kube-system AWS_VPC_K8S_CNI_EXCLUDE_SNAT_CIDRS="cidr1,cidr2,cidr3" --context <cluster-context>
~~~

Remember that these are the CIDR blocks you chose when [starting your Kubernetes clusters](#step-1-start-kubernetes-clusters). You can also get the IP range of a VPC by opening the [Amazon VPC console](https://console.aws.amazon.com/vpc/) and finding the VPC listed in the section called Your VPCs.

{{site.data.alerts.callout_info}}
If you plan to run your instances exclusively on private subnets, set the following environment variable instead on each region: <code style="white-space:pre-line">kubectl set env ds aws-node -n kube-system AWS_VPC_K8S_CNI_EXTERNALSNAT=true --context \<cluster-context\></code>
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="gke">
## Step 2. Start CockroachDB

1. Create a directory and download the required script and configuration files into it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir multiregion
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd multiregion
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -OOOOOOOOO \
    https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/{README.md,client-secure.yaml,cluster-init-secure.yaml,cockroachdb-statefulset-secure.yaml,dns-lb.yaml,example-app-secure.yaml,external-name-svc.yaml,setup.py,teardown.py}
    ~~~

2. Retrieve the `kubectl` "contexts" for your clusters:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl config get-contexts
    ~~~

    At the top of the `setup.py` script, fill in the `contexts` map with the zones of your clusters and their "context" names, e.g.:

    ~~~
    contexts = {
        'us-east1-b': 'gke_cockroach-shared_us-east1-b_cockroachdb1',
        'us-west1-a': 'gke_cockroach-shared_us-west1-a_cockroachdb2',
        'us-central1-a': 'gke_cockroach-shared_us-central1-a_cockroachdb3',
    }
    ~~~

3. In the `setup.py` script, fill in the `regions` map with the zones and corresponding regions of your clusters, for example:

    ~~~
    $ regions = {
        'us-east1-b': 'us-east1',
        'us-west1-a': 'us-west1',
        'us-central1-a': 'us-central1',
    }
    ~~~

    Setting `regions` is optional, but recommended, because it improves CockroachDB's ability to diversify data placement if you use more than one zone in the same region. If you aren't specifying regions, just leave the map empty.

4. If you haven't already, [install CockroachDB locally and add it to your `PATH`](install-cockroachdb.html). The `cockroach` binary will be used to generate certificates.

    If the `cockroach` binary is not on your `PATH`, in the `setup.py` script, set the `cockroach_path` variable to the path to the binary.

5. Optionally, to optimize your deployment for better performance, review [CockroachDB Performance on Kubernetes](kubernetes-performance.html) and make the desired modifications to the `cockroachdb-statefulset-secure.yaml` file.

6. Run the `setup.py` script:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python setup.py
    ~~~

    As the script creates various resources and creates and initializes the CockroachDB cluster, you'll see a lot of output, eventually ending with `job "cluster-init-secure" created`.

7. Confirm that the CockroachDB pods in each cluster say `1/1` in the `READY` column, indicating that they've successfully joined the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context <cluster-context-1>
    ~~~

    ~~~
    NAMESPACE    NAME            READY     STATUS    RESTARTS   AGE
    us-east1-b   cockroachdb-0   1/1       Running   0          14m
    us-east1-b   cockroachdb-1   1/1       Running   0          14m
    us-east1-b   cockroachdb-2   1/1       Running   0          14m    
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context <cluster-context-2>
    ~~~

    ~~~
    NAMESPACE       NAME            READY     STATUS    RESTARTS   AGE
    us-central1-a   cockroachdb-0   1/1       Running   0          14m
    us-central1-a   cockroachdb-1   1/1       Running   0          14m
    us-central1-a   cockroachdb-2   1/1       Running   0          14m
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context <cluster-context-3>
    ~~~

    ~~~
    NAMESPACE    NAME            READY     STATUS    RESTARTS   AGE
    us-west1-a   cockroachdb-0   1/1       Running   0          14m
    us-west1-a   cockroachdb-1   1/1       Running   0          14m
    us-west1-a   cockroachdb-2   1/1       Running   0          14m
    ~~~    

    If you notice that only one of the Kubernetes clusters' pods are marked as `READY`, you likely also need to configure a network firewall rule that will allow the pods in the different clusters to talk to each other. You can run the following command to create a firewall rule allowing traffic on port 26257 (the port used by CockroachDB for inter-node traffic) within your private GCE network. It will not allow any traffic in from outside your private network:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud compute firewall-rules create allow-cockroach-internal --allow=tcp:26257 --source-ranges=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
    ~~~

    ~~~
    Creating firewall...done.
    NAME                      NETWORK  DIRECTION  PRIORITY  ALLOW      DENY
    allow-cockroach-internal  default  INGRESS    1000      tcp:26257
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="eks">
## Step 3. Start CockroachDB

### Generate certificates

{{site.data.alerts.callout_info}}
The below steps use [`cockroach cert` commands](cockroach-cert.html) to quickly generate and sign the CockroachDB node and client certificates. Read our [Authentication](authentication.html#using-digital-certificates-with-cockroachdb) docs to learn about other methods of signing certificates.
{{site.data.alerts.end}}

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. For all 3 regions, upload the client certificate and key to the Kubernetes cluster as a secret.

    {{site.data.alerts.callout_success}}
    Specify the namespace in which the CockroachDB pods will run. You defined these namespaces after [starting your Kubernetes clusters](#step-1-start-kubernetes-clusters).
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs \
    --context <cluster-context-1> \
    --namespace <cluster-namespace-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs \
    --context <cluster-context-2> \
    --namespace <cluster-namespace-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs \
    --context <cluster-context-3> \
    --namespace <cluster-namespace-3>
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes in one region, substituting `<cluster-namespace>` in this command with the appropriate namespace:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost 127.0.0.1 \
    cockroachdb-public \
    cockroachdb-public.<cluster-namespace> \
    cockroachdb-public.<cluster-namespace>.svc.cluster.local \
    *.cockroachdb \
    *.cockroachdb.<cluster-namespace> \
    *.cockroachdb.<cluster-namespace>.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the node certificate and key to the Kubernetes cluster as a secret, specifying the appropriate context and namespace:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=certs
    --context <cluster-context> \
    --namespace <cluster-namespace>    
    ~~~

1. Repeat the previous 2 steps for your 2 remaining regions. You may need to delete the local `node.crt` and `node.key` in your `certs` directory before generating a new node certificate and key pair.

1. For all 3 regions, check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets --context <cluster-context>
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb-token-db5wp   kubernetes.io/service-account-token   3      1m
    cockroachdb.client.root   Opaque                                5      1m
    cockroachdb.node          Opaque                                6      1m
    default-token-65489       kubernetes.io/service-account-token   3      5m
    ~~~

### Create StatefulSets

1. Download and open our [multi-region StatefulSet configuration](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/multiregion/eks/cockroachdb-statefulset-secure-eks.yaml). You'll save three versions of this file locally, one for each set of 3 CockroachDB nodes per region.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/eks/cockroachdb-statefulset-secure-eks.yaml
    ~~~

    Look for **TODO** comments in the file. These highlight fields you need to define before deploying your StatefulSet.

1. Fill in the namespace where CockroachDB nodes will run in region 1.

    ~~~
    namespace: <cluster-namespace>
    ~~~

1. Allocate a memory request and limit to CockroachDB on each pod, using the `resources` object in the CockroachDB `containers` spec.

    {{site.data.alerts.callout_success}}
    These values should be appropriate for the instances that you have provisioned. Run `kubectl describe nodes` to see the available resources.
    {{site.data.alerts.end}}

    For example, to allocate 8Gi of memory to CockroachDB in each pod:

    ~~~
    resources:
      requests:
        memory: "8Gi"
      limits:
        memory: "8Gi"
    ~~~

    {{site.data.alerts.callout_danger}}
    If you do not specify a memory request, no memory will be allocated to CockroachDB. If you do not specify a memory limit, the Kubernetes scheduler will allocate the maximum possible amount.
    {{site.data.alerts.end}}

1. The StatefulSet configuration includes a [`cockroach start`](cockroach-start.html) command that creates the nodes on the Kubernetes pods.

    In the `--locality` flag, name `region` after region 1. This can technically be an arbitrary value, but it's simplest to use the CockroachDB namespace in region 1.

    ~~~
    --locality=region=<cluster-namespace-1>,az=$(cat /etc/cockroach-env/zone),dns=$(hostname -f)
    ~~~

    In the `--join` flag, update the Cockroach node addresses in all 3 regions with their corresponding namespaces.

    ~~~
    --join cockroachdb-0.cockroachdb.<cluster-namespace-1>,cockroachdb-1.cockroachdb.<cluster-namespace-1>,cockroachdb-2.cockroachdb.<cluster-namespace-1>,cockroachdb-0.cockroachdb.<cluster-namespace-2>,cockroachdb-1.cockroachdb.<cluster-namespace-2>,cockroachdb-2.cockroachdb.<cluster-namespace-2>,cockroachdb-0.cockroachdb.<cluster-namespace-3>,cockroachdb-1.cockroachdb.<cluster-namespace-3>,cockroachdb-2.cockroachdb.<cluster-namespace-3>
    ~~~

1. Save this StatefulSet configuration, giving it a filename like `cockroachdb-statefulset-secure-eks-1.yaml`.

1. Create and save a StatefulSet configuration for each of the other 2 regions in the same way, being sure to use the correct namespaces for those regions in steps 2 and 4.

1. Deploy the StatefulSets in each of your 3 regions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f <statefulset-1> --context <cluster-context-1> --namespace <cluster-namespace-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f <statefulset-2> --context <cluster-context-2> --namespace <cluster-namespace-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f <statefulset-3> --context <cluster-context-3> --namespace <cluster-namespace-3>
    ~~~

1. Run `cockroach init` on one of the pods to complete the node startup process and have them join together as a cluster:

    {% include_cached copy-clipboard.html %}
    ~~~
    kubectl exec \
    --context <cluster-context> \
    --namespace <cluster-namespace> \
    -it cockroachdb-0 \
    -- /cockroach/cockroach init \
    --certs-dir=/cockroach/cockroach-certs
    ~~~

    ~~~
    Cluster successfully initialized
    ~~~

1. Confirm that cluster initialization has completed successfully in each region. The job should be considered successful and the Kubernetes pods should soon be considered `Ready`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --context <cluster-context> --namespace <cluster-namespace>
    ~~~

    ~~~
    NAMESPACE      NAME           READY   STATUS    RESTARTS   AGE
    eu-central-1   cockroachdb-0  1/1     Running   0          12m
    eu-central-1   cockroachdb-1  1/1     Running   0          12m
    eu-central-1   cockroachdb-2  1/1     Running   0          12m
    ~~~
</section>

{{site.data.alerts.callout_success}}
In each Kubernetes cluster, the StatefulSet configuration sets all CockroachDB nodes to write to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname> --context <cluster-context> --namespace <cluster-namespace>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="gke">
## Step 3. Use the built-in SQL client

1. Use the `client-secure.yaml` file to launch a pod and keep it running indefinitely, specifying the context of the Kubernetes cluster to run it in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f client-secure.yaml --context <cluster-context>
    ~~~

    ~~~
    pod "cockroachdb-client-secure" created
    ~~~

    The pod uses the `root` client certificate created earlier by the `setup.py` script. Note that this will work from any of the three Kubernetes clusters as long as you use the correct namespace and context combination.
</section>

<section class="filter-content" markdown="1" data-scope="eks">
## Step 4. Use the built-in SQL client

1. Use the `client-secure.yaml` file to launch a pod and keep it running indefinitely, specifying the context of the Kubernetes cluster and namespace of the CockroachDB pods to run it in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/client-secure.yaml --context <cluster-context> --namespace <cluster-namespace>
    ~~~

    ~~~
    pod "cockroachdb-client-secure" created
    ~~~

    The pod uses the `root` client certificate you [generated earlier](#generate-certificates). Note that this will work from any of the three Kubernetes clusters as long as you use the correct namespace and context combination.
</section>

1. Get a shell into the pod and start the CockroachDB [built-in SQL client](cockroach-sql.html), again specifying the namespace and context of the Kubernetes cluster where the pod is running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure --context <cluster-context> --namespace <cluster-namespace> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
    ~~~

    ~~~
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    #
    # Server version: CockroachDB CCL v2.0.5 (x86_64-unknown-linux-gnu, built 2018/08/13 17:59:42, go1.10) (same version as client)
    # Cluster ID: 99346e82-9817-4f62-b79b-fdd5d57f8bda
    #
    # Enter \? for a brief introduction.
    #
    warning: no current database set. Use SET database = <dbname> to change, CREATE DATABASE to make a new database.
    root@cockroachdb-public:26257/>
    ~~~

1. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
    +----+---------+
    | id | balance |
    +----+---------+
    |  1 |  1000.5 |
    +----+---------+
    (1 row)
    ~~~

1. [Create a user with a password](create-user.html#create-a-user-with-a-password):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ~~~

      You will need this username and password to access the DB Console in the next step.

1. Exit the SQL shell and pod:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

    The pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other [`cockroach` client commands](cockroach-commands.html) (e.g., `cockroach node`), repeat step 2 using the appropriate command.

    If you'd prefer to delete the pod and recreate it when needed, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure --context <cluster-context>
    ~~~

<section class="filter-content" markdown="1" data-scope="gke">
## Step 4. Access the DB Console
</section>

<section class="filter-content" markdown="1" data-scope="eks">
## Step 5. Access the DB Console
</section>

To access the cluster's [DB Console](ui-overview.html):

1. On secure clusters, [certain pages of the DB Console](ui-overview.html#access-the-db-console) can only be accessed by `admin` users.

    Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure --context <cluster-context> --namespace <cluster-namespace> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
    ~~~

1.  Assign `roach` to the `admin` role (you only need to do this once):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT admin TO roach;
    ~~~

1. Exit the SQL shell and pod:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

1. Port-forward from your local machine to a pod in one of your Kubernetes clusters:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080 --context <cluster-context> --namespace <cluster-namespace>
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

    {{site.data.alerts.callout_info}}
    The `port-forward` command must be run on the same machine as the web browser in which you want to view the DB Console. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring `kubectl` locally and running the above `port-forward` command on your local machine.
    {{site.data.alerts.end}}

1. Go to <a href="https://localhost:8080/" data-proofer-ignore>https://localhost:8080</a> and log in with the username and password created in the [Use the built-in SQL client](#step-3-use-the-built-in-sql-client) step.

1. In the UI, check the [**Node List**](ui-cluster-overview-page.html#node-list) to verify that all nodes are running, open the [**Databases** page](ui-databases-page.html) to verify that `bank` is listed, and open the [**Network Latency** page](ui-network-latency-page.html) to see the performance of your CockroachDB cluster across 3 regions.

<section class="filter-content" markdown="1" data-scope="gke">
## Step 5. Simulate datacenter failure
</section>

<section class="filter-content" markdown="1" data-scope="eks">
## Step 6. Simulate datacenter failure
</section>

One of the major benefits of running a multi-region CockroachDB cluster is that an entire datacenter or region can go down without affecting the availability of the cluster as a whole.

To see this in action:

1. Scale down one of the StatefulSets to zero pods, specifying the namespace and context of the Kubernetes cluster where it's running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=0 --context <cluster-context> --namespace <cluster-namespace>
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

1. In the DB Console, the **Cluster Overview** will soon show the three nodes from that region as **Suspect**. If you wait for 5 minutes or more, they will be listed as **Dead**. Note that even though there are three dead nodes, the other nodes are all healthy, and any clients using the database in the other regions will continue to work just fine.

1. When you're done verifying that the cluster still fully functions with one of the regions down, you can bring the region back up by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=3 --context <cluster-context> --namespace <cluster-namespace>
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

<section class="filter-content" markdown="1" data-scope="gke">
## Step 6. Maintain the cluster
</section>

<section class="filter-content" markdown="1" data-scope="eks">
## Step 7. Maintain the cluster
</section>

- [Scale the cluster](#scale-the-cluster)
- [Upgrade the cluster](#upgrade-the-cluster)
- [Stop the cluster](#stop-the-cluster)

### Scale the cluster

Each of your Kubernetes clusters contains 3 instances that can run CockroachDB pods. It's easy to scale a cluster to run more pods. To ensure that you do not have two CockroachDB pods on the same instance (as recommended in our [production best practices](recommended-production-settings.html)), you need to first add a new instance and then edit your StatefulSet configuration to add another pod.

<section class="filter-content" markdown="1" data-scope="gke">
1. [Resize your Kubernetes cluster.](https://cloud.google.com/kubernetes-engine/docs/how-to/resizing-a-cluster)
</section>

<section class="filter-content" markdown="1" data-scope="eks">
1. [Resize your Kubernetes cluster.](https://eksctl.io/usage/managing-nodegroups/#scaling)
</section>

1. Use the `kubectl scale` command to add a pod to the StatefulSet in the Kubernetes cluster where you want to add a CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4 --context <cluster-context> --namespace <cluster-namespace>
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

1. Verify that a fourth pod was added successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --context <cluster-context> --namespace <cluster-namespace>
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          1h
    cockroachdb-1               1/1       Running   0          1h
    cockroachdb-2               1/1       Running   0          7m
    cockroachdb-3               1/1       Running   0          44s
    cockroachdb-client-secure   1/1       Running   0          26m
    ~~~

### Upgrade the cluster

We strongly recommend that you regularly upgrade your CockroachDB version in order to pick up bug fixes, performance improvements, and new features.

The upgrade process on Kubernetes is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) in which the Docker image is applied to the pods one at a time, with each pod being stopped and restarted in turn. This is to ensure that the cluster remains available during the upgrade.

1. Verify that you can upgrade.

    To upgrade to a new major version, you must first be on a production release of the previous version. The release does not need to be the latest production release of the previous version, but it must be a production [release](../releases/index.html) and not a testing release (alpha/beta).

    Therefore, in order to upgrade to v21.1, you must be on a production release of v20.2.

    1. If you are upgrading to v21.1 from a production release earlier than v20.2, or from a testing release (alpha/beta), first [upgrade to a production release of v20.2](../v20.2/orchestrate-cockroachdb-with-kubernetes-multi-cluster.html#upgrade-the-cluster). Be sure to complete all the steps.

    1. Then return to this page and perform a second upgrade to v21.1.

    1. If you are upgrading from any production release of v20.2, or from any earlier v21.1 release, you do not have to go through intermediate releases; continue to step 2.

1. Verify the overall health of your cluster using the [DB Console](ui-overview.html). On the **Overview**:
    - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or decommission them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).
    - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.
    - In the **Node List**:
        - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
        - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](#scale-the-cluster) to your cluster before beginning your upgrade.

1. Review the [backward-incompatible changes in v21.1](../releases/v21.1.html#v21-1-0-backward-incompatible-changes) and [deprecated features](../releases/v21.1.html#v21-1-0-deprecations). If any affect your deployment, make the necessary changes before starting the rolling upgrade to v21.1.

1. Decide how the upgrade will be finalized.

    By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in v21.2](upgrade-cockroach-version.html#features-that-require-upgrade-finalization). After finalization, however, it will no longer be possible to perform a downgrade to v21.1. In the event of a catastrophic failure or corruption, the only option is to start a new cluster using the old binary and then restore from a [backup](take-full-and-incremental-backups.html) created prior to the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in a later step.

    {{site.data.alerts.callout_info}}
    Finalization only applies when performing a major version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) can always be downgraded.
    {{site.data.alerts.end}}

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure --context <cluster-context> --namespace <cluster-namespace> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
        ~~~

    2. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > SET CLUSTER SETTING cluster.preserve_downgrade_option = '20.2';
        ~~~

2. For each Kubernetes cluster, kick off the upgrade process by changing the desired Docker image. To do so, pick the version that you want to upgrade to, then run the following command, replacing "VERSION" with your desired new version and specifying the relevant namespace and "context" name for the Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb --namespace <namespace-of-kubernetes-cluster1> --context <cluster-context-1> --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb --namespace <namespace-of-kubernetes-cluster2> --context <cluster-context-2> --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb --namespace <namespace-of-kubernetes-cluster3> --context <cluster-context-3> --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

3. If you then check the status of the pods in each Kubernetes cluster, you should see one of them being restarted:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context <cluster-context-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context <cluster-context-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context <cluster-context-3>
    ~~~

    This will continue until all of the pods have restarted and are running the new image.

4. If you disabled auto-finalization earlier, monitor the stability and performance of your cluster until you are comfortable with the upgrade (generally at least a day).

    If you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

    {{site.data.alerts.callout_info}}
    This is only possible when performing a major version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) are auto-finalized.
    {{site.data.alerts.end}}

    To finalize the upgrade, re-enable auto-finalization:

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure --context <cluster-context> --namespace <cluster-namespace> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
        ~~~

    2. Re-enable auto-finalization:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

### Stop the cluster

<section class="filter-content" markdown="1" data-scope="gke">
1. To delete all of the resources created in your clusters, copy the `contexts` map from `setup.py` into `teardown.py`, and then run `teardown.py`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python teardown.py
    ~~~

    ~~~
    namespace "us-east1-b" deleted
    service "kube-dns-lb" deleted
    configmap "kube-dns" deleted
    pod "kube-dns-5dcfcbf5fb-l4xwt" deleted
    pod "kube-dns-5dcfcbf5fb-tddp2" deleted
    namespace "us-west1-a" deleted
    service "kube-dns-lb" deleted
    configmap "kube-dns" deleted
    pod "kube-dns-5dcfcbf5fb-8csc9" deleted
    pod "kube-dns-5dcfcbf5fb-zlzn7" deleted
    namespace "us-central1-a" deleted
    service "kube-dns-lb" deleted
    configmap "kube-dns" deleted
    pod "kube-dns-5dcfcbf5fb-6ngmw" deleted
    pod "kube-dns-5dcfcbf5fb-lcfxd" deleted
    ~~~

2. Stop each Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb1 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb1...done.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb2 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb2...done.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb3 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb3...done.
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="eks">
1. In each region, delete all of the resources associated with the `cockroachdb` label, including the logs, and remote persistent volumes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount -l app=cockroachdb --context <cluster-context-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount -l app=cockroachdb --context <cluster-context-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount -l app=cockroachdb --context <cluster-context-3>
    ~~~

    ~~~
    pod "cockroachdb-0" deleted
    pod "cockroachdb-1" deleted
    pod "cockroachdb-2" deleted
    service "cockroachdb" deleted
    service "cockroachdb-public" deleted
    persistentvolumeclaim "datadir-cockroachdb-0" deleted
    persistentvolumeclaim "datadir-cockroachdb-1" deleted
    persistentvolumeclaim "datadir-cockroachdb-2" deleted
    poddisruptionbudget.policy "cockroachdb-budget" deleted
    rolebinding.rbac.authorization.k8s.io "cockroachdb" deleted
    clusterrolebinding.rbac.authorization.k8s.io "cockroachdb" deleted
    role.rbac.authorization.k8s.io "cockroachdb" deleted
    clusterrole.rbac.authorization.k8s.io "cockroachdb" deleted
    serviceaccount "cockroachdb" deleted
    ~~~

1. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure --context <cluster-context>
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

1. Get the names of the secrets you created on each cluster. These should be identical in all 3 regions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets --context <cluster-context>
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                5      1d
    cockroachdb.node          Opaque                                6      1d
    ...
    ~~~

1. Delete the secrets that you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secrets cockroachdb.client.root cockroachdb.node  --context <cluster-context-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secrets cockroachdb.client.root cockroachdb.node  --context <cluster-context-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secrets cockroachdb.client.root cockroachdb.node  --context <cluster-context-3>
    ~~~

1. Stop Kubernetes in each region:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl delete cluster --name cockroachdb1 --region <aws-region-1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl delete cluster --name cockroachdb2 --region <aws-region-2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl delete cluster --name cockroachdb3 --region <aws-region-3>
    ~~~

1. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) to verify that the stacks were successfully deleted in each region.

{{site.data.alerts.callout_danger}}
If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
{{site.data.alerts.end}}
</section>

## See also

- [Kubernetes Single-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
