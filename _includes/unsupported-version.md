{% assign x = site.data.versions | where_exp: "m", "m.major_version == include.major_version" | first %}
{% unless x.maint_supp_exp_date == "N/A" or x.asst_supp_exp_date == "N/A" %}
  {% assign today = "today" | date: "%s" %} {% comment %} Fetch today's date and format it in seconds. {% endcomment %}
  {% assign m = x.maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
  {% assign a = x.asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
  {% if page.version and a < today %} {% comment %} If the assistance support expiration date has passed, show the unsupported message. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    CockroachDB {{ include.major_version }} is no longer supported. For more details, see the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% elsif page.version and a >= today and m < today %} {% comment %} If the maintenance support expiration has passed but the version is still within the assistance support period, show this message and pass the assistance support expiration date. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, see the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% endif %}
{% endunless %}
