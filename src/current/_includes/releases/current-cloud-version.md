{% assign smv = site.data.releases | where_exp: "smv", "smv.release_name == site.current_serverless_hotfix" | map: "major_version" %}
{% assign dmv = site.data.releases | where_exp: "dmv", "dmv.release_name == site.current_dedicated_hotfix" | map: "major_version" %}

{{site.data.alerts.callout_version}}
As of {{ site.current_cloud_date | date: "%B %e, %Y" }}, CockroachDB {{ site.data.products.serverless }} clusters are running CockroachDB [{{ site.current_serverless_hotfix }}]({% link releases/{{ smv }}.md %}#{{ site.current_serverless_hotfix | replace: ".", "-" }}) and new CockroachDB {{ site.data.products.dedicated }} clusters are running CockroachDB [{{ site.current_dedicated_hotfix }}]({% link releases/{{ dmv }}.md %}#{{ site.current_dedicated_hotfix | replace: ".", "-" }}).
{{site.data.alerts.end}}
