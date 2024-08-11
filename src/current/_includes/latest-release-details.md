{% comment %}
  This is included by v24.2+ install-cockroachdb-*.md upgrade-cockroach-version.md
{% endcomment %}

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | first %}
{% assign latest = site.data.releases | where_exp: "latest", "latest.major_version == page.version.version" | sort: "release_date" | last %}

{% assign released = false %}
{% assign skippable = false %}
{% if rd.release_date != "N/A" and rd.maint_supp_exp_date != "N/A" %}
    {% assign released = true %}
    {% if rd.asst_supp_exp_date == "N/A" %}
        {% assign skippable = true %}
    {% endif %}
{% endif %}

CockroachDB {{ latest.major_version }} is the latest [supported]({% link releases/release-support-policy.md %}) production release.{% if skippable == true %} It is an [Innovation release]({% link releases/release-support-policy.md %}#innovation-releases) that is optional for CockroachDB {{ site.data.products.dedicated }} and CockroachDB {{ site.data.products.core }} but required for CockroachDB {{ site.data.products.serverless }}.{% else %} It is a required [Regular release]({% link releases/release-support-policy.md %}#regular-releases).{% endif %} To learn more, refer to [CockroachDB {{ latest.major_version }} Release Notes](https://cockroachlabs.com/docs/releases/{{ latest.major_version }}.html).

{% if page.version.version != blank and page.version.version != latest.major_version %}
**This page refers to CockroachDB {{ page.version.version }}, not {{ latest.major_version }}.**
{% endif %}
