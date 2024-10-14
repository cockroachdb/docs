## Step 1. Start Kubernetes

1. Follow the Kubernetes [documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install the latest release of `minikube`, a tool you can use to run Kubernetes on a workstation. `minikube` includes installing a hypervisor and `kubectl`, the command-line tool used to manage Kubernetes.

1. Start a local Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ minikube start
    ~~~
