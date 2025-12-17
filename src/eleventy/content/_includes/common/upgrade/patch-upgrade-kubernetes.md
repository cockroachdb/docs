<section class="filter-content" markdown="1" data-scope="operator">

To upgrade from one patch release to another within the same major version, perform the following steps on one node at a time:

1. Change the container image in the custom resource:

    ~~~
    image:
      name: cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

1. Apply the new settings to the cluster:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    kubectl apply -f example.yaml
    ~~~

    The Operator will perform the staged update.

1. To check the status of the rolling upgrade, run `kubectl get pods`.
1. Verify that all pods have been upgraded:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console]({% link "{{ page.version.version }}/ui-cluster-overview-page.md" %}#node-details).

</section>

<section class="filter-content" markdown="1" data-scope="manual">

1. Add a [partition](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) to the update strategy defined in the StatefulSet. Only the pods numbered greater than or equal to the partition value will be updated. For a cluster with 3 pods (e.g., `cockroachdb-0`, `cockroachdb-1`, `cockroachdb-2`) the partition value should be 2:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb \
    -p='{"spec":{"updateStrategy":{"type":"RollingUpdate","rollingUpdate":{"partition":2}}}}'
    ~~~

    ~~~
    statefulset.apps/cockroachdb patched
    ~~~

1. Change the container image in the StatefulSet:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb \
    --type='json' \
    -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:{{page.release_info.version}}"}]'
    ~~~

    ~~~
    statefulset.apps/cockroachdb patched
    ~~~

1. To check the status of the rolling upgrade, run `kubectl get pods`.
1. Verify that all pods have been upgraded:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console]({% link "{{ page.version.version }}/ui-cluster-overview-page.md" %}#node-details).

</section>

<section class="filter-content" markdown="1" data-scope="helm">

1. Add a [partition](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) to the update strategy defined in the StatefulSet. Only the pods numbered greater than or equal to the partition value will be updated. For a cluster with 3 pods (e.g., `cockroachdb-0`, `cockroachdb-1`, `cockroachdb-2`) the partition value should be 2:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.updateStrategy.rollingUpdate.partition=2
    ~~~

1. Connect to the cluster using the SQL shell:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~

1. Remove the cluster initialization job from when the cluster was created:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl delete job my-release-cockroachdb-init
    ~~~

1. Change the container image in the StatefulSet:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set image.tag={{page.release_info.version}} \
    --reuse-values
    ~~~

1. To check the status of the rolling upgrade, run `kubectl get pods`.
1. Verify that all pods have been upgraded:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console]({% link "{{ page.version.version }}/ui-cluster-overview-page.md" %}#node-details).

</section>
