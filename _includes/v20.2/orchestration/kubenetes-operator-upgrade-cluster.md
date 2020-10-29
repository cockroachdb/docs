It is strongly recommended that you regularly upgrade your CockroachDB version in order to pick up bug fixes, performance improvements, and new features. The [CockroachDB upgrade documentation](upgrade-cockroach-version.html) describes how to perform a "rolling upgrade" of a CockroachDB cluster by stopping and restarting nodes one at a time. This is to ensure that the cluster remains available during the upgrade.

The corresponding process on Kubernetes is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update), in which the Docker image is updated in the CockroachDB StatefulSet and then applied to the pods one at a time.

1. Decide how the upgrade will be finalized.

    {{site.data.alerts.callout_info}}
    This step is relevant only when upgrading from v20.1.x to v20.2. For upgrades within the v20.2.x series, skip this step.
    {{site.data.alerts.end}}

    By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain performance improvements and bug fixes introduced in v20.2. After finalization, however, it will no longer be possible to perform a downgrade to v20.1. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade.

    We recommend disabling auto-finalization so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade:

	1. Get a shell into one of the pods and start the CockroachDB [built-in SQL client](cockroach-sql.html):

	    {% include copy-clipboard.html %}
	    ~~~ shell
	    $ kubectl exec -it cockroachdb-2 \
	    -- ./cockroach sql \
	    --certs-dir cockroach-certs
	    ~~~

    1. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html) to the version you are upgrading from:

        {% include copy-clipboard.html %}
        ~~~ sql
        > SET CLUSTER SETTING cluster.preserve_downgrade_option = '20.1';
        ~~~

    1. Exit the SQL shell and pod:

        {% include copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~

1. Open and edit `example.yaml`.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ vi cockroach-operator/examples/example.yaml
    ~~~

1. Change the desired Docker image:

	~~~
	image:
  	  name: cockroachdb/cockroach:{{page.release_info.version}}
  	~~~

1. Apply `example.yaml` with the new image:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f cockroach-operator/examples/example.yaml
    ~~~

    The Operator will perform the staged update.

1. If you then check the status of your cluster's pods, you should see them being restarted:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME            READY     STATUS        RESTARTS   AGE
    cockroachdb-0   1/1       Running       0          2m
    cockroachdb-1   1/1       Running       0          2m
    cockroachdb-2   1/1       Running       0          2m
    cockroachdb-3   0/1       Terminating   0          1m
    ...
    ~~~