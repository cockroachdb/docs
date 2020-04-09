---
title: Product Support Lifecycle and EOL Policy
summary: 
toc: true
---

**Product Release Numbering**

CockroachDB uses a three-place numbering scheme to designate released versions of software. The format is YY.R.PP, where YY indicates the Year, R indicates release with “1” for Spring and “2” for Fall, and PP indicates the patch release version. An example would be Version 20.1.1 (abbreviated 20.1.1).
* A major release is made twice a year indicating major enhancements to product functionality.  A change in the YY.R component denotes a major release.
* A patch (or maintenance) release is produced to roll out resolutions to problems that have been identified in the product.  A change in the PP numbering denotes a patch release.

**Maintenance and Assistance Support**

While a major release is in Maintenance Support, we will make regular maintenance releases including resolutions to problems identified by users. 

Once a major release enters the Assistance Support phase, the following guidelines will apply:

* New enhancements and error corrections will not be made to that major release.
* CockroachDB will direct customers to existing fixes/patches and workarounds applicable to the reported case.
* CockroachDB may direct customers to upgrade to a more current version/release of the product if a workaround does not exist.

**Support Cycle**

When a major release is made available, CockroachDB will continue to provide Maintenance Support for the prior major release for a period of at least 365 days from the declared production date of the new major release. After this period, CockroachDB will provide Assistance Support for a period of at least an additional 180 days.

**End of Life and End of Support Notices**

In an effort to continuously enhance and improve our product offering, it may become necessary as a part of CockroachDB's product lifecycle to declare that a particular product or product configuration is at the “end of life” stage and therefore, CockroachDB reserves the right to no longer support that product or product configuration. End-of-Life Notices generally are available 12 months in advance of the End-of-Support date.

End-of-Support Notices are provided to you by either mail or e-mail. End-of-Support Notices contain support dates, information about availability of Maintenance Support and Assistance Support, and information about migration paths for certain features. End-of-Support Notices are subject to change. CockroachDB will provide updated End-of-Life and End-of-Support Notices as necessary.

**Current Product Lifecycle**

{{site.data.alerts.callout_info}}
There will be a one-time extension of Assistance support for v2.1 to **July 1, 2020**.
{{site.data.alerts.end}}

|Version | Release Date | Maintenance Support Ends | Assistance Support Ends (EOL Date)
|--------|---------|-----------|-----------
|v19.2 |11/12/19 |11/12/20 |5/12/21
|v19.1 |4/30/19 |4/30/20 |11/1/20
|v2.1 |11/19/18 |11/19/19  |7/1/20
|v2.0 |4/4/18 |4/4/18 |11/4/19
