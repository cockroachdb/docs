{% assign base_url = "https://www.cockroachlabs.com/docs/" %}
{% if page.path contains "cockroachcloud/" or site.baseurl contains "/cockroachcloud" %}
  {% assign link_version = "stable" %}
{% else %}
  {% assign link_version = page.version.version %}
{% endif %}

**This feature is in [limited access]({{base_url}}{{link_version}}/cockroachdb-feature-availability.html)** and is only available to enrolled organizations. To enroll your organization, contact your Cockroach Labs account team. This feature is subject to change.
