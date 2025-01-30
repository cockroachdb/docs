---
title: Orchestration with Kubernetes (Insecure)
summary: Orchestrate the deployment and management of a local cluster using Kubernetes.
toc: true
docs_area: deploy
---


On top of CockroachDB's built-in automation, you can use a third-party [orchestration]({{ page.version.version }}/kubernetes-overview.md) system to simplify and automate even more of your operations, from deployment to scaling to overall cluster management.

This page demonstrates a basic integration with the open-source [Kubernetes](http://kubernetes.io/) orchestration system. Using either the CockroachDB [Helm](https://helm.sh/) chart or a few configuration files, you'll quickly create a 3-node local cluster. You'll run some SQL commands against the cluster and then simulate node failure, watching how Kubernetes auto-restarts without the need for any manual intervention. You'll then scale the cluster with a single command before shutting the cluster down, again with a single command.

{{site.data.alerts.callout_info}}
To orchestrate a physically distributed cluster in production, see [Orchestrated Deployments]({{ page.version.version }}/kubernetes-overview.md). To deploy a 30-day free CockroachDB {{ site.data.products.dedicated }} cluster instead of running CockroachDB yourself, see the [Quickstart](quickstart.md).
{{site.data.alerts.end}}

## Best practices



## Step 2. Start CockroachDB

To start your CockroachDB cluster, you can either use our StatefulSet configuration and related files directly, or you can use the [Helm](https://helm.sh/) package manager for Kubernetes to simplify the process.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="helm">Use Helm</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
</div>

<section class="filter-content" markdown="1" data-scope="manual">
</section>

<section class="filter-content" markdown="1" data-scope="helm">
</section>

## Step 3. Use the built-in SQL client


## Step 4. Access the DB Console


## Step 5. Simulate node failure


## Step 6. Add nodes

1. Use the `kubectl scale` command to add a pod for another CockroachDB node:

    <section class="filter-content" markdown="1" data-scope="manual">

    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="helm">

    ~~~ shell
    $ kubectl scale statefulset my-release-cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "my-release-cockroachdb" scaled
    ~~~

    </section>

1. Verify that the pod for a fourth node, `cockroachdb-3`, was added successfully:

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


## Step 8. Stop the cluster

- **If you plan to restart the cluster**, use the `minikube stop` command. This shuts down the minikube virtual machine but preserves all the resources you created:

    ~~~ shell
    $ minikube stop
    ~~~

    ~~~
    Stopping local Kubernetes cluster...
    Machine stopped.
    ~~~

    You can restore the cluster to its previous state with `minikube start`.

- **If you do not plan to restart the cluster**, use the `minikube delete` command. This shuts down and deletes the minikube virtual machine and all the resources you created, including persistent volumes:

    ~~~ shell
    $ minikube delete
    ~~~

    ~~~
    Deleting local Kubernetes cluster...
    Machine deleted.
    ~~~

    {{site.data.alerts.callout_success}}To retain logs, copy them from each pod's <code>stderr</code> before deleting the cluster and all its resources. To access a pod's standard error stream, run <code>kubectl logs &lt;podname&gt;</code>.{{site.data.alerts.end}}

## See also

Explore other CockroachDB benefits and features:


You might also want to learn how to [orchestrate a production deployment of CockroachDB with Kubernetes]({{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md).