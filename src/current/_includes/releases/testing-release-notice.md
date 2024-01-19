{% comment %}This include is used in the Releases index {% endcomment %}
{% if include.major_version.release_date == "N/A" %}{% comment %} check if a release date has been set {% endcomment %}
{{site.data.alerts.callout_info}}
The releases on this page are testing releases, not supported or intended for production environments. The new features and bug fixes noted on this page may not yet be documented across CockroachDB’s documentation.

{% include releases/testing-release-details.md %}

When a {{ include.major_version.major_version }} release becomes Generally Available, a new {{ include.major_version.major_version }}.0 section on this page will describe key features and additional upgrade considerations.
{{site.data.alerts.end}}
{% endif %}
