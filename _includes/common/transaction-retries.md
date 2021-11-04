{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
{% else %}
  {% assign link_prefix = "" %}
{% endif %}

## Transaction Retries

When several transactions are trying to modify the same underlying data concurrently, they may experience [contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) that leads to [transaction retries]({{ link_prefix }}transactions.html#transaction-retries). In order to avoid failures in production, your application should be engineered to handle transaction retries using [client-side retry handling]({{ link_prefix }}transactions.html#client-side-intervention).