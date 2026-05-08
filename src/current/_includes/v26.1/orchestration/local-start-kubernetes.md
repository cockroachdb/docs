## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology:

Feature | Description
--------|------------
[minikube](http://kubernetes.io/docs/getting-started-guides/minikube/) | A tool commonly used to run a Kubernetes cluster on a local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more containers managed by Kubernetes. In this tutorial, all pods run on your local workstation. Each pod contains a single container that runs a single-node CockroachDB cluster. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is storage mounted in a pod and available to its containers. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br /><br />When using `minikube`, persistent volumes are external temporary directories that endure until they are manually deleted or until the entire Kubernetes cluster is deleted.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When e pod is created, it requests a persistent volume claim to claim durable storage for its node.

## Step 1. Start Kubernetes

1. Follow the [Minikube documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install the latest version of `minikube`, a hypervisor, and the `kubectl` command-line tool.

1. Start a local Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    minikube start
    ~~~
