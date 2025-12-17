{% assign major_version_numeric = page.version.version | remove_first: 'v' %}

To finalize a major-version upgrade:

1. Connect to the cluster using the SQL shell:

    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

1. Run the following command:

    {% include "copy-clipboard.html" %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
    ~~~

    A series of migration jobs runs to enable certain types of features and changes in the new major version that cannot be rolled back. These include changes to system schemas, indexes, and descriptors, and enabling certain types of improvements and new features. Until the upgrade is finalized, these features and functions will not be available and the command `SHOW CLUSTER SETTING version` will return the previous version`.

    You can monitor the process of the migration in the DB Console [Jobs page]({% link "{{ page.version.version }}/ui-jobs-page.md" %}). Migration jobs have names in the format `{{ major_version_numeric }}-{migration-id}`. If a migration job fails or stalls, Cockroach Labs can use the migration ID to help diagnose and troubleshoot the problem. Each major version has different migration jobs with different IDs.

    The amount of time required for finalization depends on the amount of data in the cluster, because finalization runs various internal maintenance and migration tasks. During this time, the cluster will experience a small amount of additional load.

    When all migration jobs have completed, the upgrade is complete.

1. To confirm that finalization has completed, check the cluster version:

    {% include "copy-clipboard.html" %}
    ~~~ sql
    > SHOW CLUSTER SETTING version;
    ~~~

    If the cluster continues to report that it is on the previous version, finalization has not completed. If auto-finalization is enabled but finalization has not completed, check for the existence of [decommissioning nodes]({% link "{{ page.version.version }}/node-shutdown.md" %}?filters=decommission#status-change) where decommission has stalled. In most cases, issuing the `decommission` command again resolves the issue. If you have trouble upgrading, [contact Support](https://cockroachlabs.com/support/hc/).
