---
title: Cluster upgrades
summary: How to upgrade a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

{% assign previous_version = site.data.versions | where_exp: "previous_version", "previous_version.major_version == page.version.version" | first | map: "previous_version" %}

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB on a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html).
{{site.data.alerts.end}}

We strongly recommend that you regularly upgrade your CockroachDB version in order to pick up bug fixes, performance improvements, and new features.

The upgrade process on Kubernetes is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) in which the Docker image is applied to the pods one at a time, with each pod being stopped and restarted in turn. This is to ensure that the cluster remains available during the upgrade.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Operator</button>
    <button class="filter-button" data-scope="manual">Manual Configs</button>
    <button class="filter-button" data-scope="helm">Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}

{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}

1. Verify that you can upgrade.

    To upgrade to a new major version, you must first be on a production release of the previous version. The release does not need to be the latest production release of the previous version, but it must be a production [release](../releases/index.html) and not a testing release (alpha/beta).

    Therefore, in order to upgrade to {{ page.version.version }}, you must be on a production release of {{ previous_version }}.

    1. If you are upgrading to {{ page.version.version }} from a production release earlier than {{ previous_version }}, or from a testing release (alpha/beta), first [upgrade to a production release of {{ previous_version }}](../v21.1/operate-cockroachdb-kubernetes.html#upgrade-the-cluster). Be sure to complete all the steps.

    1. Then return to this page and perform a second upgrade to {{ page.version.version }}.

    1. If you are upgrading from a production release of {{ previous_version }}, or from any earlier {{ page.version.version }} patch release, you do not have to go through intermediate releases; continue to step 2.

1. Verify the overall health of your cluster using the [DB Console](ui-overview.html). On the **Overview**:
    - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](scale-cockroachdb-kubernetes.html#remove-nodes) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).
    - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to [identify and resolve the cause of range under-replication and/or unavailability](cluster-setup-troubleshooting.html#replication-issues) before beginning your upgrade.
    - In the **Node List**:
        - Make sure all nodes are on the same version. If not all nodes are on the same version, upgrade them to the cluster's highest current version first, and then start this process over.
        - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](scale-cockroachdb-kubernetes.html#add-nodes) to your cluster before beginning your upgrade.

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | first %}

1. Review the [backward-incompatible changes in {{ page.version.version }}](../releases/{{ page.version.version }}.html{% unless rd.release_date == "N/A" or rd.release_date > today %}#{{ page.version.version | replace: ".", "-" }}-0-backward-incompatible-changes{% endunless %}) and [deprecated features](../releases/{{ page.version.version }}.html#{% unless rd.release_date == "N/A" or rd.release_date > today %}{{ page.version.version | replace: ".", "-" }}-0-deprecations{% endunless %}). If any affect your deployment, make the necessary changes before starting the rolling upgrade to {{ page.version.version }}.


1. Change the desired Docker image in the custom resource:

    ~~~
    image:
      name: cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

    The Operator will perform the staged update.

    {{site.data.alerts.callout_info}}
    The Operator automatically sets the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html) to the version you are upgrading from. This disables auto-finalization of the upgrade so that you can monitor the stability and performance of the upgraded cluster before manually finalizing the upgrade. This will enable certain [features and performance improvements introduced in {{ page.version.version }}](upgrade-cockroach-version.html#features-that-require-upgrade-finalization).

    Note that after finalization, it will no longer be possible to perform a downgrade to {{ previous_version }}. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the previous binary and then restore from a [backup](take-full-and-incremental-backups.html) created prior to performing the upgrade.

    Finalization only applies when performing a major version upgrade (for example, from {{ previous_version }}.x to {{ page.version.version }}). Patch version upgrades (for example, within the {{ page.version.version }}.x series) can always be downgraded.
    {{site.data.alerts.end}}

1. To check the status of the rolling upgrade, run `kubectl get pods`. The pods are restarted one at a time with the new image.

1. Verify that all pods have been upgraded by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console](ui-cluster-overview-page.html#node-details).

1. Monitor the stability and performance of your cluster until you are comfortable with the upgrade (generally at least a day).

    If you decide to roll back the upgrade, revert the image name in the custom resource and apply the new value.

    {{site.data.alerts.callout_info}}
    This is only possible when performing a major version upgrade (for example, from {{ previous_version }}.x to {{ page.version.version }}). Patch version upgrades (for example, within the {{ page.version.version }}.x series) are auto-finalized.
    {{site.data.alerts.end}}

    To finalize the upgrade, re-enable auto-finalization:

    1. Start the CockroachDB [built-in SQL client](cockroach-sql.html). For example, if you followed the steps in [Deploy CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html#step-3-use-the-built-in-sql-client) to launch a secure client pod, get a shell into the `cockroachdb-client-secure` pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \-- ./cockroach sql \
        --certs-dir=/cockroach/cockroach-certs \
        --host={cluster-name}-public
        ~~~

    1. Re-enable auto-finalization:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

    1. Exit the SQL shell and pod:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~

</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster-helm.md %}
</section>
