When a cluster is deleted, Cockroach Labs will retain the managed backups for for the {% if page.name == "managed-backups.md" %} configured retention time, {% else %} [configured retention time]({% link cockroachcloud/managed-backups.md %}#managed-backup-settings), {% endif %}after which the backups will be deleted.

If a customer’s agreement with Cockroach Labs has terminated, all managed backups will be retained for a maximum of 30 days and then deleted. If a backup's retention time was set to **less** than 30 days, Cockroach Labs will retain the managed backups for the configured retention time, after which the backups will be deleted.

To restore a backup from a deleted cluster, you must contact the [Cockroach Labs Support team]({% link {{site.current_cloud_version}}/support-resources.md %}).