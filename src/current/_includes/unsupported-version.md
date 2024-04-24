{% assign x = site.data.versions | where_exp: "m", "m.major_version == include.major_version" | first %}
{% unless x.maint_supp_exp_date == "N/A" or x.asst_supp_exp_date == "N/A" %}
  {% assign today = "today" | date: "%s" %} {% comment %} Fetch today's date and format it in seconds. {% endcomment %}
  {% assign m = x.maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
  {% assign a = x.asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
  {% assign lm = x.lts_maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
  {% assign la = x.lts_asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}

  {% if la < today %} {% comment %} If the LTS assistance support expiration date has passed, show the unsupported message. {% endcomment %}
    {% unless la == "N/A" %}
    {{site.data.alerts.callout_danger}}
    CockroachDB {{ include.major_version }} (LTS) is no longer supported as of {{ x.lts_asst_supp_exp_date | date: "%B %e, %Y"}}. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
    {% endunless %}
  {% elsif la >= today and lm < today %}{% comment %} If the LTS maintenance support expiration has passed but the version is still within the LTS assistance support period, show this message and pass the LTS assistance support expiration date. {% endcomment %}
    {% unless la == "N/A" or lm == "N/A" %}
    {{site.data.alerts.callout_danger}}
    Cockroach Labs will stop providing <strong>LTS Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
    {% endunless %}
  {% elsif a < today %} {% comment %} If the assistance support expiration date has passed, show the unsupported message. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    CockroachDB {{ include.major_version }} is no longer supported as of {{ x.asst_supp_exp_date | date: "%B %e, %Y"}}. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% elsif a >= today and m < today %} {% comment %} If the maintenance support expiration has passed but the version is still within the assistance support period, show this message and pass the assistance support expiration date. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% endif %}
{% endunless %}
