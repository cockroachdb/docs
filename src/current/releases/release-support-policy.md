---
title: Release Support Policy
summary: Learn about Cockroach Labs' policy for supporting major releases of CockroachDB.
toc: true
docs_area: releases
---

{% assign today = "today" | date: "%Y-%m-%d" %} {% comment %} Fetch today's date. {% endcomment %}

{% assign versions = site.data.versions | where_exp: "versions", "versions.release_date <= today" | sort: "release_date" | reverse %} {% comment %} Get all versions (e.g., v21.2) sorted in reverse chronological order. {% endcomment %}

This page explains Cockroach Labs' policy for supporting [production releases]({% link releases/index.md %}) of CockroachDB Self-Hosted. For clusters deployed in {{ site.data.products.cloud }}, refer to the [CockroachDB {{ site.data.products.cloud }} Support and Upgrade Policy](TODO:<link to renamed/redirected page>).

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
			<th>Version</th>
			<th>Release Date</th>
			<th>Maintenance Support ends</th>
			<th>Assistance Support ends</th>
      <th>LTS Maintenance Support ends</th>
      <th>LTS Assistance Support ends</th>
		</tr>
	</thead>
  <tbody>
  {% for v in versions %}
    {% assign r_latest = site.data.releases | where_exp: "r_latest", "r_latest.major_version == v.major_version" | where_exp: "r_latest", "r_latest.withdrawn != true" | sort: "release_date" | last | map: "version" %} {% comment %} Calculate the latest non-withdrawn release for a version v. {% endcomment %}

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

    {% comment %}If EOL, decorate the row with class=eol{% endcomment %}
    <tr{% if r_eol == true or r_lts_eol == true %} class=eol{% endif %}>
      {% comment %}Print the major version with a link to its release notes. If EOL, add *. If LTS EOL, add **.{% endcomment %}
      <td><a href="{% link releases/{{ v.major_version }}.md %}">{{ v.major_version }}{% if r_eol == true %}*{% if r_has_lts == true %}{% if r_lts_eol == true %}*{% endif %}{% endif %}{% endif %}</a></td>
      <td>{{ v.release_date }}</td>
      <td>{{ v.maint_supp_exp_date }}</td>
      <td>{{ v.asst_supp_exp_date }}</td>
      <td>{% if v.lts_maint_supp_exp_date != "N/A" %}{{ v.lts_maint_supp_exp_date }}{% endif %}</td>
      <td>{% if v.lts_asst_supp_exp_date != "N/A" %}{{ v.lts_asst_supp_exp_date }}{% endif %}</td>
    </tr>
  {% endfor %} {% comment %} Display each version, its release date, its maintenance support expiration date, and its assistance support expiration date, and its LTS maintenance and assistance support dates. Also include links to the latest hotfix version. {% endcomment %}
  </tbody>
</table>

&#42;: Version has reached EOL for GA releases but not yet for LTS releases, if applicable.
&#42;&#42;: Version has reached EOL for GA and LTS releases.
