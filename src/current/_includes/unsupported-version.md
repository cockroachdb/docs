{% assign DEBUG=false %}
{% unless include.major_version %}
Missing include.major_version. Usage: <code>{% raw %}{% include unsupported-version.md major_version=page.major_version %}{% endraw %}</code>
{% break %}
{% endunless %}
{% if DEBUG %}Major version: {{ include.major_version }}<br />{% endif %}

{% comment %}To test, comment this line and uncomment the today and actual_today variables below{% endcomment %}
{% assign today = "today" | date: "%s" %}{% comment %} Simulate future date and format it in seconds. {% endcomment %}

{% comment %} Some dates to test:
2025-11-14: 23.1 LTS EOL (LTS EOL message)
2025-11-13: 23.1 LTS Assistance (LTS Assistance message)
2024-11-13: 23.1 LTS Maintenance (LTS Assistance message)
2024-11-12: 23.1 LTS GA (no message)

The date logic in this file can be confusing. Read it like this:
{% if today > la %}...{% endif %} = "If today is after (larger than) la"
{% if today <= la %}...{% endif %} +If today is la or earlier (smaller)"
{% endcomment %}

{% comment %}Uncomment the following two lines and comment the third to test a specific date{% endcomment %}
{% comment %}{% assign today = '2024-11-13' | date: "%s" %}{% endcomment %}
{% comment %}{% assign actual_today = "today" | date: "%s" %}{% endcomment %}

{% if DEBUG %}
  {% if actual_today %}Actual today: {{ actual_today }}<br />{% endif %}
Today: {{ today }}<br />
Today date: {{ today | date: "%Y-%m-%d" }} <br />
{% endif %}

{% assign x = site.data.versions | where_exp: "m", "m.major_version == include.major_version" | first %}

{% comment %}Continue only if we found an entry for this major version {% endcomment %}
{% if x %}

  {% if DEBUG %}Major version object: {{ x }}<br />{% endif %}

  {% assign production = false %}
  {% assign lts = false %}
  {% if DEBUG %}GA Maintenance support date: {{ x.maint_supp_exp_date }}<br />GA Assistance support date: {{ x.asst_supp_exp_date }}<br />{% endif %}

  {% comment %}Is it GA?{% endcomment %}
  {% if x.asst_supp_exp_date != "N/A" and x.asst_supp_exp_date != "N/A" %}
    {% assign production = true %}
    {% assign m = x.maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
    {% assign a = x.asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
  {% endif %}

  {% if production == true %}
    {% comment %}Is it an LTS?{% endcomment %}
    {% if x.initial_lts_patch != "N/A" %}
      {% assign lts = true %}
      {% assign lm = x.lts_maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
      {% assign la = x.lts_asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
    {% endif %}
  {% endif %}

  {% if DEBUG %}LTS maintenance support date: {{ x.lts_maint_supp_exp_date }}<br />LTS assistance support date: {{ x.lts_asst_supp_exp_date }}<br />
  {% endif %}

{% comment %}Save the admonitions into variables
             The logic wrappers here make the variable empty
             if the condition is false. The logic where these variables are used chooses which one of these variables to show, if any.
 {% endcomment %}
{% capture lts_eol_message %}
      {% if today > la %}
      {{site.data.alerts.callout_danger}}
      As of {{ x.lts_asst_supp_exp_date | date: "%B %e, %Y"}}, CockroachDB {{ include.major_version }} is no longer supported. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
      {% endif %}
{% endcapture %}

{% capture lts_assistance_message %}
      {% if today > lm %}
      {{site.data.alerts.callout_danger}}
      Maintenance Support for LTS releases ended on {{ x.lts_maint_supp_exp_date | date: "%B %e, %Y" }}{% if today >= a %}, and GA releases of CockroachDB are no longer supported{% endif %}. Cockroach Labs will stop providing <strong>Assistance Support</strong> for LTS releases of {{ include.major_version }} on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
      {% endif %}
{% endcapture %}

{% capture lts_maintenance_message %}
      {% if today >= lm %}
      {{site.data.alerts.callout_danger}}
      As of {{ x.lts_maint_supp_exp_date | date: "%B %e, %Y" }}, LTS releases of CockroachDB {{ x.major_version }} releases are in <strong>Maintenance Support</strong>{% if today > a %} and GA releases of CockroachDB {{ include.major_version }} are no longer supported.{% endif %}. Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} LTS on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>
      {{site.data.alerts.end}}
      {% endif %}
{% endcapture %}

{% capture ga_eol_message %}
      {% if today > a %}
      {{site.data.alerts.callout_danger}}
      As of {{ x.asst_supp_exp_date | date: "%B %e, %Y"}}, CockroachDB {{ include.major_version }} is no longer supported. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
      {% endif %}
{% endcapture %}

{% capture ga_assistance_message %}
      {% if today > m %}
      {{site.data.alerts.callout_danger}}
      As of {{ x.maint_supp_exp_date | date: "%B %e, %Y" }}, Maintenance support for {{ include.major_version }} has ended, and Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
      {% endif %}
{% endcapture %}

{% capture ga_maintenance_message %}
      {% if today <= m and today > a %}
      {{site.data.alerts.callout_danger}}
      As of <strong>{{ x.maint_supp_exp_date | date: "%B %e, %Y" }}</strong>, {{ include.major_version }} releases are in <strong>Maintenance Support</strong>. Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
      {{site.data.alerts.end}}
      {% endif %}
{% endcapture %}

  {% comment %}Show unsupported admonitions only for production releases {% endcomment %}
  {% if production == true %}
    {% comment %}Show LTS admonitions only for versions with LTS releases {% endcomment %}
    {% if lts == true %}

      {% if DEBUG %}lts: {{ lts }}<br />production: {{ production }}<br />lm: {{ lm }}<br />la: {{ la }}<br />m: {{ m }}<br />a: {{ a }}<br />{% endif %}

      {% comment %} LTS date validation will stop processing the include early {% endcomment %}
      {% if la <= lm %}
        Error: LTS assistance date must be after LTS maintenance date. Giving up.
        {% break %}
      {% endif %}
      {% if la <= a or la <= m %}
        Error: LTS assistance date must be after GA assistance and maintenance dates. Giving up.
        {% break %}
      {% endif %}

      {% comment %}Show LTS Maintenance message from the start of LTS maintance until LTS Assistance,
                   then show the LTS assistance message until EOL{% endcomment %}
      {% if today > la %} {% comment %}LTS assistance has passed, EOL{% endcomment %}
          {{ lts_eol_message }}
      {% else %}{% comment %}LTS assistance has not passed {% endcomment %}
        {% if today > lm %} {% comment %}After LTS maintenance{% endcomment %}
          {{ lts_assistance_message }}
        {% elsif today > m and today <= lm %}{% comment %}GA maintenance has passed, in LTS maintenance{% endcomment %}
          {{ lts_maintenance_message }}
        {% endif %}{% comment %}If GA maintenance hasn't passed, show nothing{% endcomment %}
      {% endif %}

    {% comment %}Show non-LTS admonitions only releases without LTS {% endcomment %}
    {% else %}

      {% comment %} GA date validation will stop processing the include early {% endcomment %}
      {% if a <= m %}
        Error: Assistance date must be after Maintenance date. Check _data/versions.csv. Giving up.
        {% break %}
      {% endif %}
      {% if DEBUG %}production: {{ production }}<br />m: {{ m }}<br />a: {{ a }}<br />{% endif %}

      {% comment %}Show Assistance message from the start of maintance until EOL{% endcomment %}
      {% if today > a %} {% comment %}assistance has passed, EOL{% endcomment %}
        {{ ga_eol_message }}
      {% else %}
        {% if today > m %} {% comment %}maintenance has ended{% endcomment %}
        {{ ga_assistance_message }}
        {% elsif today <= m %}
        {{ ga_maintenance_message }}
        {% endif %}
      {% endif %}
    {% endif %}

  {% endif %}
{% endif %}
