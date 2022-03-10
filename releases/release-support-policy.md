---
title: Release Support Policy
summary: Learn about Cockroach Labs' policy for supporting major releases of CockroachDB.
toc: true
docs_area: releases
---

{% assign today = "today" | date: "%Y-%m-%d" %} {% comment %} Fetch today's date. {% endcomment %}

{% assign versions = site.data.versions | where_exp: "versions", "versions.release_date <= today" | sort: "release_date" | reverse %} {% comment %} Get all versions (e.g., v21.2) sorted in reverse chronological order. {% endcomment %}

{% assign oldreleases = "v1.0,v1.1,v2.0,v2.1,v19.1,v19.2,v20.1" | split: "," %} {% comment %} For all releases prior to and including 20.1, we use different logic to generate the page (vXX.Y.Z.html vs vXX.Y.html#vXX-Y-Z). {% endcomment %}

This page explains Cockroach Labs' policy for supporting [major releases](../releases/) of CockroachDB.

{{site.data.alerts.callout_info}}
For {{ site.data.products.db }} clusters, see the [{{ site.data.products.db }} Upgrade Policy](../cockroachcloud/upgrade-policy.html).
{{site.data.alerts.end}}

## Support cycle

Each major release of CockroachDB goes through the following support cycle:

- **Maintenance Support:** For at least 365 days from the major release date, Cockroach Labs will produce regular patch releases that include critical security fixes and resolutions to problems identified by users.

- **Assistance Support:** Following the maintenance support period, Cockroach Labs will provide assistance support for at least an additional 180 days. During this period, the following guidelines will apply:
    - New enhancements and error corrections will not be made to the major release.
    - Cockroach Labs will direct customers to existing fixes/patches and workarounds applicable to the reported case.
    - Cockroach Labs may direct customers to [upgrade](../{{site.versions["stable"]}}/upgrade-cockroach-version.html) to a more current version of the product if a workaround does not exist.
    - Cockroach Labs will continue to add critical security fixes to the major release in the form of patch releases.

- **End of Life (EOL):** Following the assistance support period, Cockroach Labs will no longer provide any support for the release.

Cockroach Labs will notify you by mail or email 6 months in advance of a major release transitioning into **Assistance Support** or **EOL**.

## Current supported releases

As of v19.1, Cockroach Labs uses a three-component calendar versioning scheme. Prior releases use a different versioning scheme. For more details, see [Release Naming](index.html#release-naming).

Date format: YYYY-MM-DD

<table>
	<thead>
		<tr>
			<th>Version</th>
			<th>Release Date</th>
			<th>Maintenance Support ends</th>
			<th>Assistance Support ends (EOL Date)</th>
		</tr>
	</thead>
  {% for v in versions %}
    {% assign r_latest = site.data.releases | where_exp: "r_latest", "r_latest.major_version == v.major_version" | where: "withdrawn", "false" | sort: "release_date" | last | map: "version" %} {% comment %} Calculate the latest non-withdrawn release for a version v. {% endcomment %}

    {% if oldreleases contains v.major_version %}
      {% assign old_release_format = "True" %}
    {% endif %}

    <tr{% if v.asst_supp_exp_date < today %} class=eol{% endif %}>
      <td><a href="{% if old_release_format %}{{ r_latest }}.html{% else %}{{ v.major_version }}.html{% endif %}">{{ v.major_version }}{% if v.asst_supp_exp_date < today %}*{% endif %}</a></td>
      <td>{{ v.release_date }}</td>
      <td>{{ v.maint_supp_exp_date }}</td>
      <td>{{ v.asst_supp_exp_date }}</td>
    </tr>
  {% endfor %} {% comment %} Display each version, its release date, its maintenance support expiration date, and its assistance support expiration date. Also include links to the latest hotfix version. {% endcomment %}
</table>

&#42; Version has reached EOL
