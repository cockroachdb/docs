---
title: Resource Management with the CockroachDB Operator
summary: Allocate CPU, memory, and storage resources for a cluster deployed with the CockroachDB operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page explains how to configure Kubernetes cluster resources such as memory, CPU, and storage.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

On a production cluster, the resources you allocate to CockroachDB should be proportionate to your machine types and workload. Cockroach Labs recommends that you determine and set these values before deploying the cluster, but you can also update the values on a running cluster.

{{site.data.alerts.callout_info}}
Run `kubectl describe nodes` to see the available resources on the instances that you have provisioned.
{{site.data.alerts.end}}

## Memory and CPU

You can set the CPU and memory resources allocated to the CockroachDB container on each pod.

{{site.data.alerts.callout_info}}
1 CPU in Kubernetes is equivalent to 1 vCPU or 1 hyperthread. For best practices on provisioning CPU and memory for CockroachDB, refer to the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware).
{{site.data.alerts.end}}

Specify CPU and memory values in `cockroachdb.crdbCluster.podTemplate.spec.resources.limits` and `cockroachdb.crdbCluster.podTemplate.spec.resources.requests` in the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster):

~~~ yaml
cockroachdb:
  crdbCluster:
    podTemplate:
      spec:
        resources:
          limits:
            cpu: 4000m
            memory: 16Gi
          requests:
            cpu: 4000m
            memory: 16gi
~~~

Apply the new settings to the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
~~~

Cockroach Labs recommends using identical values for `resources.requests` and `resources.limits`. When setting the new values, note that not all of a pod's resources will be available to the CockroachDB container. This is because a fraction of the CPU and memory is reserved for Kubernetes.

{{site.data.alerts.callout_info}}
If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
{{site.data.alerts.end}}

For more information on how Kubernetes handles resources, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

### Cache and SQL memory size

Each CockroachDB node reserves a portion of its available memory for its cache and for storing temporary data for SQL queries. For more information on these settings, see the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}#cache-and-sql-memory-size).

The {{ site.data.products.cockroachdb-operator }} dynamically sets cache size and SQL memory size each to 25% (the recommended percentage) of the available memory, which depends on the memory request and limit you [specified](#memory-and-cpu) for your configuration. These values can be modified by adding the `cache` or `max-sql-memory` fields to `cockroachdb.crdbCluster.flags`, which is equivalent to appending `--cache` or `--max-sql-memory` as [cockroach start flags]({% link {{ page.version.version }}/cockroach-start.md %}#flags).

## Persistent storage

When you start your cluster, Kubernetes dynamically provisions and mounts a persistent volume into each pod. For more information on persistent volumes, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).

The storage capacity of each volume is set in `cockroachdb.crdbCluster.dataStore.volumeClaimTemplate.spec.resources` in the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster):

~~~ yaml
cockroachdb:
  crdbCluster:
    dataStore:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: "10Gi"
~~~

You should provision an appropriate amount of disk storage for your workload. For recommendations on this, see the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}#storage).

### Expand disk size

If you discover that you need more capacity, you can expand the persistent volumes on a running cluster. Increasing disk size is often [beneficial for CockroachDB performance]({% link {{ page.version.version }}/cockroachdb-operator-performance.md %}).

{{site.data.alerts.callout_info}}
The volume size should only adjusted on disk types that can dynamically scale up, such as Amazon EBS volumes. Adjusting the volume size on non-dynamically scaling disks is not recommended, and instead you should horizontally scale the number of disks used.
{{site.data.alerts.end}}

Specify a new volume size in the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster):

~~~ yaml
cockroachdb:
  crdbCluster:
    dataStore:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: "100Gi"
~~~

Apply the new settings to the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
~~~

The {{ site.data.products.cockroachdb-operator }} updates all nodes and triggers a rolling restart of the pods with the new storage capacity.

To verify that the storage capacity has been updated, run `kubectl get pvc` to view the persistent volume claims (PVCs). It will take a few minutes before the PVCs are completely updated.

## Network ports

The {{ site.data.products.cockroachdb-operator }} separates network traffic into three ports:

| Protocol   | Default Port| Description                   | Custom Resource Field            |
|------------|-------------|-------------------------------|----------------------------------|
| gRPC       | 26258       | Used for node connections     | service.ports.grpc    |
| HTTP       | 8080        | Used to access the DB Console | service.ports.http    |
| SQL        | 26257       | Used for SQL shell access     | service.ports.sql     |

Specify alternate port numbers in `cockroachdb.crdbCluster.service.ports` of the {{ site.data.products.cockroachdb-operator }}'s [custom resource]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster) (for example, to match the default port `5432` on PostgreSQL):

~~~ yaml
cockroachdb:
  crdbCluster:
    service:
      ports:
        sql: 5432
~~~

Apply the new settings to the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
~~~

The {{ site.data.products.cockroachdb-operator }} updates all nodes and triggers a rolling restart of the pods with the new port settings.

## Ingress

You can configure an [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) object to expose an internal HTTP or SQL [`ClusterIP` service](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) through a hostname.

In order to use the Ingress resource, your cluster must be running an [Ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) for load balancing. This is **not** handled by the {{ site.data.products.cockroachdb-operator }} and must be deployed separately.

Specify Ingress objects in `cockroachdb.crdbCluster.service.ingress`. Set `ingress.enabled` to `true` and specify `ingress.ui` (HTTP) or `ingress.sql` (SQL) in the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster):

~~~ yaml
cockroachdb:
  crdbCluster:
    service:
      ingress:
        enabled: true
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
