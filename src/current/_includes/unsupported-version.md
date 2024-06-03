{% unless include.major_version %}
Missing include.major_version. Usage: <code>{% raw %}{% include unsupported-version.md major_version=page.major_version %}{% endraw %}</code>
{% break %}
{% endunless %}

{% assign today = "today" | date: "%s" %} {% comment %} Fetch today's date and format it in seconds. {% endcomment %}

{% assign x = site.data.versions | where_exp: "m", "m.major_version == include.major_version" | first %}

{% comment %}Save the admonitions into variables {% endcomment %}
{% capture lts_eol_message %}
      {{site.data.alerts.callout_danger}}
      CockroachDB {{ include.major_version }} (LTS) is no longer supported as of {{ x.lts_asst_supp_exp_date | date: "%B %e, %Y"}}. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
{% endcapture %}

{% capture lts_assistance_message %}
      {{site.data.alerts.callout_danger}}
      GA releases for CockroachDB {{ include.major_version }} are no longer supported. Cockroach Labs will stop providing <strong>LTS Assistance Support</strong> for {{ include.major_version }} LTS releases on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
{% endcapture %}

{% capture ga_eol_message %}
      {{site.data.alerts.callout_danger}}
      CockroachDB {{ include.major_version }} is no longer supported as of {{ x.asst_supp_exp_date | date: "%B %e, %Y"}}. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
{% endcapture %}

{% capture ga_assistance_message %}
      {{site.data.alerts.callout_danger}}
      Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
{% endcapture %}

{% comment %}Continue only if we found an entry for this major version {% endcomment %}
{% if x %}

  {% assign lts = false %}
  {% comment %}Is it an LTS?{% endcomment %}
  {% if x.initial_lts_patch != "N/A" %}
    {% assign lts = true %}
    {% assign lm = x.lts_maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
    {% assign la = x.lts_asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
  {% endif %}

  {% assign production = false %}
  {% comment %}Is it GA?{% endcomment %}
  {% if x.asst_supp_exp_date != "N/A" and x.asst_supp_exp_date != "N/A" %}
    {% assign production = true %}
    {% assign m = x.maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
    {% assign a = x.asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
  {% endif %}

  {% comment %}Show unsupported admonitions only for production releases {% endcomment %}
  {% if production == true %}
    {% comment %}Show LTS admonitions only for versions with LTS releases {% endcomment %}
    {% if lts == true %}

      {% if la < today %} {% comment %}LTS assistance has passed, EOL{% endcomment %}
        {{ lts_eol_message }}
      {% elsif lm < today %} {% comment %}LTS maintenance has passed, in LTS assistance{% endcomment %}
        {{ lts_assistance_message }}
      {% endif %}

    {% comment %}Show non-LTS admonitions only releases without LTS {% endcomment %}
    {% else %}

      {% if a < today %} {% comment %}assistance has passed, EOL{% endcomment %}
        {{ ga_eol_message }}
      {% elsif m < today %} {% comment %}maintenance has passed{% endcomment %}
        {{ ga_assistance_message }}
      {% endif %}
    {% endif %}

  {% endif %}
{% endif %}
