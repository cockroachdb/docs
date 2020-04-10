---
title: Product Support Lifecycle and EOL Policy
summary: 
toc: true
---

## Product Release Numbering

CockroachDB uses a three-place numbering scheme to designate [released versions](../releases/) of software. The format is YY.R.PP, where YY indicates the year, R indicates release with “1” for Spring and “2” for Fall, and PP indicates the patch release version. An example would be Version 20.1.1 (abbreviated v20.1.1).

{{site.data.alerts.callout_info}}
This versioning scheme began with v19.1. Prior releases use a different versioning scheme.
{{site.data.alerts.end}}

- A major release is produced twice a year indicating major enhancements to product functionality. A change in the YY.R component denotes a major release.
- A patch (or maintenance) release is produced to roll out critical bug and security fixes. A change in the PP numbering denotes a patch release.

## Support Cycle

When a major release is made available, Cockroach Labs will continue to provide **Maintenance Support** for the prior major release for at least 365 days from the declared production date of the new major release. After this period, Cockroach Labs will provide **Assistance Support** for an additional 180 days at minimum.

While a major release is in the Maintenance Support phase, Cockroach Labs will produce regular patch releases including resolutions to problems identified by users. 

Once a major release enters the Assistance Support phase, the following guidelines will apply:

- New enhancements and error corrections will not be made to that major release.
- Cockroach Labs will direct customers to existing fixes/patches and workarounds applicable to the reported case.
- Cockroach Labs may direct customers to [upgrade](../stable/upgrade-cockroach-version.html) to a more current version of the product if a workaround does not exist.

## End of Life and End of Support Notices

At the conclusion of the Assistance Support phase, a major release reaches End of Life and will no longer be supported.

End of Life Notices are generally available 12 months in advance of the End-of-Support date.

End-of-Support Notices are provided to you by either mail or e-mail. End-of-Support Notices contain support dates, information about availability of Maintenance Support and Assistance Support, and information about migration paths for certain features. End-of-Support Notices are subject to change. Cockroach Labs will provide updated End-of-Life and End-of-Support Notices as necessary.

## Current Product Lifecycle

{{site.data.alerts.callout_info}}
There will be a one-time extension of Assistance Support for v2.1 to **July 1, 2020**.
{{site.data.alerts.end}}

|Version | Release Date | Maintenance Support ends | Assistance Support ends (EOL Date)
|--------|---------|-----------|-----------
|[v19.2](v19.2.0.html) |11/12/19 |11/12/20 |5/12/21
|[v19.1](v19.1.0.html) |4/30/19 |4/30/20 |11/1/20
|[v2.1](v2.1.0.html) |11/19/18 |11/19/19  |7/1/20
|[v2.0](v2.0.0.html) |4/4/18 |4/4/19 |11/4/19
