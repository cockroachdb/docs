To roll back to the previous major version before an upgrade is finalized:

1. Change the container image in the custom resource to use the previous major version:

    ~~~
    image:
      name: cockroachdb/cockroach:{{ page.version.version }}
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f example.yaml
    ~~~

    The Operator will perform the staged rollback.

1. To check the status of the rollback, run `kubectl get pods`.
1. Verify that all pods have been rolled back:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-details).

1. Like a major-version upgrade, a rollback must be [finalized](#finalize-a-major-version-upgrade-manually). When the rollback is finalized, the rollback is complete.
