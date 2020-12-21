Choose whether you want to orchestrate CockroachDB with Kubernetes using the hosted Google Kubernetes Engine (GKE)  service, the hosted Amazon Elastic Kubernetes Service (EKS), or manually on Google Compute Engine (GCE) or AWS. The instructions below will change slightly depending on your choice.

- [Hosted GKE](#hosted-gke)
- [Hosted EKS](#hosted-eks)
- [Manual GCE](#manual-gce)
- [Manual AWS](#manual-aws)

### Hosted GKE

1. Complete the **Before You Begin** steps described in the [Google Kubernetes Engine Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Kubernetes Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    {{site.data.alerts.callout_success}}The documentation offers the choice of using Google's Cloud Shell product or using a local shell on your machine. Choose to use a local shell if you want to be able to view the DB Console using the steps in this guide.{{site.data.alerts.end}}

2. From your local workstation, start the Kubernetes cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb --machine-type n1-standard-4
    ~~~

    ~~~
    Creating cluster cockroachdb...done.
    ~~~

    This creates GKE instances and joins them into a single Kubernetes cluster named `cockroachdb`. The `--machine-type` flag tells the node pool to use the [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 15 GB memory), which meets our [recommended CPU and memory configuration](recommended-production-settings.html#basic-hardware-recommendations).

    The process can take a few minutes, so do not move on to the next step until you see a `Creating cluster cockroachdb...done` message and details about your cluster.

3. Get the email address associated with your Google Cloud account:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud info | grep Account
    ~~~

    ~~~
    Account: [your.google.cloud.email@example.org]
    ~~~

    {{site.data.alerts.callout_danger}}
    This command returns your email address in all lowercase. However, in the next step, you must enter the address using the accurate capitalization. For example, if your address is YourName@example.com, you must use YourName@example.com and not yourname@example.com.
    {{site.data.alerts.end}}

4. [Create the RBAC roles](https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control#prerequisites_for_using_role-based_access_control) CockroachDB needs for running on GKE, using the address from the previous step:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding \
    --clusterrole=cluster-admin \
    --user=<your.google.cloud.email@example.org>
    ~~~

    ~~~
    clusterrolebinding.rbac.authorization.k8s.io/your.username-cluster-admin-binding created
    ~~~

### Hosted EKS

1. Complete the steps described in the [EKS Getting Started](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) documentation.

    This includes installing and configuring the AWS CLI and `eksctl`, which is the command-line tool used to create and delete Kubernetes clusters on EKS, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

2. From your local workstation, start the Kubernetes cluster:

    {{site.data.alerts.callout_success}}
    To ensure that all 3 nodes can be placed into a different availability zone, you may want to first [confirm that at least 3 zones are available in the region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#availability-zones-describe) for your account.
    {{site.data.alerts.end}}
    
    {% include copy-clipboard.html %}
    ~~~ shell
    $ eksctl create cluster \
    --name cockroachdb \
    --nodegroup-name standard-workers \
    --node-type m5.xlarge \
    --nodes 3 \
    --nodes-min 1 \
    --nodes-max 4 \
    --node-ami auto
    ~~~

    This creates EKS instances and joins them into a single Kubernetes cluster named `cockroachdb`. The `--node-type` flag tells the node pool to use the [`m5.xlarge`](https://aws.amazon.com/ec2/instance-types/) instance type (4 vCPUs, 16 GB memory), which meets our [recommended CPU and memory configuration](recommended-production-settings.html#basic-hardware-recommendations).

    Cluster provisioning usually takes between 10 and 15 minutes. Do not move on to the next step until you see a message like `[✔]  EKS cluster "cockroachdb" in "us-east-1" region is ready` and details about your cluster.

3. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) to verify that the stacks `eksctl-cockroachdb-cluster` and `eksctl-cockroachdb-nodegroup-standard-workers` were successfully created. Be sure that your region is selected in the console.

### Manual GCE

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the [Running Kubernetes on Google Compute Engine](https://kubernetes.io/docs/setup/turnkey/gce/) documentation.

The process includes:

- Creating a Google Cloud Platform account, installing `gcloud`, and other prerequisites.
- Downloading and installing the latest Kubernetes release.
- Creating GCE instances and joining them into a single Kubernetes cluster.
- Installing `kubectl`, the command-line tool used to manage Kubernetes from your workstation.

### Manual AWS

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the [Running Kubernetes on AWS EC2](https://kubernetes.io/docs/setup/turnkey/aws/) documentation.
