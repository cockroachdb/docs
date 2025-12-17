You may also want to configure the [managed backup]({% link "cockroachcloud/managed-backups.md" %}) settings your CockroachDB {{ site.data.products.standard }} cluster takes automatically. To do so, include the `backup_config` attribute in the `cockroach_cluster` resource:

    {% include "copy-clipboard.html" %}
    ~~~ hcl
    backup_config = {
        enabled           = true
        frequency_minutes = 60
        retention_days    = 30
    }
    ~~~

    {{site.data.alerts.callout_info}}
    You can modify the [retention]({% link "cockroachcloud/managed-backups.md" %}#retention) of managed backups only once with one of the following: the [Cloud Console]({% link "cockroachcloud/managed-backups.md" %}#cloud-console), the [Cloud API]({% link "cockroachcloud/managed-backups.md" %}#cloud-api), or Terraform. To modify the setting again, contact the [Cockroach Labs Support team]({% link "{{site.current_cloud_version}}/support-resources.md" %}).
    {{site.data.alerts.end}}

    For details on the `backup_config` settings, refer to [Managed Backups]({% link "cockroachcloud/managed-backups.md" %}#cockroachdb-cloud-terraform-provider).