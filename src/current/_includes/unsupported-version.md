{% assign x = site.data.versions | where_exp: "m", "m.major_version == include.major_version" | first %}
{% unless x.maint_supp_exp_date == "N/A" or x.asst_supp_exp_date == "N/A" %}{% comment %}Not yet GA{% endcomment %}
  {% assign today = "today" | date: "%s" %} {% comment %} Fetch today's date and format it in seconds. {% endcomment %}
  {% assign m = x.maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
  {% assign a = x.asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
  {% unless x.lts_maint_supp_exp_date == "N/A" or x.lts_asst_supp_exp_date == "N/A" %}{% comment %}No LTS releases{% endcomment %}
    {% assign lm = x.lts_maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
    {% assign la = x.lts_asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
  {% endunless %}
{% endunless %}

  {% if la < today %} {% comment %} If the LTS assistance support expiration date has passed, show the unsupported message. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    CockroachDB {{ include.major_version }} (LTS) is no longer supported as of {{ x.lts_asst_supp_exp_date | date: "%B %e, %Y"}}. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% elsif la >= today and lm < today %}{% comment %} If the LTS maintenance support expiration has passed but the version is still within the LTS assistance support period, show this message and pass the LTS assistance support expiration date. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    Cockroach Labs will stop providing <strong>LTS Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% elsif a < today and lm > today %} {% comment %} If the assistance support expiration date has passed but the LTS maintenance phase has not {% endcomment %}
    {% if la > today %}
    {{site.data.alerts.callout_danger}}
    GA releases for CockroachDB {{ include.major_version }} are no longer supported. Cockroach Labs will stop providing <strong>LTS Assistance Support</strong> for {{ include.major_version }} LTS releases on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
    {% endif %}
   {% elsif a < today %}{% comment %}show the unsupported message. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    CockroachDB {{ include.major_version }} is no longer supported as of {{ x.asst_supp_exp_date | date: "%B %e, %Y"}}. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% elsif a >= today and m < today %} {% comment %} If the maintenance support expiration has passed but the version is still within the assistance support period, show this message and pass the assistance support expiration date. {% endcomment %}
    {{site.data.alerts.callout_danger}}
    Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
    {{site.data.alerts.end}}
  {% endif %}
