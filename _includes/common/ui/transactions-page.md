{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["cloud"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

For an example of querying the statistics table, see [Example]({{ page_prefix}}statements-page.html#example).

{{site.data.alerts.callout_success}}
If you haven't yet executed any transactions in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}
