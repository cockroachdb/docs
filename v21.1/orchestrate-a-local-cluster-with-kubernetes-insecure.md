---
title: Orchestration with Kubernetes (Insecure)
summary: Orchestrate the deployment and management of a local cluster using Kubernetes.
toc: true
---

<div class="filters filters-big clearfix">
  <a href="orchestrate-a-local-cluster-with-kubernetes.html"><button class="filter-button">Secure</button></a>
  <button class="filter-button current"><strong>Insecure</strong></button>
</div>

On top of CockroachDB's built-in automation, you can use a third-party [orchestration](orchestration.html) system to simplify and automate even more of your operations, from deployment to scaling to overall cluster management.

This page walks you through a simple demonstration, using the open-source [Kubernetes](http://kubernetes.io/) orchestration system. Using either the CockroachDB [Helm](https://helm.sh/) chart or a few configuration files, you'll quickly create a 3-node local cluster. You'll run some SQL commands against the cluster and then simulate node failure, watching how Kubernetes auto-restarts without the need for any manual intervention. You'll then scale the cluster with a single command before shutting the cluster down, again with a single command.

{{site.data.alerts.callout_info}}
To orchestrate a physically distributed cluster in production, see [Orchestrated Deployments](orchestration.html). To deploy a 30-day free CockroachCloud cluster instead of running CockroachDB yourself, see the [Quickstart](../cockroachcloud/quickstart.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/local-start-kubernetes.md %}

## Step 2. Start CockroachDB

To start your CockroachDB cluster, you can either use our StatefulSet configuration and related files directly, or you can use the [Helm](https://helm.sh/) package manager for Kubernetes to simplify the process.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="helm">Use Helm</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
</div>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-local-insecure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-local-helm-insecure.md %}
</section>

## Step 3. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-insecure.md %}

## Step 4. Access the DB Console

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 5. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 6. Add nodes

1. Use the `kubectl scale` command to add a pod for another CockroachDB node:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset my-release-cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "my-release-cockroachdb" scaled
    ~~~
    </section>

2. Verify that the pod for a fourth node, `cockroachdb-3`, was added successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~
    NAME                      READY     STATUS    RESTARTS   AGE
    cockroachdb-0             1/1       Running   0          28m
    cockroachdb-1             1/1       Running   0          27m
    cockroachdb-2             1/1       Running   0          10m
    cockroachdb-3             1/1       Running   0          5s
    example-545f866f5-2gsrs   1/1       Running   0          25m
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    NAME                                 READY     STATUS    RESTARTS   AGE
    my-release-cockroachdb-0             1/1       Running   0          28m
    my-release-cockroachdb-1             1/1       Running   0          27m
    my-release-cockroachdb-2             1/1       Running   0          10m
    my-release-cockroachdb-3             1/1       Running   0          5s
    example-545f866f5-2gsrs              1/1       Running   0          25m
    ~~~
    </section>

## Step 7. Remove nodes

{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-insecure.md %}

## Step 8. Stop the cluster

- **If you plan to restart the cluster**, use the `minikube stop` command. This shuts down the minikube virtual machine but preserves all the resources you created:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ minikube stop
    ~~~

    ~~~
    Stopping local Kubernetes cluster...
    Machine stopped.
    ~~~

    You can restore the cluster to its previous state with `minikube start`.

- **If you do not plan to restart the cluster**, use the `minikube delete` command. This shuts down and deletes the minikube virtual machine and all the resources you created, including persistent volumes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ minikube delete
    ~~~

    ~~~
    Deleting local Kubernetes cluster...
    Machine deleted.
    ~~~

    {{site.data.alerts.callout_success}}To retain logs, copy them from each pod's <code>stderr</code> before deleting the cluster and all its resources. To access a pod's standard error stream, run <code>kubectl logs &lt;podname&gt;</code>.{{site.data.alerts.end}}

## See also

Explore other core CockroachDB benefits and features:

{% include {{ page.version.version }}/misc/explore-benefits-see-also.md %}

You might also want to learn how to [orchestrate a production deployment of CockroachDB with Kubernetes](orchestrate-cockroachdb-with-kubernetes.html).
