---
title: Deploy a Local Cluster with Kubernetes
summary: Deploy a local 3-node CockroachDB cluster with Kubernetes.
toc: true
secure: true
docs_area: deploy
---

{% include {{ page.version.version }}/filter-tabs/crdb-kubernetes.md %}

On top of CockroachDB's built-in automation, you can use a third-party [orchestration](kubernetes-overview.html) system to simplify and automate even more of your operations, from deployment to scaling to overall cluster management.

This page demonstrates a basic integration with the open-source [Kubernetes](http://kubernetes.io/) orchestration system. Using either the CockroachDB [Helm](https://helm.sh/) chart or a few configuration files, you'll quickly create a 3-node local cluster. You'll run some SQL commands against the cluster and then simulate node failure, watching how Kubernetes auto-restarts without the need for any manual intervention. You'll then scale the cluster with a single command before shutting the cluster down, again with a single command.

{{site.data.alerts.callout_info}}
To orchestrate a physically distributed cluster in production, see [Orchestrated Deployments](kubernetes-overview.html). To deploy a 30-day free {{ site.data.products.dedicated }} cluster instead of running CockroachDB yourself, see the [Quickstart](../cockroachcloud/quickstart.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/local-start-kubernetes.md %}

## Step 2. Start CockroachDB

Choose a way to deploy and maintain the CockroachDB cluster:

- [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator) (recommended)
- [Helm](https://helm.sh/) package manager
- Manually apply our StatefulSet configuration and related files

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Use Operator</button>
    <button class="filter-button" data-scope="helm">Use Helm</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-operator-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-helm-secure.md %}
</section>

## Step 3. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-secure.md %}

## Step 4. Access the DB Console

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 5. Stop the cluster

- **If you plan to restart the cluster**, use the `minikube stop` command. This shuts down the minikube virtual machine but preserves all the resources you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ minikube stop
    ~~~

    ~~~
    Stopping local Kubernetes cluster...
    Machine stopped.
    ~~~

    You can restore the cluster to its previous state with `minikube start`.

- **If you do not plan to restart the cluster**, use the `minikube delete` command. This shuts down and deletes the minikube virtual machine and all the resources you created, including persistent volumes:

    {% include_cached copy-clipboard.html %}
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

You might also want to learn how to [orchestrate a production deployment of CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html).
