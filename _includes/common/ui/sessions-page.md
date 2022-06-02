{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

## Sessions table

Use the **Sessions** table to see the open sessions in the cluster. This table includes active and idle sessions. A session is *active* if it has an open transaction (including implicit transactions, which are individual SQL statements), and *idle* if it has no open transaction. Active sessions consume hardware resources.
