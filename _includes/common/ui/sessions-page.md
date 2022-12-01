{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["cloud"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

## Sessions table

Use the **Sessions** table to see active, idle, and closed sessions. A session is *active* if it has an open transaction (including implicit transactions, which are individual SQL statements), and *idle* if it has no open transaction. Active sessions consume hardware resources. A session is *closed* if it has closed the connection to CockroachDB.
