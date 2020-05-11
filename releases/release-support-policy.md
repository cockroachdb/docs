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

{{site.data.alerts.callout_info}}
There will be a one-time extension of Assistance Support for v2.1 to **July 1, 2020**.
{{site.data.alerts.end}}

|Version | Release Date | Maintenance Support ends | Assistance Support ends (EOL Date)
|--------|---------|-----------|-----------
|[v20.1](v20.1.0.html) |5/12/20 |5/12/21 |11/12/21
|[v19.2](v19.2.0.html) |11/12/19 |11/12/20 |5/12/21
|[v19.1](v19.1.0.html) |4/30/19 |4/30/20 |11/1/20
|[v2.1](v2.1.0.html) |11/19/18 |11/19/19  |7/1/20
|[v2.0](v2.0.0.html) |4/4/18 |4/4/19 |11/4/19
