---
title: Resource management
summary: Allocate CPU, memory, and storage resources for a secure 3-node CockroachDB cluster on Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page explains how to configure Kubernetes cluster resources such as memory, CPU, and storage. 

These settings override the defaults used when [deploying CockroachDB on Kubernetes](deploy-cockroachdb-with-kubernetes.html).

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
</section>

On a production cluster, the resources you allocate to CockroachDB should be proportionate to your machine types and workload. We recommend that you determine and set these values before deploying the cluster, but you can also update the values on a running cluster.

{{site.data.alerts.callout_success}}
Run `kubectl describe nodes` to see the available resources on the instances that you have provisioned.
{{site.data.alerts.end}}

## Memory and CPU

You can set the CPU and memory resources allocated to the CockroachDB container on each pod. 

{{site.data.alerts.callout_info}}
1 CPU in Kubernetes is equivalent to 1 vCPU or 1 hyperthread. For best practices on provisioning CPU and memory for CockroachDB, see the [Production Checklist](recommended-production-settings.html#hardware).
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
Specify CPU and memory values in `resources.requests` and `resources.limits` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

~~~ yaml
spec:
  resources:
    requests:
      cpu: "4"
      memory: "16Gi"
    limits:
      cpu: "4"
      memory: "16Gi"
~~~

{% include {{ page.version.version }}/orchestration/apply-custom-resource.md %}
</section>

<section class="filter-content" markdown="1" data-scope="manual">
Specify CPU and memory values in `resources.requests` and `resources.limits` in the StatefulSet manifest you used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html?filters=manual#configure-the-cluster):

~~~ yaml
spec:
  template:
    containers:
    - name: cockroachdb
      resources:
        requests:
          cpu: "4"
          memory: "16Gi"
        limits:
          cpu: "4"
          memory: "16Gi"
~~~

{% include {{ page.version.version }}/orchestration/apply-statefulset-manifest.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
Specify CPU and memory values in `resources.requests` and `resources.limits` in the custom values file you created when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb):

~~~ yaml
statefulset:
  resources:
    limits:
      cpu: "4"
      memory: "16Gi"
    requests:
      cpu: "4"
      memory: "16Gi"
~~~

{% include {{ page.version.version }}/orchestration/apply-helm-values.md %}
</section>

We recommend using identical values for `resources.requests` and `resources.limits`. When setting the new values, note that not all of a pod's resources will be available to the CockroachDB container. This is because a fraction of the CPU and memory is reserved for Kubernetes.

{{site.data.alerts.callout_info}}
If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
{{site.data.alerts.end}}

For more information on how Kubernetes handles resources, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

<section class="filter-content" markdown="1" data-scope="operator">
## Cache and SQL memory size

Each CockroachDB node reserves a portion of its available memory for its cache and for storing temporary data for SQL queries. For more information on these settings, see the [Production Checklist](recommended-production-settings.html#cache-and-sql-memory-size).

Our Kubernetes manifests dynamically set cache size and SQL memory size each to 1/4 (the recommended fraction) of the available memory, which depends on the memory request and limit you [specified](#memory-and-cpu) for your configuration. If you want to customize these values, set them explicitly.

Specify `cache` and `maxSQLMemory` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

~~~ yaml
spec:
  cache: "4Gi"
  maxSQLMemory: "4Gi"
~~~

{% include {{ page.version.version }}/orchestration/apply-custom-resource.md %}

{{site.data.alerts.callout_info}}
Specifying these values is equivalent to using the `--cache` and `--max-sql-memory` flags with [`cockroach start`](cockroach-start.html#flags).
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
## Cache and SQL memory size

Each CockroachDB node reserves a portion of its available memory for its cache and for storing temporary data for SQL queries. For more information on these settings, see the [Production Checklist](recommended-production-settings.html#cache-and-sql-memory-size).

Our Kubernetes manifests dynamically set cache size and SQL memory size each to 1/4 (the recommended fraction) of the available memory, which depends on the memory request and limit you [specified](#memory-and-cpu) for your configuration. If you want to customize these values, set them explicitly.

Specify `cache` and `maxSQLMemory` in the custom values file you created when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb):

~~~ yaml
conf:
  cache: "4Gi"
  max-sql-memory: "4Gi"
~~~

{% include {{ page.version.version }}/orchestration/apply-helm-values.md %}
</section>

## Persistent storage

When you start your cluster, Kubernetes dynamically provisions and mounts a persistent volume into each pod. For more information on persistent volumes, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).

<section class="filter-content" markdown="1" data-scope="operator">
The storage capacity of each volume is set in `pvc.spec.resources` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

~~~ yaml
spec:
  dataStore:
    pvc:
      spec:
        resources:
          limits:
            storage: "60Gi"
          requests:
            storage: "60Gi"
~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
The storage capacity of each volume is initially set in `volumeClaimTemplates.spec.resources` in the StatefulSet manifest you used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html?filters=manual#configure-the-cluster):

~~~ yaml
volumeClaimTemplates:
  spec:
    resources:
      requests:
        storage: 100Gi
~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
The storage capacity of each volume is initially set in the Helm chart's [values file](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

~~~ yaml
persistentVolume:
  size: 100Gi
~~~
</section>

You should provision an appropriate amount of disk storage for your workload. For recommendations on this, see the [Production Checklist](recommended-production-settings.html#storage).

### Expand disk size

If you discover that you need more capacity, you can expand the persistent volumes on a running cluster. Increasing disk size is often [beneficial for CockroachDB performance](kubernetes-performance.html#disk-size).

<section class="filter-content" markdown="1" data-scope="operator">
Specify a new volume size in `resources.requests` and `resources.limits` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

~~~ yaml
spec:
  dataStore:
    pvc:
      spec:
        resources:
          limits:
            storage: "100Gi"
          requests:
            storage: "100Gi"
~~~

{% include {{ page.version.version }}/orchestration/apply-custom-resource.md %}

The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new storage capacity. 

To verify that the storage capacity has been updated, run `kubectl get pvc` to view the persistent volume claims (PVCs). It will take a few minutes before the PVCs are completely updated.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-helm.md %}
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Network ports

The Operator separates network traffic into three ports:

| Protocol | Default | Description                                                         | Custom Resource Field |
|----------|---------|---------------------------------------------------------------------|-----------------------|
| gRPC     | 26258   | Used for node connections                                           | `grpcPort`            |
| HTTP     | 8080    | Used to [access the DB Console](ui-overview.html#db-console-access) | `httpPort`            |
| SQL      | 26257   | Used for SQL shell access                                           | `sqlPort`             |

Specify alternate port numbers in the Operator's [custom resource](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster) (for example, to match the default port `5432` on PostgreSQL):

~~~ yaml
spec:
  sqlPort: 5432
~~~

{% include {{ page.version.version }}/orchestration/apply-custom-resource.md %}

The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new port settings. 

{{site.data.alerts.callout_danger}}
Currently, only the pods are updated with new ports. To connect to the cluster, you need to ensure that the `public` service is also updated to use the new port. You can do this by deleting the service with `kubectl delete service {cluster-name}-public`. When service is recreated by the Operator, it will use the new port. This is a known limitation that will be fixed in an Operator update.
{{site.data.alerts.end}}

## Ingress

You can configure an [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) object to expose an internal HTTP or SQL [`ClusterIP` service](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) through a hostname.

In order to use the Ingress resource, your cluster must be running an [Ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) for load balancing. This is **not** handled by the Operator and must be deployed separately.

Specify Ingress objects in `ingress.ui` (HTTP) or `ingress.sql` (SQL) in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

~~~ yaml
spec:
  ingress:
    ui:
      ingressClassName: nginx
      annotations:
        key: value
      host: ui.example.com
    sql:
      ingressClassName: nginx
      annotations:
        key: value
      host: sql.example.com
~~~

- `ingressClassName` specifies the [`IngressClass`](https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class) of the Ingress controller. This example uses the [nginx](https://kubernetes.github.io/ingress-nginx/) controller.

- The `host` must be made publicly accessible. For example, create a route in [Amazon Route 53](https://aws.amazon.com/route53/), or add an entry to `/etc/hosts` that maps the IP address of the Ingress controller to the hostname.

    {{site.data.alerts.callout_info}}
    Multiple hosts can be mapped to the same Ingress controller IP.
    {{site.data.alerts.end}}

- TCP connections for SQL clients must be enabled for the Ingress controller. For an example, see the [nginx documentation](https://kubernetes.github.io/ingress-nginx/user-guide/exposing-tcp-udp-services/).

    {{site.data.alerts.callout_info}}
    Changing the SQL Ingress `host` on a running deployment will cause a rolling restart of the cluster, due to new node certificates being generated for the SQL host.
    {{site.data.alerts.end}}

{% capture latest_operator_version %}{% include_cached latest_operator_version.md %}{% endcapture %}

The [custom resource definition](https://github.com/cockroachdb/cockroach-operator/blob/v{{ latest_operator_version }}/config/crd/bases/crdb.cockroachlabs.com_crdbclusters.yaml) details the fields supported by the Operator.
</section>
