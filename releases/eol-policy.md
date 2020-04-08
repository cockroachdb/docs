---
title: CockroachDB EOL/EOSL Policy
summary: 
toc: true
---

Cockroach Labs [supports](support-resources.html) the current <a href="https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html">stable release</a> and two major releases prior. 

{{site.data.alerts.callout_info}}
There will be a one-time extension of support for v2.1 to **July 1, 2020**.
{{site.data.alerts.end}}

|Version |Released |EOL Begins |EOSL Begins
|--------|---------|-----------|-----------
|v19.2 |11/12/19 |21.1 Release Date |21.1 Release Date
|v19.1 |4/30/19 |20.2 Release Date |11/1/20
|v2.1 |11/19/18 |20.1 Release Date  |7/1/20
|v2.0 |4/4/18 |4/30/19 |11/12/19

After the **EOL** date, we will only release fixes for critical bugs encountered in production by Enterprise customers, and security fixes. Nothing else will be supported or backported after the EOL date.

After the **EOSL** date, the version will be completely unsupported. If you encounter an issue with this version, our recommendation will be to [upgrade](upgrade-cockroach-version.html).

Prior to the EOL date, the version will be fully supported, and we will backport fixes to it wherever possible.