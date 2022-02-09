{% capture a_raw %}
{{ site.data.versions | where_exp: "m", "m.major_version == page.version.version" | map: "asst_supp_exp_date" }}
{% endcapture %}

{% assign a = a_raw | date: "%B %d, %Y" %}

{{site.data.alerts.callout_danger}}
Cockroach Labs will stop providing <strong>Assistance Support</strong> for this version on <strong>{{ a }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, see the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
{{site.data.alerts.end}}
