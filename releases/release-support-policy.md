---
title: Release Support Policy
summary: Learn about Cockroach Labs' policy for supporting major releases of CockroachDB.
toc: true
---

{% assign versions = site.data.versions | sort: "release_date" | reverse %}

{% assign today = "today" | date: "%Y-%m-%d" %}

This page explains Cockroach Labs' policy for supporting [major releases](../releases/) of CockroachDB.

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
    {% assign r_latest = site.data.releases | where_exp: "r_latest", "r_latest.major_version == v" | where: "withdrawn", "false" | sort: "release_date" | last | map: "version" %}
    <tr{% if v.asst_supp_exp_date < today %} class=eol{% endif %}>
      <td><a href="{{ r_latest }}.html">{{ v.major_version}}{% if v.asst_supp_exp_date < today %}*{% endif %}</a></td>
      <td>{{ v.release_date }}</td>
      <td>{{ v.maint_supp_exp_date }}</td>
      <td>{{ v.asst_supp_exp_date }}</td>
    </tr>
  {% endfor %}
</table>

&#42; Version has reached EOL
