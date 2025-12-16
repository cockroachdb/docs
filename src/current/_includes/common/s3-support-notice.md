{% if page.path contains "cockroachcloud" %}
{{ site.data.alerts.callout_danger }}
Cockroach Labs does not officially support S3-compatible storage solutions other than AWS S3, Google Cloud Storage (GCS), and Azure Blob Storage. Some common compatibility issues may be fixed by adding the `AWS_SKIP_CHECKSUM` option to the S3 URLs.

The [Cockroach Labs Support team]({% link {{ site.current_cloud_version }}/support-resources.md %}) is available to offer assistance where possible. If you encounter issues when using unsupported S3-compatible storage, drivers, or frameworks, contact the maintainer directly.
{{ site.data.alerts.end }}
{% else %}
{{ site.data.alerts.callout_danger }}
Cockroach Labs does not officially support S3-compatible storage solutions other than AWS S3, Google Cloud Storage (GCS), and Azure Blob Storage.{% if page.version.version !="v24.1" %} Some common compatibility issues may be fixed by adding the `AWS_SKIP_CHECKSUM` option to the S3 URLs.{% endif %}.


The [Cockroach Labs Support team]({% link {{page.version.version}}/support-resources.md %}) is available to offer assistance where possible. If you encounter issues when using unsupported S3-compatible storage, drivers, or frameworks, contact the maintainer.
{{ site.data.alerts.end }}
{% endif %}