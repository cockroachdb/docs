You can move an existing CockroachDB {{ site.data.products.cloud }} cluster's contents to a new cluster by creating a self-managed backup and restoring the backup in the new cluster.

{{ site.data.alerts.callout_danger }}
This method of migration requires a period of downtime during which application traffic to the cluster must be stopped. If minimal downtime on the cluster is a requirement, contact the [Cockroach Labs Support team]({% link {{site.current_cloud_version}}/support-resources.md %}).
{{ site.data.alerts.end }}

To move to a new {% if page.name == "change-plan-between-basic-and-standard.md" %}{{ site.data.products.standard }} {% endif %}cluster, follow these steps:

1. Create a [full backup]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}#full-backup) of the source cluster if a self-managed backup of the cluster does not already exist. If the backup storage is in AWS S3 or Google Cloud GCS, append `?AUTH=specified` to the storage URL.
1. Provision the [new {% if page.name == "change-plan-between-basic-and-standard.md" %}{{ site.data.products.standard }} {% endif %}cluster]({% link cockroachcloud/create-your-cluster.md %}).
1. Stop application traffic to the source cluster.
1. Perform a [final backup]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) to include any last-minute changes to data on the cluster.
1. Restore the backup into the new cluster by following [steps 2 and 3 of the restore procedure]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachdb-cloud-cluster).
1. Update application connection strings to use the new cluster.
1. Resume application traffic and monitor performance on the new cluster.
1. [Decommission the source cluster]({% link cockroachcloud/basic-cluster-management.md %}#delete-cluster).