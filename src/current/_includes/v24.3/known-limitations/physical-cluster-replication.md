- Physical cluster replication is supported in:
    - CockroachDB {{ site.data.products.core }} clusters on v23.2 or later. The primary cluster can be a [new]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-1-create-the-primary-cluster) or [existing]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#set-up-pcr-from-an-existing-cluster) cluster. The standby cluster must be a [new cluster started with the `--virtualized-empty` flag]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-2-create-the-standby-cluster).
    - [CockroachDB {{ site.data.products.advanced }} clusters]({% link cockroachcloud/physical-cluster-replication.md %}) on v24.3 or later.
- In CockroachDB {{ site.data.products.core }}, the primary and standby clusters must have the same [zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) in order to respect data placement configurations.
- When using the [read from standby]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}#start-up-sequence-with-read-on-standby) feature, startup of the reader virtual cluster can occasionally stall after the initial scan or after an upgrade, preventing SQL connections to the reader virtual cluster. To mitigate this issue, restart the virtual cluster service on the standby cluster's system virtual cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {reader_vc} STOP SERVICE;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {reader_vc} START SERVICE SHARED;
    ~~~

