{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["cloud"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}
