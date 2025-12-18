As new versions of CockroachDB are released, it's strongly recommended to upgrade to newer versions in order to pick up bug fixes, performance improvements, and new features. The [general CockroachDB upgrade documentation](upgrade-cockroach-version.html) provides best practices for how to prepare for and execute upgrades of CockroachDB clusters, but the mechanism of actually stopping and restarting processes in Kubernetes is somewhat special.

Kubernetes knows how to carry out a safe rolling upgrade process of the CockroachDB nodes. When you tell it to change the Docker image used in the CockroachDB StatefulSet, Kubernetes will go one-by-one, stopping a node, restarting it with the new image, and waiting for it to be ready to receive client requests before moving on to the next one. For more information, see [the Kubernetes documentation](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#updating-statefulsets).

1. All that it takes to kick off this process is changing the desired Docker image. To do so, pick the version that you want to upgrade to, then run the following command, replacing "VERSION" with your desired new version:

    ~~~ shell
    $ kubectl patch statefulset cockroachdb --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

    ~~~
    statefulset "cockroachdb" patched
    ~~~

2. If you then check the status of your cluster's pods, you should see one of them being restarted:

    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME            READY     STATUS        RESTARTS   AGE
    cockroachdb-0   1/1       Running       0          2m
    cockroachdb-1   1/1       Running       0          2m
    cockroachdb-2   1/1       Running       0          2m
    cockroachdb-3   0/1       Terminating   0          1m
    ~~~

3. This will continue until all of the pods have restarted and are running the new image. To check the image of each pod to determine whether they've all be upgraded, run:

    ~~~ shell
    $ kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    ~~~
    cockroachdb-0	cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-1	cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-2	cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-3	cockroachdb/cockroach:{{page.release_info.version}}
    ~~~
