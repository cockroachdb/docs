---
title: Release Support Policy
summary: Learn about Cockroach Labs' policy for supporting major releases of CockroachDB.
toc: true
docs_area: releases
---

{% assign today = "today" | date: "%Y-%m-%d" %} {% comment %} Fetch today's date. {% endcomment %}

{% assign versions = site.data.versions | where_exp: "versions", "versions.release_date <= today" | sort: "release_date" | reverse %} {% comment %} Get all versions (e.g., v21.2) sorted in reverse chronological order. {% endcomment %}

This page explains Cockroach Labs' policy for supporting [production releases]({% link releases/index.md %}) of CockroachDB Self-Hosted. For clusters deployed in {{ site.data.products.cloud }}, refer to the [CockroachDB {{ site.data.products.cloud }} Support and Upgrade Policy](https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy).

There are two support types: GA and LTS (Long-Term Support). Each patch release of CockroachDB is assigned one of these types. The default is GA, unless otherwise specified.

Initially, a major release series has GA support. After the series demonstrates a continuously high level of stability and performance, new patch releases are designated as LTS releases, which provide extended support windows. Specifically, the distinction determines the time spans of a release’s support phases: Maintenance Support, Assistance Support, and EOL (End of Life).

## Support Phases

- **Maintenance Support**: Cockroach Labs will produce regular patch releases that include critical security fixes and resolutions to problems identified by users.

- **Assistance Support**: Immediately follows the Maintenance Support period. During this period, the following guidelines apply:
  - New enhancements will not be made to the major release.
  - Cockroach Labs will continue to add critical security fixes to the major release in the form of patch releases.
  - Patch releases for the purpose of resolving bugs or other errors may no longer be made to the major release.
  - Cockroach Labs may direct customers to workarounds or other fixes applicable to the reported case.
  - Cockroach Labs may direct customers to [upgrade](https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version) to a later version of the product, to resolve or further troubleshoot an issue.

- **End of Life (EOL)**: Following the assistance support period, Cockroach Labs will no longer provide any support for the release.

## Support Types

* **GA Support**: The default support type for production releases, starting with the initial production release of a major version, followed by each subsequent patch release before LTS releases begin for that major version.
    * **Maintenance support ends**:
        * **365 days** **after** the day of the **first production release** of the major version (i.e. the ‘GA release,’ ending in .0).
    * **Assistance support ends**:
        * **180 days after** the **Maintenance Support end date** of the release.
    * Major versions prior to v23.1 will not have LTS releases.
* **LTS (Long-Term Support)**: Conferred to an initial LTS maintenance release of a given major version and its subsequent maintenance releases. LTS provides extended support windows while also indicating our highest level of expected release stability and performance.
    * **Maintenance support ends**:
        * **365 days** **after** the day of the **first LTS release** of the major version.
    * **Assistance support ends**:
        * **365 days after** the **Maintenance Support end date** of the release.

## Current supported releases

As of v19.1, Cockroach Labs uses a three-component calendar versioning scheme. Prior releases use a different versioning scheme. For more details, see [Release Naming]({% link releases/index.md %}#release-naming).

Date format: YYYY-MM-DD

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

    {% comment %}v23.1 and future will have LTS {% endcomment %}
    {% if major_version_numeric < 23.1 %}
      {% assign will_never_have_lts = true %}
    {% endif %}

    {% comment %}Evaluate whether the version is EOL for GA or LTS or both{% endcomment %}
    {% if v.asst_supp_exp_date < today %}
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


    {% if r_eol != true and r_lts_eol != true %}{% comment %}Only show non-EOL releases {% endcomment %}

      {% if v.initial_lts_patch != "N/A" %}{% comment %} For LTS releases print an LTS row first{% endcomment %}
  <tr>
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}</td>
    <td>{% if v.initial_lts_patch != "N/A" %}{{ v.initial_lts_patch }}+{% endif %}</td>
    <td>LTS</td>
    <td>{{ v.initial_lts_release_date }}</td>
    <td>{% if v.lts_maint_supp_exp_date != "N/A" %}{{ v.lts_maint_supp_exp_date }}{% endif %}</td>
    <td>{% if v.lts_asst_supp_exp_date != "N/A" %}{{ v.lts_asst_supp_exp_date }}{% endif %}</td>
  </tr>
      {% endif %}

  <tr>{% comment %} Always print a GA row. For 23.2+, add a link to the first footnote{% endcomment %}
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}{% if will_never_have_lts == false and v.initial_lts_patch == "N/A" %}&nbsp;<a href="#lts-tbd"><sup>*</sup></a>{% endif %}</td>
    <td>{% if v.last_ga_patch != "N/A" %}{{ v.major_version }}.0 - {{ v.last_ga_patch }}{% else %}{{ v.major_version }}.0+{% endif %}</td>
    <td>GA</td>
    <td>{{ v.release_date }}</td>
    <td>{% if v.maint_supp_exp_date != "N/A" %}{{ v.maint_supp_exp_date }}{% endif %}</td>
    <td>{% if v.asst_supp_exp_date != "N/A" %}{{ v.asst_supp_exp_date }}{% endif %}</td>
  </tr>
    {% endif %}

  {% endfor %} {% comment %} Display each non-EOL version, its release date, its maintenance support expiration date, and its assistance support expiration date, and its LTS maintenance and assistance support dates. Also include links to the latest hotfix version. {% endcomment %}
  </tbody>
</table>

<sup id="lts-tbd">&#42;&nbsp;&nbsp;: This major version will receive LTS patch releases, which will be listed on an additional row, upon their availability.</sup><br />

## End-of-life (EOL) releases

The following releases are no longer supported.

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

    {% comment %}Evaluate whether the version is EOL for GA or LTS or both{% endcomment %}
    {% assign r_eol = false %}
    {% assign r_lts_eol = false %}
    {% if v.lts_asst_supp_exp_date != "N/A" %}
      {% comment %}This major version has LTS releases{% endcomment %}
      {% assign r_has_lts = true %}
      {% if v.lts_asst_supp_exp_date < today %}
        {% comment %}LTS releases exist for this major version and are EOL{% endcomment %}
        {% assign r_lts_eol = true %}
      {% endif %}
    {% endif %}
    {% if v.asst_supp_exp_date < today %}
      {% comment %}GA releases in this version are EOL{% endcomment %}
      {% assign r_eol = true %}
    {% endif %}

    {% if r_eol == true %}
      {% if r_lts_eol == true %}
  <tr class="eol">{% comment %} For LTS releases print an LTS row first{% endcomment %}
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}</td>
    <td>{{ v.initial_lts_patch }}+</td>
    <td>LTS</td>
    <td>{{ v.initial_lts_release_date }}</td>
    <td>{% if v.lts_maint_supp_exp_date != "N/A" %}{{ v.lts_maint_supp_exp_date }}{% endif %}</td>
    <td>{% if v.lts_asst_supp_exp_date != "N/A" %}{{ v.lts_asst_supp_exp_date }}{% endif %}</td>
  </tr>
      {% endif %}

    {% comment %} Always print a GA row{% endcomment %}
  <tr class="eol">
    <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}</td>
    <td>{% if v.last_ga_patch != "N/A" %}{{ v.major_version }}.0 - {{ v.last_ga_patch }}{% else %}{{ v.major_version }}.0+{% endif %}</td>
    <td>GA</td>
    <td>{{ v.release_date }}</td>
    <td>{% if v.maint_supp_exp_date != "N/A" %}{{ v.maint_supp_exp_date }}{% endif %}</td>
    <td>{% if v.asst_supp_exp_date != "N/A" %}{{ v.asst_supp_exp_date }}{% endif %}</td>
  </tr>
    {% endif %}

  {% endfor %} {% comment %} Display each EOL version, its release date, its maintenance support expiration date, and its assistance support expiration date, and its LTS maintenance and assistance support dates. Also include links to the latest hotfix version. {% endcomment %}
  </tbody>
</table>
