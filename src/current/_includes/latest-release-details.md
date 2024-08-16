{% comment %}
  This is included by v24.2+ install-cockroachdb-*.md upgrade-cockroach-version.md
{% endcomment %}

{% assign DEBUG = false %}

{% assign latest_release = site.data.versions | where_exp: "rd", "rd.release_date != 'N/A'" | sort: "release_date" | last %}

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | first %}
{% assign latest = site.data.releases | where_exp: "latest", "latest.major_version == page.version.version" | sort: "release_date" | last %}

{% assign released = false %}
{% assign skippable = false %}
{% assign lts = false %}
{% if rd.release_date != "N/A" and rd.maint_supp_exp_date != "N/A" %}
    {% assign released = true %}
    {% if rd.asst_supp_exp_date == "N/A" %}
        {% assign skippable = true %}
    {% elsif rd.initial_lts_patch != "N/A" %}
      {% assign lts = true %}
    {% endif %}
{% endif %}

{% if DEBUG == true %}
version: {{ rd }}<br /><br />
latest release: {{ latest }}<br /><br />
page version: {{ page.version }}<br /><br />
released: {{ released }}<br />
skippable: {{ skippable }}<br />
{% endif %}

This page shows how to {% if page.name contains 'upgrade' %}upgrade to {% else %}install {% endif %}CockroachDB {{ page.version.version }}{% if its == true %}([LTS]({% link releases/release-support-policy.md %}#support-types)){% endif %}. {% if skippable == true %} It is an [Innovation release]({% link releases/release-support-policy.md %}#support-types) that is optional for CockroachDB {{ site.data.products.dedicated }} and CockroachDB {{ site.data.products.core }} but required for CockroachDB {{ site.data.products.serverless }}.{% else %} It is a required [Regular release]({% link releases/release-support-policy.md %}#support-types). To learn more, refer to [CockroachDB {{ page.version.version }} Release Notes]({% link releases/{{ page.version.version }}.md %}).{% endif %}

{% if page.version.version != blank and page.version.version != latest_release.major_version %}Note that CockroachDB [{{ latest_release.major_version }}]({% link releases/{{ latest_release.major_version }}.md %}) is the latest supported production release, not {{ page.version.version }}.{% endif %}
