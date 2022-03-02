{% if include.major_version.release_date == "N/A" or include.major_version.release_date > today %}{% comment %} check if a release date has been set or if it's in the future {% endcomment %}
{{site.data.alerts.callout_info}}
The new features and bug fixes noted on this page are not yet documented across CockroachDB's documentation. Links on this page will direct to documentation for the [latest stable release](../releases/index.html).
{{site.data.alerts.end}}
{% endif %}
