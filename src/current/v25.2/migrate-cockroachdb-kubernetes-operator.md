---
title: Migrate from the Public Operator
summary: Migration guide detailing how to migrate away from a deployment using the public Kubernetes operator to the CockroachDB operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This guide describes how to migrate an existing CockroachDB cluster managed via the public operator to the CockroachDB operator.

These instructions assume that you are migrating from a public operator cluster that is managed with kubectl via the following yaml files:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/operator.yaml
kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/examples/example.yaml
~~~

{{site.data.alerts.callout_success}}
If your existing cluster was created as a StatefulSet using Helm, refer to the [Helm migration guide](migrate-cockroachdb-kubernetes-helm.html).
{{site.data.alerts.end}}

This migration process can be completed without affecting cluster availability, and preserves existing disks so that data doesn’t need to be replicated into empty volumes. This process scales down the StatefulSet by one node before adding each operator-managed pod, so the maximum cluster capacity will be reduced by one node periodically throughout the migration.

## Step 1. Prepare the migration helper

Build the migration helper and add the `./bin` directory to your PATH:

{% include_cached copy-clipboard.html %}
~~~ shell
make bin/migration-helper
export PATH=$PATH:$(pwd)/bin
~~~

Export environment variables for the existing deployment:

- Set CRDBCLUSTER to the crdbcluster custom resource name in the public operator:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export CRDBCLUSTER="cockroachdb"
    ~~~

- Set NAMESPACE to the namespace where the statefulset is installed:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export NAMESPACE="default"
    ~~~

- Set CLOUD_PROVIDER to the cloud vendor where Kubernetes cluster is residing. All major cloud providers are supported (gcp, aws, azure):
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export CLOUD_PROVIDER=gcp
    ~~~

- Set REGION to the cloud provider's identifier of this region. This region must match the "topology.kubernetes.io/region" label in the Kubernetes nodes for this cluster:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export REGION=us-central1
    ~~~

Back up the crdbcluster resource in case there is a need to revert:

{% include_cached copy-clipboard.html %}
~~~ shell
mkdir -p backup
kubectl get crdbcluster -o yaml $CRDBCLUSTER > backup/crdbcluster-$CRDBCLUSTER.yaml
~~~

## Step 2. Generate manifests with the migration helper

The CockroachDB operator uses slightly different certificates than the public operator, and mounts them in configmaps and secrets with different names. Use the migration helper utility with the `migrate-certs` option to re-map and generate TLS certificates:

{% include_cached copy-clipboard.html %}
~~~ shell
bin/migration-helper migrate-certs --statefulset-name $STS_NAME --namespace $NAMESPACE
~~~

Generate a manifest for each crdbnode and the crdbcluster based on the state of the StatefulSet. The new pods and their associated PVCs must have the same names as the original StatefulSet-managed pods and PVCs. The new CockroachDB operator-managed pods will then use the original PVCs, rather than replicate data into empty nodes.

{% include_cached copy-clipboard.html %}
~~~ shell
mkdir -p manifests
bin/migration-helper build-manifest helm --statefulset-name $STS_NAME --namespace $NAMESPACE --cloud-provider $CLOUD_PROVIDER --cloud-region $REGION --output-dir ./manifests
~~~

## Step 3. Uninstall and replace the public operator

The public operator and the CockroachDB operator use custom resource definitions with the same names, so you must remove the public operator before installing the CockroachDB operator. Run the following commands to uninstall the public operator, without deleting its managed resources:

- Ensure that the operator can't accidentally delete managed Kubernetes objects:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete clusterrolebinding cockroach-operator-rolebinding
    ~~~

- Delete the public operator custom resource:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete crdbcluster $CRDBCLUSTER --cascade=orphan
    ~~~

- Delete public operator resources and custom resource definition:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/crds.yaml
    kubectl delete serviceaccount cockroach-operator-sa -n cockroach-operator-system
    kubectl delete clusterrole cockroach-operator-role
    kubectl delete clusterrolebinding cockroach-operator-rolebinding
    kubectl delete service cockroach-operator-webhook-service -n cockroach-operator-system
    kubectl delete deployment cockroach-operator-manager -n cockroach-operator-system
    kubectl delete mutatingwebhookconfigurations cockroach-operator-mutating-webhook-configuration
    kubectl delete validatingwebhookconfigurations cockroach-operator-validating-webhook-configuration
    ~~~

Run `helm upgrade` to install the CockroachDB operator and wait for it to become ready:

{% include_cached copy-clipboard.html %}
~~~ shell
helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator
kubectl rollout status deployment/cockroach-operator --timeout=60s
~~~

## Step 4. Replace statefulset pods with operator-managed nodes

To migrate seamlessly from the public operator to the CockroachDB operator, scale down StatefulSet-managed pods and replace them with crdbnode objects, one by one. Then we’ll create the crdbcluster object that manages the crdbnodes.

Create objects with `kubectl` that will eventually be owned by the crdbcluster:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl create priorityclass crdb-critical --value 500000000
kubectl apply -f manifests/rbac.yaml
~~~

Install the `crdb-operator` with Helm:

{% include_cached copy-clipboard.html %}
~~~ shell
helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator
~~~

For each pod in the StatefulSet, perform the following steps:

1. Scale the StatefulSet down by one replica. For example, for a five-node cluster, scale the StatefulSet down to four replicas:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl scale statefulset/$STS_NAME --replicas=4
    ~~~

1. Create the `crdbnode` resource that corresponds to the StatefulSet pod you just scaled down. Each manifest is labeled with the pattern `crdbnode-X.yaml`, where `X` corresponds to a StatefulSet pod named `{STS_NAME}-X`. Note the pod that was scaled down and specify its manifest in a command like the following:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f manifests/crdbnode-4.yaml
    ~~~

1. Wait for the new pod to become ready. If it doesn’t, [check the operator logs](monitor-cockroachdb-kubernetes-operator.html#monitor-the-operator) for errors.

1. Before moving on to the next replica migration, verify that there are no underreplicated ranges:
    1. Set up port forwarding to access the CockroachDB node’s HTTP interface. Note that the DB Console runs on port 8080 by default:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl port-forward pod/cockroachdb-4 8080:8080
        ~~~

    1. Check that there are zero underreplicated ranges. The following command outputs the number of under-replicated ranges on this CockroachDB node:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        curl --insecure -s https://localhost:8080/_status/vars | grep "ranges_underreplicated{" | awk '{print $2}'
        ~~~

Repeat these steps until the StatefulSet has zero replicas.

## Step 5. Update the crdbcluster manifest

The public operator creates a pod disruption budget that conflicts with a pod disruption budget managed by the CockroachDB operator. Before applying the crdbcluster manifest, delete the existing pod disruption budget:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl delete poddisruptionbudget $CRDBCLUSTER
~~~

Annotate the existing Kubernetes objects so they can managed by the Helm chart:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl annotate service $CRDBCLUSTER-public meta.helm.sh/release-name="$CRDBCLUSTER"
kubectl annotate service $CRDBCLUSTER-public meta.helm.sh/release-namespace="$NAMESPACE"
kubectl label service $CRDBCLUSTER-public app.kubernetes.io/managed-by=Helm --overwrite=true
~~~

Apply the crdbcluster manifest:

{% include_cached copy-clipboard.html %}
~~~ shell
helm install $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb -f manifests/values.yaml
~~~

Once the migration is successful, delete the StatefulSet that was created by the public operator:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl delete poddisruptionbudget $STS_NAME-budget
~~~
