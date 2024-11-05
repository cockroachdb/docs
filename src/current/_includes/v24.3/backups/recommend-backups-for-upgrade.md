{% if page.path contains "cockroachcloud" %}
[Managed backups]({% link cockroachcloud/managed-backups.md %}) are automated backups of CockroachDB {{ site.data.products.cloud }} clusters that are stored by Cockroach Labs in cloud storage. By default, Cockroach Labs takes and retains managed backups in all Cloud clusters.

When upgrading to a major release, you can optionally [take a self-managed backup]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) of your cluster to your own cloud storage, as an extra layer of protection in case the upgrade leads to issues.
{% else %}
CockroachDB is designed with high fault tolerance. However, taking regular backups of your data is an operational best practice for [disaster recovery]({% link {{ page.version.version }}/disaster-recovery-planning.md %}) planning.

When upgrading to a new major version, **we recommend [taking a self-managed backup]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) of your cluster** so that you can [restore the cluster to the previous version]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}#support-for-restoring-backups-into-a-newer-version) if the upgrade leads to issues.
{% endif %}
