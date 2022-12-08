{% assign smv = site.data.releases | where_exp: "smv", "smv.version == site.current_serverless_hotfix" | map: "major_version" %}
{% assign dmv = site.data.releases | where_exp: "dmv", "dmv.version == site.current_dedicated_hotfix" | map: "major_version" %}

{{site.data.alerts.callout_version}}
As of {{ site.current_cloud_date | date: "%B %e, %Y" }}, {{ site.data.products.serverless }} clusters are running CockroachDB [{{ site.current_serverless_hotfix }}]({{ smv }}.html#{{ site.current_serverless_hotfix | replace: ".", "-" }}) and new {{ site.data.products.dedicated }} clusters are running CockroachDB [{{ site.current_dedicated_hotfix }}]({{ dmv }}.html#{{ site.current_dedicated_hotfix | replace: ".", "-" }}).
{{site.data.alerts.end}}