## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology:

Feature | Description
--------|------------
[minikube](http://kubernetes.io/docs/getting-started-guides/minikube/) | This is the tool you'll use to run a Kubernetes cluster inside a VM on your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, all pods will run on your local workstation, each containing one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of storage mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>When using `minikube`, persistent volumes are external temporary directories that endure until they are manually deleted or until the entire Kubernetes cluster is deleted.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When pods are created (one per CockroachDB node), each pod will request a persistent volume claim to “claim” durable storage for its node.

## Step 1. Start Kubernetes

1. Follow Kubernetes' [documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install `minikube`, the tool used to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to manage Kubernetes from your local workstation.

    {{site.data.alerts.callout_info}}Make sure you install <code>minikube</code> version 0.21.0 or later. Earlier versions do not include a Kubernetes server that supports the <code>maxUnavailability</code> field and <code>PodDisruptionBudget</code> resource type used in the CockroachDB StatefulSet configuration.{{site.data.alerts.end}}

2. Start a local Kubernetes cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ minikube start
    ~~~
