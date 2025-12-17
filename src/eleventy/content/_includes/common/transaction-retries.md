{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
{% else %}
  {% assign link_prefix = "" %}
{% endif %}

## Transaction retries

When several transactions try to modify the same underlying data concurrently, they may experience [contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) that leads to [transaction retries]({{ link_prefix }}transactions.html#transaction-retries). To avoid failures in production, your application should be engineered to handle transaction retries using [client-side retry handling]({{ link_prefix }}transactions.html#client-side-intervention).
