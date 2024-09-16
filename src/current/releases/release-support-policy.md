---
title: Release Support Policy
summary: Learn about Cockroach Labs' policy for supporting major releases of CockroachDB.
toc: true
toc_not_nested: true
docs_area: releases
---
{% assign DEBUG = false %}

{% assign today = "today" | date: "%Y-%m-%d" %} {% comment %} Fetch today's date. {% endcomment %}

{% assign versions = site.data.versions | where_exp: "versions", "versions.release_date <= today" | sort: "release_date" | reverse %} {% comment %} Get all versions (e.g., v21.2) sorted in reverse chronological order. {% endcomment %}

This page explains Cockroach Labs' policy for supporting [production releases]({% link releases/index.md %}) of CockroachDB {{ site.data.products.core }}. For clusters deployed in {{ site.data.products.cloud }}, refer to the [CockroachDB {{ site.data.products.cloud }} Support and Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

There are two major release types: [Regular and Innovation releases]({% link releases/index.md %}#release-types). Each offers a unique set of Support Types, which define the durations for each [support phase](#support-phases).

## Support Phases

- **Maintenance Support**: Begins for a CockroachDB major version upon its [GA release]({% link releases/index.md %}#patch-releases). During this phase:
  - Cockroach Labs will produce regular patch releases that include critical security fixes and resolutions to problems identified by users.
  - Cockroach Labs may backport non-breaking enhancements produced for newer major versions.
  - Cockroach Labs may direct customers to workarounds or other fixes applicable to a reported case.
  - Cockroach Labs may recommend that customers [upgrade](https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version) to a later version of the product to resolve or further troubleshoot an issue.
- **Assistance Support**: Immediately follows the Maintenance Support phase for Regular releases. Innovation releases do not have an Assistance Support phase. During this phase:
  - Feature enhancements will no longer be made available to the major release.
  - Cockroach Labs will continue to add critical security fixes to the major release in the form of patch releases.
  - Patch releases for the purpose of resolving bugs or other errors may no longer be made to the major release.
  - Cockroach Labs may direct customers to workarounds or other fixes applicable to the reported case.
  - Cockroach Labs may direct customers to [upgrade](https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version) to a later version of CockroachDB to resolve or further troubleshoot an issue.
- **End of Life (EOL)**: The day that a major version’s final support period ends is its EOL date. After a version reaches EOL, Cockroach Labs provides no further support for the release.
  - A Regular release reaches EOL at the Assistance Support phase's end date.
  - An Innovation releases reaches EOL at the Maintenance Support phase's end date.

## Support Types

### Regular releases

Initially, a Regular release series has GA Support. After the series demonstrates a continuously high level of stability and performance, new patch releases are designated as LTS releases, which have an extended support window for each [support phase](#support-phases): Maintenance Support, Assistance Support, and EOL (End of Life).

- **GA Support**: The default support type for production releases, starting with the initial production release of a major version, followed by each subsequent patch release before LTS releases begin for that major version.
    - **Maintenance support ends**:
        - **365 days** **after** the day of the **first production release** of the major version (i.e. the ‘GA release,’ ending in .0).
    - **Assistance support ends**:
        - **180 days after** the **Maintenance Support end date** of the release.
    - Major versions prior to v23.1 will not have LTS releases.
- **LTS (Long-Term Support)**: Conferred to an initial LTS maintenance release of a given major version and its subsequent maintenance releases. LTS provides extended support windows while also indicating our highest level of expected release stability and performance.
    - **Maintenance support ends**:
        - **365 days** **after** the day of the **first LTS release** of the major version.
    - **Assistance support ends**:
        - **365 days after** the **Maintenance Support end date** of the release.

### Innovation releases

Innovation releases do not have LTS releases.

- **Innovation Support**:
    - **Maintenance Support ends:**
        - **180 days after** the day of the **first production release** of the major version.

Innovation releases are not eligible for Assistance Support, and reach EOL at the end of Maintenance Support.

## Supported versions

<table>
	<thead>
		<tr>
			<th>Major Version</th>
      <th>Patch Versions</th>
      <th>Support Type</th>
			<th>Initial Release</th>
			<th>Maintenance Support ends</th>
			<th>Assistance Support ends</th>
		</tr>
	</thead>
  <tbody>
  {% for v in versions %}
    {% assign r_latest = site.data.releases | where_exp: "r_latest", "r_latest.major_version == v.major_version" | where_exp: "r_latest", "r_latest.withdrawn != true" | sort: "release_date" | last | map: "version" %} {% comment %} Calculate the latest non-withdrawn release for a version v. {% endcomment %}

    {% comment %}Convert version (string) to numeric{% endcomment %}
    {% assign major_version_numeric = v.major_version | remove_first: "v" | times:1 %}

    {% comment %}Initialize local variables {% endcomment %}
    {% assign r_eol = false %}
    {% assign r_has_lts = false %}
    {% assign r_lts_eol = false %}
    {% assign will_never_have_lts = false %}
    {% assign skippable = false %}

    {% comment %}v23.1 and future will have LTS {% endcomment %}
    {% if major_version_numeric < 23.1 %}
      {% assign will_never_have_lts = true %}
    {% endif %}

    {% comment %}Releases with a release date and no assistance date are skippable{% endcomment %}
    {% if v.release_date != "N/A" and v.maint_supp_exp_date != "N/A" and v.asst_supp_exp_date == "N/A" %}
      {% assign skippable = true %}
      {% assign will_never_have_lts = true %}
    {% endif %}

    {% comment %}Evaluate whether the version is EOL for GA or LTS or both{% endcomment %}
    {% if v.asst_supp_exp_date != "N/A" and v.asst_supp_exp_date < today and skippable == false %}
      {% comment %}GA releases in this version are EOL{% endcomment %}
      {% assign r_eol = true %}
      {% if v.lts_asst_supp_exp_date != "N/A" %}
        {% comment %}This major version has LTS releases{% endcomment %}
        {% assign r_has_lts = true %}
        {% if v.lts_asst_supp_exp_date < today %}
          {% comment %}LTS releases exist for this major version and are EOL{% endcomment %}
          {% assign r_lts_eol = true %}
        {% endif %}
      {% endif %}
    {% elsif v.asst_supp_exp_date == "N/A" and v.maint_supp_exp_date != "N/A" and v.maint_supp_exp_date < today and skippable == true %}
      {% comment %}GA releases in this version are EOL{% endcomment %}
      {% assign r_eol = true %}
    {% endif %}

    {% comment %}Evaluate whether skippable versions are EOL{% endcomment %}
    {% if v.asst_supp_exp_date == "N/A" and v.maint_supp_exp_date < today and skippable == true %}
      {% comment %}GA releases in this version are EOL{% endcomment %}
      {% assign r_eol = true %}
    {% endif %}

    {% if DEBUG %}
    v.major_version: {{ v.major_version }}<br />
    major_version_numeric: {{ major_version_numeric }}<br />
    skippable: {{ skippable }}<br />
    r_eol: {{ r_eol }}<br />
    r_lts_eol: {{ r_lts_eol }}<br />
    <br />
    {% endif %}

    {% if r_eol != true and r_lts_eol != true %}{% comment %}Only show non-EOL releases {% endcomment %}

      {% if v.initial_lts_patch != "N/A" %}{% comment %} For LTS releases print an LTS row first{% endcomment %}
  <tr>
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}</td>
    <td>{% if v.initial_lts_patch != "N/A" %}{{ v.initial_lts_patch }}+{% endif %}</td>
    <td>LTS</td>
    <td>{{ v.initial_lts_release_date }}</td>
    <td>{% if v.lts_maint_supp_exp_date != "N/A" %}{{ v.lts_maint_supp_exp_date }}{% endif %}</td>
    <td>{{ v.lts_asst_supp_exp_date }}</td>
  </tr>
      {% endif %}

  {% comment %} Always print a GA row.
    For regular releases not yet in LTS, add a link to the first footnote
    For currently supported skippable releases, add a link to the second footnote
  {% endcomment %}
  <tr>
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}{% if will_never_have_lts == false and v.initial_lts_patch == "N/A" %}&nbsp;<a href="#lts-tbd"><sup>*</sup></a>{% elsif skippable == true %}&nbsp;<a href="#skippable"><sup>**</sup></a>{% endif %}</td>
    <td>{% if v.last_ga_patch != "N/A" %}{{ v.major_version }}.0 - {{ v.last_ga_patch }}{% else %}{{ v.major_version }}.0+{% endif %}</td>
    <td>GA</td>
    <td>{{ v.release_date }}</td>
    <td>{% if v.maint_supp_exp_date != "N/A" %}{{ v.maint_supp_exp_date }}{% endif %}</td>
    <td>{{ v.asst_supp_exp_date }}</td>
  </tr>
    {% endif %}

  {% endfor %} {% comment %} Display each non-EOL version, its release date, its maintenance support expiration date, and its assistance support expiration date, and its LTS maintenance and assistance support dates. Also include links to the latest hotfix version. {% endcomment %}
  </tbody>
</table>

<sup id="lts-tbd">&#42;&nbsp;&nbsp;: This major version will receive LTS patch releases, which will be listed on an additional row, upon their availability.</sup><br />
<sup id="skippable">&#42;&#42;&nbsp;&nbsp;: This major version is an optional innovation release and will not receive receive LTS patch releases. Innovation releases are EOL when Maintenance Support ends.</sup><br />

## End-of-life (EOL) versions

The following versions of CockroachDB are no longer supported.

<table>
	<thead>
		<tr>
			<th>Major Version</th>
      <th>Patch Versions</th>
      <th>Support Type</th>
			<th>Initial Release</th>
			<th>Maintenance Support ended</th>
			<th>Assistance Support ended</th>
		</tr>
	</thead>
  <tbody>
  {% for v in versions %}
    {% assign r_latest = site.data.releases | where_exp: "r_latest", "r_latest.major_version == v.major_version" | where_exp: "r_latest", "r_latest.withdrawn != true" | sort: "release_date" | last | map: "version" %} {% comment %} Calculate the latest non-withdrawn release for a version v. {% endcomment %}

        {% comment %}Convert version (string) to numeric{% endcomment %}
    {% assign major_version_numeric = v.major_version | remove_first: "v" | times:1 %}

    {% comment %}Initialize local variables {% endcomment %}
    {% assign r_eol = false %}
    {% assign r_has_lts = false %}
    {% assign r_lts_eol = false %}
    {% assign will_never_have_lts = false %}
    {% assign skippable = false %}

    {% comment %}v23.1 and future will have LTS {% endcomment %}
    {% if major_version_numeric < 23.1 %}
      {% assign will_never_have_lts = true %}
    {% endif %}

    {% comment %}Releases with a release date and no assistance date are skippable{% endcomment %}
    {% if v.asst_supp_exp_date == "N/A" %}
      {% assign skippable = true %}
      {% assign will_never_have_lts = true %}
    {% endif %}

    {% comment %}Evaluate whether the version is EOL for GA or LTS or both{% endcomment %}
    {% if v.asst_supp_exp_date != "N/A" and v.asst_supp_exp_date < today and skippable == false %}
      {% comment %}GA releases in this version are EOL{% endcomment %}
      {% assign r_eol = true %}
      {% if v.lts_asst_supp_exp_date != "N/A" %}
        {% comment %}This major version has LTS releases{% endcomment %}
        {% assign r_has_lts = true %}
        {% if v.lts_asst_supp_exp_date < today %}
          {% comment %}LTS releases exist for this major version and are EOL{% endcomment %}
          {% assign r_lts_eol = true %}
        {% endif %}
      {% endif %}
    {% endif %}

    {% comment %}Evaluate whether skippable versions are EOL{% endcomment %}
    {% if v.asst_supp_exp_date == "N/A" and v.maint_supp_exp_date < today and skippable == true %}
      {% comment %}GA releases in this version are EOL{% endcomment %}
      {% assign r_eol = true %}
    {% endif %}

    {% if DEBUG %}
    v.major_version: {{ v.major_version }}<br />
    major_version_numeric: {{ major_version_numeric }}<br />
    skippable: {{ skippable }}<br />
    r_eol: {{ r_eol }}<br />
    r_lts_eol: {{ r_lts_eol }}<br />
    <br />
    {% endif %}

    {% if r_eol == true %}
      {% if r_lts_eol == true %}
  <tr class="eol">{% comment %} For LTS releases print an LTS row first{% endcomment %}
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}</td>
    <td>{{ v.initial_lts_patch }}+</td>
    <td>LTS</td>
    <td>{{ v.initial_lts_release_date }}</td>
    <td>{% if v.lts_maint_supp_exp_date != "N/A" %}{{ v.lts_maint_supp_exp_date }}{% endif %}</td>
    <td>{{ v.lts_asst_supp_exp_date }}</td>
  </tr>
      {% endif %}

    {% comment %} Always print a GA row{% endcomment %}
  <tr class="eol">
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}{% if skippable == true %}&nbsp;<a href="#skippable-eol"><sup>*</sup>{% endif %}</a></a></td>
    <td>{% if v.last_ga_patch != "N/A" %}{{ v.major_version }}.0 - {{ v.last_ga_patch }}{% else %}{{ v.major_version }}.0+{% endif %}</td>
    <td>GA</td>
    <td>{{ v.release_date }}</td>
    <td>{% if v.maint_supp_exp_date != "N/A" %}{{ v.maint_supp_exp_date }}{% endif %}</td>
    <td>{{ v.asst_supp_exp_date }}</td>
  </tr>
    {% endif %}

  {% endfor %} {% comment %} Display each EOL version, its release date, its maintenance support expiration date, and its assistance support expiration date, and its LTS maintenance and assistance support dates. Also include links to the latest hotfix version. {% endcomment %}

  </tbody>
</table>

<sup id="skippable-eol">&#42;&nbsp;&nbsp;: This EOL major version is an optional innovation release. Innovation releases do not receive LTS releases and are EOL when Maintenance Support ends.</sup><br />
