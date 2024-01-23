{% assign smv = site.data.releases | where_exp: "smv", "smv.release_name == site.current_serverless_hotfix" | map: "major_version" %}
{% assign dmv = site.data.releases | where_exp: "dmv", "dmv.release_name == site.current_dedicated_hotfix" | map: "major_version" %}

<div class="bs-callout bs-callout--version"><div class="bs-callout__label">Current version as of {{ site.current_cloud_date | date: "%B %e, %Y" }}:</div>

- New CockroachDB {{ site.data.products.dedicated }} clusters are running CockroachDB [{{ site.current_dedicated_hotfix }}]({% link releases/{{ dmv }}.md %}#{{ site.current_dedicated_hotfix | replace: ".", "-" }}), and existing clusters can be upgraded to this version.
- CockroachDB {{ site.data.products.serverless }} clusters are running CockroachDB [{{ site.current_serverless_hotfix }}]({% link releases/{{ smv }}.md %}#{{ site.current_serverless_hotfix | replace: ".", "-" }}).
{{site.data.alerts.end}}
