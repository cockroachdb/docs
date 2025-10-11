{% if page.name == "managed-backups-basic.md" %}
You can use the [CockroachDB Cloud API]({% link cockroachcloud/cloud-api.md %}) to [view managed backups](#view-managed-backups) or [restore clusters](#restore-from-a-managed-backup) from a managed backup.
{% else if page.name == "managed-backups.md"  %}
You can use the [CockroachDB Cloud API]({% link cockroachcloud/cloud-api.md %}) to [view](#get-information-on-backup-settings) and [modify managed backup settings](#modify-backup-settings-on-a-cluster), [view managed backups](#view-managed-backups), or [restore clusters](#restore-from-a-managed-backup) from a managed backup.
{% else %}
You can use the [CockroachDB Cloud API]({% link cockroachcloud/cloud-api.md %}) to [view](#get-information-on-backup-settings) and [modify managed backup settings](#modify-backup-settings-on-a-cluster), [view managed backups](#view-managed-backups), or [restore clusters/databases/tables](#restore-from-a-managed-backup) from a managed backup.
{% endif %}

{{site.data.alerts.callout_info}}
The [service account]({% link cockroachcloud/authorization.md %}#service-accounts) associated with the secret key must have the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) role.
{{site.data.alerts.end}}