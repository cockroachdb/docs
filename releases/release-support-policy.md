---
title: Release Support Policy
summary:
toc: true
---

This page explains Cockroach Lab's policy for supporting [major releases](../releases/) of CockroachDB.

## Support cycle

Each major release of CockroachDB goes through the following support cycle:

- **Maintenance Support:** For at least 365 days from the major release date, Cockroach Labs will produce regular patch releases including resolutions to problems identified by users.

- **Assistance Support:** Following the maintenance support period, Cockroach Labs will provide assistance support for at least an additional 180 days. During this period, the following guidelines will apply:
    - New enhancements and error corrections will not be made to the major release.
    - Cockroach Labs will direct customers to existing fixes/patches and workarounds applicable to the reported case.
    - Cockroach Labs may direct customers to [upgrade](../stable/upgrade-cockroach-version.html) to a more current version of the product if a workaround does not exist.

- **End of Life (EOL):** Following the assistance support period, Cockroach Labs will no longer provide any support for the release.

Cockroach Labs will notify you by mail or email 6 months in advance of a major release transitioning into **Assistance Support** or **EOL**.

## Current supported releases

As of v19.1, Cockroach Lab uses a three-component calendar versioning scheme. Prior releases use a different versioning scheme. For more details, see [Release Naming](index.html#release-naming).

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
		<td><a href="v20.2.0.html">v20.2</a></td>
		<td>11/10/20</td>
		<td>11/10/21</td>
		<td>5/10/22</td>
	</tr>
	<tr>
		<td><a href="v20.1.0.html">v20.1</a></td>
		<td>5/12/20</td>
		<td>5/12/21</td>
		<td>11/12/21</td>
	</tr>
	<tr>
		<td><a href="v19.2.0.html">v19.2</a></td>
		<td>11/12/19</td>
		<td>11/12/20</td>
		<td>5/12/21</td>
	</tr>
	<tr>
		<td><a href="v19.1.0.html">v19.1</a></td>
		<td>4/30/19</td>
		<td>4/30/20</td>
		<td>11/1/20*</td>
	</tr>
	<tr class=eol>
		<td><a href="v2.1.0.html">v2.1</a></td>
		<td>11/19/18</td>
		<td>11/19/19</td>
		<td>7/1/20*</td>
	</tr>
	<tr class=eol>
		<td><a href="v2.0.0.html">v2.0</a></td>
		<td>4/4/18</td>
		<td>4/4/19</td>
		<td>11/4/19*</td>
	</tr>
</table>

&#42; Version has reached EOL
