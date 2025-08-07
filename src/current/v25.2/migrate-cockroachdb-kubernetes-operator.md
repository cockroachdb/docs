---
title: Migrate from the Public Operator
summary: Migration guide detailing how to migrate away from a deployment using the public Kubernetes operator to the CockroachDB operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This guide describes how to migrate an existing CockroachDB cluster managed via the {{ site.data.products.public-operator }} to the {{ site.data.products.cockroachdb-operator }}.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

These instructions assume that you are migrating from a {{ site.data.products.public-operator }} cluster that is managed with kubectl via the following yaml files:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/operator.yaml
kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/examples/example.yaml
~~~

{{site.data.alerts.callout_success}}
If your existing cluster was created as a StatefulSet using Helm, refer to the [Helm migration guide]({% link {{ page.version.version }}/migrate-cockroachdb-kubernetes-helm.md %}).
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

- Set CRDBCLUSTER to the crdbcluster custom resource name in the {{ site.data.products.public-operator }}:
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

The {{ site.data.products.cockroachdb-operator }} uses slightly different certificates than the {{ site.data.products.public-operator }}, and mounts them in configmaps and secrets with different names. Use the migration helper utility with the `migrate-certs` option to re-map and generate TLS certificates:

{% include_cached copy-clipboard.html %}
~~~ shell
bin/migration-helper migrate-certs --statefulset-name $STS_NAME --namespace $NAMESPACE
~~~

Generate a manifest for each crdbnode and the crdbcluster based on the state of the StatefulSet. The new pods and their associated PVCs must have the same names as the original StatefulSet-managed pods and PVCs. The new {{ site.data.products.cockroachdb-operator }}-managed pods will then use the original PVCs, rather than replicate data into empty nodes.

{% include_cached copy-clipboard.html %}
~~~ shell
mkdir -p manifests
bin/migration-helper build-manifest helm --statefulset-name $STS_NAME --namespace $NAMESPACE --cloud-provider $CLOUD_PROVIDER --cloud-region $REGION --output-dir ./manifests
~~~

## Step 3. Uninstall and replace the {{ site.data.products.public-operator }}

The {{ site.data.products.public-operator }} and the {{ site.data.products.cockroachdb-operator }} use custom resource definitions with the same names, so you must remove the {{ site.data.products.public-operator }} before installing the {{ site.data.products.cockroachdb-operator }}. Run the following commands to uninstall the {{ site.data.products.public-operator }}, without deleting its managed resources:

- Ensure that the operator can't accidentally delete managed Kubernetes objects:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete clusterrolebinding cockroach-operator-rolebinding
    ~~~

- Delete the {{ site.data.products.public-operator }} custom resource:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete crdbcluster $CRDBCLUSTER --cascade=orphan
    ~~~

- Delete {{ site.data.products.public-operator }} resources and custom resource definition:
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

Run `helm upgrade` to install the {{ site.data.products.cockroachdb-operator }} and wait for it to become ready:

{% include_cached copy-clipboard.html %}
~~~ shell
helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator
kubectl rollout status deployment/cockroach-operator --timeout=60s
~~~

## Step 4. Replace statefulset pods with operator-managed nodes

To migrate seamlessly from the {{ site.data.products.public-operator }} to the {{ site.data.products.cockroachdb-operator }}, scale down StatefulSet-managed pods and replace them with crdbnode objects, one by one. Then we’ll create the crdbcluster object that manages the crdbnodes.

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

1. Wait for the new pod to become ready. If it doesn’t, [check the operator logs]({% link {{ page.version.version }}/monitor-cockroachdb-operator.md %}#monitor-the-operator) for errors.

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

{{site.data.alerts.callout_danger}}
If there are issues with the migration and you need to revert back to the previous deployment, follow the [rollback process](#roll-back-a-migration-in-progress).
{{site.data.alerts.end}}

## Step 5. Update the crdbcluster manifest

The {{ site.data.products.public-operator }} creates a pod disruption budget that conflicts with a pod disruption budget managed by the {{ site.data.products.cockroachdb-operator }}. Before applying the crdbcluster manifest, delete the existing pod disruption budget:

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

Once the migration is successful, delete the StatefulSet that was created by the {{ site.data.products.public-operator }}:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl delete poddisruptionbudget $STS_NAME-budget
~~~

## Roll back a migration in progress

If the migration to the {{ site.data.products.cockroachdb-operator}} fails during the stage where you are applying the generated `crdbnode` manifests, follow the steps below to safely restore the original state using the previously backed-up resources and preserved volumes. This assumes the StatefulSet and PVCs are not deleted.

1. Delete the applied `crdbnode` resources and simultaneously scale the StatefulSet back up.

    Delete the individual `crdbnode` manifests in the reverse order of their creation (starting with the last one created, e.g., `crdbnode-1.yaml`) and scale the StatefulSet back to its original replica count (e.g., 2). For example, assuming you have applied two `crdbnode` yaml files (`crdbnode-2.yaml` and  `crdbnode-1.yaml`):
    
    1. Delete a `crdbnode` manifest in reverse order, starting with `crdbnode-1.yaml`.
    
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl delete -f manifests/crdbnode-1.yaml
        ~~~
    
    1. Scale the StatefulSet replica count up by one (to 2).
    
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl scale statefulset $CRDBCLUSTER --replicas=2
        ~~~
    
    1. Verify that data has propagated by waiting for there to be zero under-replicated ranges:
    
        1. Set up port forwarding to access the CockroachDB node's HTTP interface, replacing `cockroachdb-X` with the node name:

            {% include_cached copy-clipboard.html %}
            ~~~ shell
            kubectl port-forward pod/cockroachdb-X 8080:8080
            ~~~
            
            The DB Console runs on port 8080 by default.

        1. Check the `ranges_underreplicated` metric:

            {% include_cached copy-clipboard.html %}
            ~~~ shell
            curl --insecure -s https://localhost:8080/_status/vars | grep "ranges_underreplicated{" | awk ' {print $2}'
            ~~~
            
            This command outputs the number of under-replicated ranges on the node, which should be zero before proceeding with the next node. This may take some time depending on the deployment, but is necessary to ensure that there is no downtime in data availability.
    
    1. Repeat steps a through c for each node, deleting the `crdbnode-2.yaml`, scaling replica count to 3, and so on.
    
        Repeat the `kubectl delete -f ... command` for each `crdbnode` manifest you applied during migration. Make sure to verify that there are no underreplicated ranges after rolling back each node.

1. Delete the PriorityClass and RBAC resources created for the CockroachDB operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete priorityclass crdb-critical
    kubectl delete -f manifests/rbac.yaml
    ~~~

1. Uninstall the {{ site.data.products.cockroachdb-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm uninstall crdb-operator
    ~~~

1. Clean up {{ site.data.products.cockroachdb-operator }} resources and custom resource definitions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete crds crdbnodes.crdb.cockroachlabs.com
    kubectl delete crds crdbtenants.crdb.cockroachlabs.com
    kubectl delete serviceaccount cockroachdb-sa
    kubectl delete service cockroach-webhook-service
    kubectl delete validatingwebhookconfiguration cockroach-webhook-config
    ~~~

1. Restore the {{ site.data.products.public-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/crds.yaml
    kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.17.0/install/operator.yaml
    ~~~
    
    Wait for the operator pod to be "Running" as shown with the following command:
    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods -n cockroach-operator-system
    ~~~

1. Restore the original `crdbcluster` custom resource:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f backup/crdbcluster-$CRDBCLUSTER.yaml
    ~~~

1. Confirm that all CockroachDB pods are "Running" or "Ready" as shown with the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~
