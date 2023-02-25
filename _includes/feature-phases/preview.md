{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
{% else %}
  {% assign link_prefix = "" %}
{% endif %}

**This feature is in [preview]({{link_prefix}}cockroachdb-feature-availability.html).** This feature is subject to change. To share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/hc/en-us).
