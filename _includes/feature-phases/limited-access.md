{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
{% elsif page.security == true %}
  {% capture link_prefix %}../{% endcapture %}
{% else %}
  {% assign link_prefix = "" %}
{% endif %}

**This feature is in [limited access]({{link_prefix}}cockroachdb-feature-availability.html)** and is only available to enrolled organizations. To enroll your organization, contact your Cockroach Labs account team. This feature is subject to change.
