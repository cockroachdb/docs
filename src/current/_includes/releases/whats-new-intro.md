{% assign DEBUG = false %}
{% assign branched = false %}
{% assign released = false %}
{% assign old = false %}
{% assign no_highlights = false %}
{% assign skippable = false %}
{% assign will_never_have_lts = false %}
{% assign lts = false %}
{% assign install_links = '' %}

{% comment %}Early in development, a new major-version directory may not
             yet exist. Adapt some links in this situation.{% endcomment %}

{% for file in site.pages %}
  {% unless branched == true %}
    {% capture fpath %}{{ file.dir | remove:'/' }}{% endcapture %}
    {% if fpath == page.major_version %}
      {% assign branched = true %}
    {% endif %}
  {% endunless %}
{% endfor %}

{% comment %}Check if this major version has been released{% endcomment %}
{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.major_version" | first %}
{% if rd.release_date != "N/A" %}
  {% assign released = true %}
{% endif %}

{% comment %}Some old pages don't have feature highlights and won't get LTS{% endcomment %}
{% if page.major_version == 'v1.0' or
      page.major_version == 'v1.1' or
      page.major_version == 'v2.0' or
      page.major_version == 'v2.1' or
      page.major_version == 'v19.1' or
      page.major_version == 'v19.2' or
      page.major_version == 'v20.1' or
      page.major_version == 'v20.2' or
      page.major_version == 'v21.1' or
      page.major_version == 'v21.2' or
      page.major_version == 'v22.1' or
      page.major_version == 'v22.2' %}
  {% assign branched = true %}
  {% assign released = true %}
  {% assign no_highlights = true %}
  {% assign will_never_have_lts = true %}
{% endif %}

{% if page.major_version == 'v1.0' or page.major_version == 'v1.1' or page.major_version == 'v2.0' or page.major_version == 'v2.1' or page.major_version == 'v21.1' %}
  {% capture install_link %}[install CockroachDB](https://cockroachlabs.com/docs/{{ page.major_version}}/install-cockroachdb.html){% endcapture %}
  {% capture install_sentence %}After downloading a supported CockroachDB binary, learn how to {{ install_link }}.{% endcapture %}
{% elsif page.major_version == 'v19.1' or page.major_version == 'v19.2' or page.major_version == 'v20.1' or page.major_version == 'v20.2' %}
  {% capture install_link %}[install CockroachDB](https://cockroachlabs.com/docs/{{ page.major_version}}/install-cockroachdb.html){% endcapture %}
  {% capture upgrade_link %}[upgrade your cluster](https://cockroachlabs.com/docs/{{ page.major_version }}/upgrade-cockroach-version.html){% endcapture %}
  {% capture install_sentence %}After downloading a supported CockroachDB binary, learn how to {{ install_link }} or {{ upgrade_link }}.{% endcapture %}
{% else %}
  {% if branched %}
    {% capture install_link %}[install CockroachDB](/docs/{{ page.major_version }}/install-cockroachdb.html){% endcapture %}
    {% capture upgrade_link %}[upgrade your cluster](/docs/{{ page.major_version }}/upgrade-cockroach-version.html){% endcapture %}
  {% else %}
    {% capture install_link %}[install CockroachDB](/docs/dev/install-cockroachdb.html){% endcapture %}
    {% capture upgrade_link %}[upgrade your cluster](/docs/dev/upgrade-cockroach-version.html){% endcapture %}
  {% endif %}
  {% capture install_sentence %}After downloading a supported CockroachDB binary, learn how to {{ install_link }} or {{ upgrade_link }}.{% endcapture %}
{% endif %}

{% comment %}Is it skippable or LTS?{% endcomment %}

{% if include.major_version.release_date != "N/A" %}
  {% assign released = true %}
  {% if include.major_version.asst_supp_exp_date == "N/A" %}
    {% assign skippable = true %}
  {% elsif include.major_version.initial_lts_patch != "N/A" %}
    {% assign lts = true %}
  {% endif %}
{% endif %}

{% if DEBUG == true %}
include.major_version: {{ include.major_version }}<br />
page.major_version: {{ page.major_version }}<br />
branched: {{ branched }}<br />
released: {{ released }}<br />
will_never_have_lts: {{ will_never_have_lts }}<br />
lts: {{ lts }}<br />
skippable: {{ skippable }}<br />
no_highlights: {{ no_highlights }}<br />
<br />
{% endif %}

{% if released == false %}
CockroachDB {{ page.major_version }} is in active development, and the following [testing releases]({% link releases/index.md %}#release-types) are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments. When CockroachDB {{ page.major_version }} is Generally Available (GA), production releases will also be announced on this page.
{% else %}{% comment %}Begin GA-only content{% endcomment %}
  {% if skippable == true %}
CockroachDB {{ page.major_version }} is an [Innovation Release]({% link releases/release-support-policy.md %}#support-types), which is optional for CockroachDB {{ site.data.products.advanced }} and {{ site.data.products.code }}. Innovation releases including {{ page.major_version }} are unavailable for CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.basic }} clusters.
  {% else %}
CockroachDB {{ page.major_version }}{% if lts == true %} [(LTS)]({% link releases/release-support-policy.md %}#support-phases){% endif %} is a required [Regular Release]({% link releases/release-support-policy.md %}#support-types).
  {% endif %}

Refer to [Major release types]({% link releases/release-support-policy.md %}#support-types) before installing or upgrading for release timing and support details.{% if no_highlights == false and released == true %} To learn what's new in this release, refer to its [Feature Highlights](#feature-highlights).{% endif %}

On this page, you can read about changes and find downloads for all production and testing releases of CockroachDB {{ page.major_version }}{% if lts == true %}&nbsp;[(LTS)]({% link releases/release-support-policy.md %}#support-phases){% endif %}

{% comment %}Only show these bullet points if the version has been released{% endcomment %}
{% if released == true %}
{% comment %}v1.0 has no #v1-0-0 anchor, and before GA other releases also do not.{% endcomment %}
- For key feature enhancements in {{ page.major_version }} and other upgrade considerations, refer to the notes for {% if include.major_version.release_date != 'N/A' and page.major_version != 'v1.0' and page.major_version != 'v19.2' %}[{{ page.major_version }}.0](#{{ page.major_version | replace: '.', '-' }}-0){% else %}{{ page.major_version }} on this page{% endif %}.
{% endif %}
{% endif %}{% comment %}End GA-only content{% endcomment %}
- For details about release types, naming, and licensing, refer to the [Releases]({% link releases/index.md %}) page.
- Be sure to also review the [Release Support Policy]({% link releases/release-support-policy.md %}).
- {{ install_sentence | strip_newlines }}

{% comment %}The strip_newlines is needed here because otherwise Jekyll inserts <p> tags around the install and upgrade links{% endcomment %}
Get future release notes emailed to you:

{% include_cached marketo.html formId=1083 %}
