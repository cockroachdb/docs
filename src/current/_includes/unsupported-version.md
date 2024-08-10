{% comment %}Set to true to enable debug output on the page{% endcomment %}
{% assign DEBUG=false %}

{% unless include.major_version %}
Missing include.major_version. Usage: <code>{% raw %}{% include unsupported-version.md major_version=page.major_version %}{% endraw %}</code>
{% break %}
{% endunless %}

{% comment %}To test, comment this line and uncomment the today and actual_today variables below{% endcomment %}
{% assign today = "today" | date: "%s" %}{% comment %} Simulate future date and format it in seconds. {% endcomment %}

{% comment %} Some LTS dates to test:
2025-11-14: 23.1 LTS EOL (LTS EOL message)
2025-11-13: 23.1 LTS Assistance (LTS Assistance message)
2024-11-13: 23.1 LTS Maintenance (LTS Assistance message)
2024-11-12: 23.1 LTS GA (no message)

The date logic in this file can be confusing. Read it like this:
{% if today > la %}...{% endif %} = "If today is after (larger than) la"
{% if today <= la %}...{% endif %} +If today is la or earlier (smaller)"
{% endcomment %}

{% comment %}Uncomment the following two lines and comment the third to test a specific date{% endcomment %}
{% assign today = '2025-08-13' | date: "%s" %}
{% assign actual_today = "today" | date: "%s" %}

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
  {% assign skippable = false %}
  {% assign lts = false %}

  {% comment %}Is it GA?{% endcomment %}
  {% if x.release_date != "N/A" and x.maint_supp_exp_date != "N/A" %}
    {% assign production = true %}
    {% assign m = x.maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}

    {% comment %}Is it skippable?{% endcomment %}
    {% comment %}Skippable releases have no assistance period{% endcomment %}
    {% if x.asst_supp_exp_date == "N/A" %}
      {% assign skippable = true %}

    {% else %}
      {% assign a = x.asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}
      {% comment %} GA date validation will stop processing the include early {% endcomment %}
      {% if a <= m %}
        Error: Assistance date must be after Maintenance date. Check _data/versions.csv. Giving up.
        {% break %}
      {% endif %}
      {% if x.asst_supp_exp_date == "N/A" %}
        Required production releases must have asst_supp_exp_date set to a date. Giving up. Check versions.csv.
      {% break %}
  {% endif %}
    {% endif %}
  {% endif %}

  {% comment %}Required production releases may be LTS{% endcomment %}
  {% if production == true and
        x.lts_maint_supp_exp_date != "N/A" and
        x.lts_asst_supp_exp_date != "N/A" and
        x.initial_lts_release_date != "N/A" and
        x.initial_lts_patch != "N/A" and
        skippable == false %}
    {% assign lts = true %}
    {% assign lm = x.lts_maint_supp_exp_date | date: "%s" %} {% comment %} Format m_raw in seconds. {% endcomment %}
    {% assign la = x.lts_asst_supp_exp_date | date: "%s" %} {% comment %} Format a_raw in seconds. {% endcomment %}

    {% comment %} LTS date validation will stop processing the include early {% endcomment %}
    {% if la <= lm %}
    Error: LTS assistance date must be after LTS maintenance date. Giving up.
      {% break %}
    {% endif %}
    {% if la <= a or la <= m %}
    Error: LTS assistance date must be after GA assistance and maintenance dates. Giving up.
      {% break %}
    {% endif %}
  {% endif %}

  {% if DEBUG %}
  include.major_version: {{ include.major_version }}<br />
  Production: {{ production }}<br />
  Maintenance support date: {{ x.maint_supp_exp_date }}<br />
  m: {{ m }}<br />
  skippable: {{ skippable }}<br />
  {% if skippable == false %}Assistance support date: {{ x.asst_supp_exp_date }}<br />
  a: {{ a }}<br />{% endif %}
  LTS: {{ lts }}<br />
  {% if lts == true %}LTS maintenance support date: {{ x.lts_maint_supp_exp_date }}<br />
  LTS assistance support date: {{ x.lts_asst_supp_exp_date }}<br />la: {{ la }}<br />lm: {{ lm }}<br />{% endif %}
  {% endif %}

  {% comment %}LTS releases starting with v23.1{% endcomment %}

  {% if production == true %}
    {% if lts == true %}
      {% if today > la %} {% comment %}LTS assistance has passed, EOL{% endcomment %}

        {{site.data.alerts.callout_danger}}
        As of {{ x.lts_asst_supp_exp_date | date: "%B %e, %Y"}}, CockroachDB {{ include.major_version }} is no longer supported. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
        {{site.data.alerts.end}}

      {% elsif today > lm %} {% comment %}After LTS maintenance{% endcomment %}

        {{site.data.alerts.callout_danger}}
        Maintenance Support for {{ include.major_version }} LTS releases ended on {{ x.lts_maint_supp_exp_date | date: "%B %e, %Y" }}{% if today >= a %}, and GA releases prior to {{ x.initial_lts_patch }} are no longer supported{% endif %}. Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} LTS on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
        {{site.data.alerts.end}}

      {% elsif today <= lm %}{% comment %}In LTS maintenance. Check for GA assistance is in the admonition {% endcomment %}

        {{site.data.alerts.callout_danger}}
        As of {{ x.lts_maint_supp_exp_date | date: "%B %e, %Y" }}, LTS releases of CockroachDB {{ include.major_version }} releases are in <strong>Maintenance Support</strong>{% if today > a %} and GA releases of CockroachDB {{ include.major_version }} are no longer supported{% endif %}. Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} LTS on <strong>{{ x.lts_asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>
        {{site.data.alerts.end}}

      {% endif %}{% comment %}If GA maintenance hasn't passed, show nothing{% endcomment %}

    {% comment %}Innovation releases starting from v24.2{% endcomment %}
    {% elsif lts == false and skippable == true %}

      {% if DEBUG %}today: {{ today }}<br />m: {{ m }}<br />{% endif %}

      {% if today > m %}
        {{site.data.alerts.callout_danger}}
        As of {{ x.maint_supp_exp_date | date: "%B %e, %Y"}}, CockroachDB {{ include.major_version }} is no longer supported. Optional innovation releases are not eligible for Assistance Support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
        {{site.data.alerts.end}}
      {% endif %}

    {% comment %}Non-LTS non-skippable, prior to v23.1{% endcomment %}
    {% elsif lts == false and skippable == false %}

      {% comment %}Show Assistance message from the start of maintance until EOL{% endcomment %}
      {% if today > a %} {% comment %}assistance has passed, EOL{% endcomment %}

        {{site.data.alerts.callout_danger}}
        As of {{ x.asst_supp_exp_date | date: "%B %e, %Y"}}, CockroachDB {{ include.major_version }} is no longer supported. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
        {{site.data.alerts.end}}

      {% elsif today > m and today <= a %} {% comment %}maintenance has ended{% endcomment %}

        {{site.data.alerts.callout_danger}}
        As of {{ x.maint_supp_exp_date | date: "%B %e, %Y" }}, Maintenance support for {{ include.major_version }} has ended, and Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
        {{site.data.alerts.end}}

      {% elsif today <= m %}

        {{site.data.alerts.callout_danger}}
        As of <strong>{{ x.maint_supp_exp_date | date: "%B %e, %Y" }}</strong>, {{ include.major_version }} releases are in <strong>Maintenance Support</strong> and Cockroach Labs will stop providing <strong>Assistance Support</strong> for {{ include.major_version }} on <strong>{{ x.asst_supp_exp_date | date: "%B %e, %Y" }}</strong>. Prior to that date, upgrade to a more recent version to continue receiving support. For more details, refer to the <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy.html">Release Support Policy</a>.
        {{site.data.alerts.end}}
      {% endif %}

    {% else %}
      Error: We should never hit this condition. Report this issue to #docs.<br />
      {% if DEBUG %}
        Production: {{ production }}<br />
        Maintenance support date: {{ x.maint_supp_exp_date }}<br />
        m: {{ m }}<br />
        Skippable: {{ skippable }}<br />
        Assistance support date: {{ x.asst_supp_exp_date }}<br />
        a: {{ a }}<br />
        LTS: {{ lts }}<br />
        LTS maintenance support date: {{ x.lts_maint_supp_exp_date }}<br />
        LTS assistance support date: {{ x.lts_asst_supp_exp_date }}<br />
        la: {{ la }}<br />
        lm: {{ lm }}<br />
      {% endif %}
      {% break %}
    {% endif %}
  {% endif %}{% comment %}end production=true branch{% endcomment %}
{% endif %}{% comment %}End branch to process x object{% endcomment %}
