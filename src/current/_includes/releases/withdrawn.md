{% if release.withdrawn == "true" %}
{{site.data.alerts.callout_danger}}
This patch release has been withdrawn{% if include.advisory_key %} due to [this technical advisory](https://www.cockroachlabs.com/docs/advisories/{{ include.advisory_key }}){% endif %}. We've removed the links to the downloads and Docker image.All the changes listed as part of this release will be in the next release. Do not upgrade to this release.
{{site.data.alerts.end}}
{% endif %}
