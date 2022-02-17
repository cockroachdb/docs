---
title: Release Support Policy
summary: Learn about Cockroach Labs' policy for supporting major releases of CockroachDB.
toc: true
docs_area: releases 
---

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
  <tr>
    <td><a href="v21.2.0.html">v21.2</a></td>
    <td>2021-11-16</td>
    <td>2022-11-16</td>
    <td>2023-05-16</td>
  </tr>
  <tr>
    <td><a href="v21.1.0.html">v21.1</a></td>
    <td>2021-05-18</td>
    <td>2022-05-18</td>
    <td>2022-11-18</td>
  </tr>
	<tr>
		<td><a href="v20.2.0.html">v20.2</a></td>
		<td>2020-11-10</td>
		<td>2021-11-10</td>
		<td>2022-05-10</td>
	</tr>
	<tr class=eol>
		<td><a href="v20.1.0.html">v20.1*</a></td>
		<td>2020-05-12</td>
		<td>2021-05-12</td>
		<td>2021-11-12</td>
	</tr>
	<tr class=eol>
		<td><a href="v19.2.0.html">v19.2*</a></td>
		<td>2019-11-12</td>
		<td>2020-11-12</td>
		<td>2021-05-12</td>
	</tr>
	<tr class=eol>
		<td><a href="v19.1.0.html">v19.1*</a></td>
		<td>2019-04-30</td>
		<td>2020-04-30</td>
		<td>2020-11-01</td>
	</tr>
	<tr class=eol>
		<td><a href="v2.1.0.html">v2.1*</a></td>
		<td>2018-11-19</td>
		<td>2019-11-19</td>
		<td>2020-07-01</td>
	</tr>
	<tr class=eol>
		<td><a href="v2.0.0.html">v2.0*</a></td>
		<td>2018-04-04</td>
		<td>2019-04-04</td>
		<td>2019-11-04</td>
	</tr>
</table>

&#42; Version has reached EOL
