---
title: Resource Management with the Kubernetes Operator
summary: Allocate CPU, memory, and storage resources for a cluster deployed with the Kubernetes Operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page explains how to configure Kubernetes cluster resources such as memory, CPU, and storage.

On a production cluster, the resources you allocate to CockroachDB should be proportionate to your machine types and workload. We recommend that you determine and set these values before deploying the cluster, but you can also update the values on a running cluster.

{{site.data.alerts.callout_info}}
Run `kubectl describe nodes` to see the available resources on the instances that you have provisioned.
{{site.data.alerts.end}}

## Memory and CPU

You can set the CPU and memory resources allocated to the CockroachDB container on each pod.

{{site.data.alerts.callout_info}}
1 CPU in Kubernetes is equivalent to 1 vCPU or 1 hyperthread. For best practices on provisioning CPU and memory for CockroachDB, see the [Production Checklist](recommended-production-settings.html#hardware).
{{site.data.alerts.end}}

Specify CPU and memory values in `cockroachdb.crdbCluster.resources.limits` and `cockroachdb.crdbCluster.resources.requests` in the values file used to [deploy the cluster](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster):

```yaml
cockroachdb:
  crdbCluster:
    resources:
      limits:
        cpu: 4000m
        memory: 16Gi
      requests:
        cpu: 4000m
        memory: 16Gi
```

Apply the new settings to the cluster:

```shell
$ helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
```

We recommend using identical values for `resources.requests` and `resources.limits`. When setting the new values, note that not all of a pod's resources will be available to the CockroachDB container. This is because a fraction of the CPU and memory is reserved for Kubernetes.

{{site.data.alerts.callout_info}}
If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
{{site.data.alerts.end}}

For more information on how Kubernetes handles resources, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

### Cache and SQL memory size

Each CockroachDB node reserves a portion of its available memory for its cache and for storing temporary data for SQL queries. For more information on these settings, see the [Production Checklist](recommended-production-settings.html#cache-and-sql-memory-size).

The Kubernetes operator dynamically sets cache size and SQL memory size each to 25% (the recommended percent) of the available memory, which depends on the memory request and limit you [specified](#memory-and-cpu) for your configuration. These values can be modified by adding the `cache` or `max-sql-memory` fields to `cockroachdb.crdbCluster.flags`, which is equivalent to appending `--cache` or `--max-sql-memory` as [cockroach start flags](cockroach-start.html#flags).

## Persistent storage

When you start your cluster, Kubernetes dynamically provisions and mounts a persistent volume into each pod. For more information on persistent volumes, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).

The storage capacity of each volume is set in `cockroachdb.crdbCluster.dataStore.volumeClaimTemplate.spec.resources` in the values file used to [deploy the cluster](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster):

```yaml
cockroachdb:
  crdbCluster:
    dataStore:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: "10Gi"
```

You should provision an appropriate amount of disk storage for your workload. For recommendations on this, see the [Production Checklist](recommended-production-settings.html#storage).

### Expand disk size

If you discover that you need more capacity, you can expand the persistent volumes on a running cluster. Increasing disk size is often [beneficial for CockroachDB performance](kubernetes-operator-performance.html).

Specify a new volume size in the values file used to [deploy the cluster](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster):

```yaml
cockroachdb:
  crdbCluster:
    dataStore:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: "100Gi"
```

Apply the new settings to the cluster:

```shell
$ helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
```

The Operator updates all nodes and triggers a rolling restart of the pods with the new storage capacity.

To verify that the storage capacity has been updated, run `kubectl get pvc` to view the persistent volume claims (PVCs). It will take a few minutes before the PVCs are completely updated.

## Network ports

The Operator separates network traffic into three ports:

<table>
  <tr>
   <td><strong>Protocol</strong>
   </td>
   <td><strong>Default</strong>
   </td>
   <td><strong>Description</strong>
   </td>
   <td><strong>Custom Resource Field</strong>
   </td>
  </tr>
  <tr>
   <td>gRPC
   </td>
   <td>26258
   </td>
   <td>Used for node connections
   </td>
   <td><code>service.ports.grpc</code>
   </td>
  </tr>
  <tr>
   <td>HTTP
   </td>
   <td>8080
   </td>
   <td>Used to <a href="ui-overview.html#db-console-access">access the DB Console</a>
   </td>
   <td><code>service.ports.http</code>
   </td>
  </tr>
  <tr>
   <td>SQL
   </td>
   <td>26257
   </td>
   <td>Used for SQL shell access
   </td>
   <td><code>service.ports.sql</code>
   </td>
  </tr>
</table>

Specify alternate port numbers in `cockroachdb.crdbCluster.service.ports` of the Operator's [custom resource](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster) (for example, to match the default port `5432` on PostgreSQL):

```yaml
cockroachdb:
  crdbCluster:
    service:
      ports:
        sql: 5432
```

Apply the new settings to the cluster:

```shell
$ helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
```

The Operator updates all nodes and triggers a rolling restart of the pods with the new port settings.
