- Physical cluster replication is supported in:
    - CockroachDB {{ site.data.products.core }} clusters on v23.2 or later. The primary cluster can be a [new]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-1-create-the-primary-cluster) or [existing]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#set-up-pcr-from-an-existing-cluster) cluster. The standby cluster must be a [new cluster started with the `--virtualized-empty` flag]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-2-create-the-standby-cluster).
    - [CockroachDB {{ site.data.products.advanced }} clusters]({% link cockroachcloud/physical-cluster-replication.md %}) on v24.3 or later.
- In CockroachDB {{ site.data.products.core }}, the primary and standby clusters must have the same [zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) in order to respect data placement configurations.

