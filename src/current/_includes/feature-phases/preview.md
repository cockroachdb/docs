{% assign base_url = "https://www.cockroachlabs.com/docs/" %}
{% if page.path contains "cockroachcloud/" or site.baseurl contains "/cockroachcloud" %}
  {% assign link_version = "stable" %}
{% else %}
  {% assign link_version = page.version.version %}
{% endif %}

**This feature is in [preview]({{base_url}}{{link_version}}/cockroachdb-feature-availability.html).** This feature is subject to change. To share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/hc/en-us).