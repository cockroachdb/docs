{% if page.path contains "cockroachcloud" %}
{{ site.data.alerts.callout_info }}
Cockroach Labs tests functionality with AWS S3, Google Cloud Storage (GCS), and Azure Blob Storage. Other S3-compatible storage solutions may work, and common compatibility issues may be fixed by adding the `AWS_SKIP_CHECKSUM` option to the S3 URLs.

However, Cockroach Labs does not support untested storage systems. Contact the [Cockroach Labs Support team]({% link {{ site.current_cloud_version }}/support-resources.md %}) for more information.
{{ site.data.alerts.end }}
{% else %}
{{ site.data.alerts.callout_info }}
Cockroach Labs tests functionality with AWS S3, Google Cloud Storage (GCS), and Azure Blob Storage. Other S3-compatible storage solutions may work{% if page.version.version !="v24.1" %}, and common compatibility issues in v24.3 and later may be fixed by adding the `AWS_SKIP_CHECKSUM` option to the S3 URLs{% endif %}.

However, Cockroach Labs does not support untested storage systems. Contact the [Cockroach Labs Support team]({% link {{page.version.version}}/support-resources.md %}) for more information.
{{ site.data.alerts.end }}
{% endif %}