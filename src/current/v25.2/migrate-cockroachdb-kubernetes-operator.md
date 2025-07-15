---
title: Migrate from legacy Kubernetes Operator
summary: Migration guide detailing how to migrate away from a Helm deployment of CockroachDB to the Kubernetes operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This guide describes how to migrate an existing CockroachDB cluster managed via the public operator to the enterprise operator.

These instructions assume that you are migrating from a public operator cluster that is managed with kubectl via the following yaml files:

```shell
$ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/crds.yaml
$ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/operator.yaml
$ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/examples/example.yaml
```

If your existing cluster was created as a StatefulSet using Helm, refer to the [Helm migration guide](migrate-cockroachdb-kubernetes-helm.html).

This migration process is designed to allow migration to occur without affecting cluster availability, and preserving existing disks so data doesn’t need to be replicated into empty volumes. Note that this process scales down the StatefulSet by one node before adding each operator-managed pod, so the maximum cluster capacity will be reduced by one node periodically throughout the migration.

{{site.data.alerts.callout_info}}
This migration process is currently only recommended to run in a non-production environment. We are actively working on a rollback procedure but are looking for early feedback on this process.
{{site.data.alerts.end}}

## Step 1. Prepare the migration helper

Build the migration helper and add the `./bin` directory to your PATH:

```shell
$ make bin/migration-helper
$ export PATH=$PATH:$(pwd)/bin
```

Export environment variables about the existing deployment:

```shell
# Set CRDBCLUSTER to the crdbcluster custom resource name in the public operator.
$ export CRDBCLUSTER="cockroachdb"

# Set NAMESPACE to the namespace where the statefulset is installed.
$ export NAMESPACE="default"

# Set CLOUD_PROVIDER to the cloud vendor where k8s cluster is residing. 
# All the major cloud providers are supported (gcp,aws,azure)
$ export CLOUD_PROVIDER=gcp

# Set REGION to the cloud provider's identifier of this region.
# This region must match the "topology.kubernetes.io/region" label in
# the Kubernetes nodes for this cluster.
$ export REGION=us-central1
```

Back up the crdbcluster resource in case there is a need to revert:

```shell
$ mkdir -p backup
$ kubectl get crdbcluster -o yaml $CRDBCLUSTER > backup/crdbcluster-$CRDBCLUSTER.yaml
```

## Step 2. Generate manifests with the migration helper

The enterprise operator uses slightly different certificates than the public operator, and mounts them in configmaps and secrets with different names. Use the migration helper utility with the `migrate-certs` option to re-map and generate TLS certificates:

```shell
$ bin/migration-helper migrate-certs --statefulset-name $STS_NAME --namespace $NAMESPACE
```

Generate a manifest for each crdbnode and the crdbcluster based on the state of the StatefulSet. We do this because we want the new pods and their associated PVCs to have the same names as the original StatefulSet-managed pods and PVCs. This means that the new operator-managed pods will use the original PVCs rather than replicate data into empty nodes.

```shell
$ mkdir -p manifests
$ bin/migration-helper build-manifest helm --statefulset-name $STS_NAME --namespace $NAMESPACE --cloud-provider $CLOUD_PROVIDER --cloud-region $REGION --output-dir ./manifests
```

## Step 3. Uninstall and replace the old operator

The public operator and the enterprise operator use custom resource definitions with the same names, so you must remove the public operator before installing the cloud operator. Run the following commands to uninstall the public operator, without deleting its managed resources:

```shell
# Ensure that the operator can't accidentally delete managed k8s objects.
kubectl delete clusterrolebinding cockroach-operator-rolebinding

# Delete public operator custom resource.
kubectl delete crdbcluster $CRDBCLUSTER --cascade=orphan

# Delete public operator resources and custom resource definition.
kubectl delete -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/crds.yaml
kubectl delete serviceaccount cockroach-operator-sa -n cockroach-operator-system
kubectl delete clusterrole cockroach-operator-role
kubectl delete clusterrolebinding cockroach-operator-rolebinding
kubectl delete service cockroach-operator-webhook-service -n cockroach-operator-system
kubectl delete deployment cockroach-operator-manager -n cockroach-operator-system
kubectl delete mutatingwebhookconfigurations cockroach-operator-mutating-webhook-configuration
kubectl delete validatingwebhookconfigurations cockroach-operator-validating-webhook-configuration
```

Run `helm upgrade` to install the enterprise operator and wait for it to become ready:

```shell
$ helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator
$ kubectl rollout status deployment/cockroach-operator --timeout=60s
```

## Step 4. Replace statefulset pods with operator nodes

To migrate seamlessly from the public operator to the enterprise operator, we’ll scale down StatefulSet-managed pods and replace them with crdbnode objects, one by one. Then we’ll create the crdbcluster object that manages the crdbnodes.

First, create objects in kubectl that will eventually be owned by the crdbcluster:

```shell
$ kubectl create priorityclass crdb-critical --value 500000000
$ kubectl apply -f manifests/rbac.yaml
```

Install the crdb-operator with Helm:

```shell
$ helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator
```

For each pod in the StatefulSet, perform the following steps:

1. Scale the StatefulSet down by one replica. For example, for a five-node cluster, scale the StatefulSet down to four replicas:

    ```shell
    $ kubectl scale statefulset/$STS_NAME --replicas=4
    ```

2. Create the crdbnode corresponding to the StatefulSet pod you just scaled down. The manifests are labeled as `crdbnode-X.yaml` where `X` is shared with each `&lt;STS_NAME>-X` StatefulSet pod, so note whichever pod was scaled down and specify the corresponding manifest in the following command:

    ```shell
    $ kubectl apply -f manifests/crdbnode-4.yaml
    ```

3. Wait for the new pod to become ready. If it doesn’t, check the operator logs for errors.

4. Before moving on to the next replica migration, verify that there are no underreplicated ranges:
    1. Set up port forwarding to access the CockroachDB node’s HTTP interface. Note that CockroachDB’s UI runs on port 8080 by default:

        ```shell
        $ kubectl port-forward pod/cockroachdb-4 8080:8080
        ```

    2. Check that there are zero underreplicated ranges. The following command outputs the number of under-replicated ranges on this CockroachDB node:

        ```shell
        $ curl --insecure -s https://localhost:8080/_status/vars | grep "ranges_underreplicated{" | awk '{print $2}'
        ```

Repeat these steps until the StatefulSet has zero replicas.

## Step 5. Update the crdbcluster manifest

The public operator creates a pod disruption budget that conflicts with a pod disruption budget managed by the cloud operator. Before applying the crdbcluster manifest, delete the existing pod disruption budget:

```shell
$ kubectl delete poddisruptionbudget $CRDBCLUSTER
```

Annotate the existing Kubernetes objects so they can managed by the Helm chart:

```shell
$ kubectl annotate service $CRDBCLUSTER-public meta.helm.sh/release-name="$CRDBCLUSTER"
$ kubectl annotate service $CRDBCLUSTER-public meta.helm.sh/release-namespace="$NAMESPACE"
$ kubectl label service $CRDBCLUSTER-public app.kubernetes.io/managed-by=Helm --overwrite=true
```

Apply the crdbcluster manifest:

```shell
$ helm install $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb -f manifests/values.yaml
```

Once the migration is successful, delete the StatefulSet that was created by the public operator:

```shell
$ kubectl delete poddisruptionbudget $STS_NAME-budget
```
