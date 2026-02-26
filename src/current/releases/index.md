---
title: CockroachDB Releases Overview
summary: Information about CockroachDB releases with an index of available releases and their release notes and binaries.
toc: true
# toc_not_nested: true
docs_area: releases
---

{% comment %}Enable debug to print debug messages {% endcomment %}
{% assign DEBUG = false %}

{% comment %}
NOTE TO WRITERS: This file contains interleaved HTML and Liquid. To ease maintenance and readability
of this file, block-level HTML is indented in relation to the other HTML, and block-level Liquid is
indented in relation to the other Liquid. Please try to keep the indentation consistent. Thank you!
{% endcomment %}

{% assign all_production_releases = site.data.releases | where: "release_type", "Production" | sort: "release_date" | reverse %}
{% assign latest_full_production_version = all_production_releases | first %}

This page describes how CockroachDB handles releases and links to the release notes for all CockroachDB [releases](#supported-releases).

## Release types

A new major version of CockroachDB is released quarterly. After a series of testing releases, each major version receives an initial production release, followed by a series of patch releases. These releases follow a staged process where new versions first roll out to select Cockroach {{ site.data.products.cloud }} organizations, with binaries available for CockroachDB {{ site.data.products.code }} afterwards:

- Major releases (x.y.0 GA): Approximately 2 weeks after {{ site.data.products.cloud }} GA.
- Patch releases (x.y.1+): Approximately 1 week after {{ site.data.products.cloud }} availability.

Releases are named in the format `vYY.R.PP`, where `YY` indicates the year, `R` indicates the major release starting with `1` each year, and `PP` indicates the patch number, starting with `0`.

For example, the `{{ latest_full_production_version.release_name }}` production release is the latest patch release of major version [`{{ latest_full_production_version.major_version }}`]({% link releases/{{ latest_full_production_version.major_version }}.md %}).

### Major versions

Major versions of CockroachDB alternate between **Regular** and **Innovation** releases:

- **Regular releases** offer extended support windows for long-term stability and security. This support window is further extended after a patch release is nominated to an **LTS** (long-term support) release.

- **Innovation releases** offer shorter support windows but include all of the latest features.

For details on how LTS impacts support in CockroachDB {{ site.data.products.core }}, refer to [Release Support Policy]({% link releases/release-support-policy.md %}). For details on support per release type in CockroachDB Cloud, refer to [CockroachDB Cloud Support and Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

### Patch releases

All major versions of CockroachDB receive patch releases that update functionality and fix issues. During the early testing phase a version receives a series of **testing releases** followed by a series of **production releases**. A major version’s initial production release is also known as its GA (generally available) release.

<style>
  .no-wrap-table td:nth-child(1) {
    width: 140px; /* Set width for the first column */
    white-space: nowrap; /* Prevent wrapping */
  }
  .no-wrap-table td:nth-child(2) {
    width: 200px; /* Set width for the second column */
    white-space: nowrap; /* Prevent wrapping */
  }
</style>

<table class="no-wrap-table">
  <thead>
    <tr>
      <th>Patch Release Type</th>
      <th>Naming</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Production</td>
      <td><code>vYY.R.0</code> - <code>vYY.R.n</code><br>(ex. v24.2.1)</td>
      <td>Production releases are qualified for production environments. The type and duration of support for a production release may vary depending on the major release type, according to the <a href="release-support-policy.html">Release Support Policy</a>.</td>
    </tr>
    <tr>
      <td>Testing</td>
      <td><code>vYY.R.0-alpha.1+</code>,<br><code>vYY.R.0-beta.1+</code>,<br><code>vYY.R.0-rc.1+</code><br>(ex. v24.3.1-alpha.2)</td>
      <td>Produced during development of a new major version, testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments.</td>
    </tr>
  </tbody>
</table>

{{site.data.alerts.callout_danger}}
A cluster that is upgraded to an alpha binary of CockroachDB or a binary that was manually built from the `master` branch cannot subsequently be upgraded to a production release.
{{site.data.alerts.end}}

### CockroachDB {{ site.data.products.cloud }} releases

CockroachDB {{ site.data.products.cloud }} is a managed product that handles CockroachDB upgrades on your behalf, but still offers some flexibility over when to perform upgrades and which version to use. Version and upgrade support varies depending on the {{ site.data.products.cloud }} plan:

- CockroachDB {{ site.data.products.basic }} only supports **Regular releases**. Clusters are automatically upgraded to the next major regular version upon its GA release and receive regular patch updates.
- CockroachDB {{ site.data.products.standard }} only supports **Regular releases**. By default clusters are automatically upgraded to the next major version upon its GA release, with the option to handle the upgrade timing manually. Clusters receive regular patch updates.
- CockroachDB {{ site.data.products.advanced }} support both **Regular** and **Innovation** releases.

For more information, read the [CockroachDB {{ site.data.products.cloud }} upgrade policy]({% link cockroachcloud/upgrade-policy.md %}).

## Supported releases

| Version | Release Type | GA date |
| :---: | :---: | :---: |
| [v26.1]({% link releases/v26.1.md %}) | Innovation | 2026-02-02 |
| [v25.4]({% link releases/v25.4.md %}) | Regular | 2025-11-03 |
| [v25.2]({% link releases/v25.2.md %}) | Regular | 2025-05-12 |
| [v24.3]({% link releases/v24.3.md %}) | Regular | 2024-11-18 |
| [v24.1]({% link releases/v24.1.md %}) | Regular | 2024-05-20 |
| [v23.2]({% link releases/v23.2.md %}) | Regular | 2024-02-05 |

## Upcoming releases

The following releases and their descriptions represent proposed plans that are subject to change. Please contact your account representative with any questions.

| Version | Release Type | Expected GA date |
| :---: | :---: | :---: |
| v26.2 | Regular    | 2026 Q2    |

## Unsupported versions 

A full archive of CockroachDB major versions that are no longer supported is available on the [Unsupported Versions]({% link releases/unsupported-versions.md %}) page.

## Licenses

All CockroachDB binaries released on or after the day 24.3.0 is released onward, including patch fixes for versions 23.1-24.2, are made available under the [CockroachDB Software License](https://www.cockroachlabs.com/cockroachdb-software-license).

All CockroachDB binaries released prior to the release date of 24.3.0 are variously licensed under the Business Source License 1.1 (BSL), the CockroachDB Community License (CCL), and other licenses specified in the source code.

To review the CCL, refer to the [CockroachDB Community License](https://www.cockroachlabs.com/cockroachdb-community-license) page. You can find the applicable Business Source License or third party licenses by reviewing these in the `licenses` folder for the applicable version of CockroachDB in the GitHub repository [cockroachdb/cockroach](https://github.com/cockroachdb/cockroach). See individual files for details.

In late 2024, Cockroach Labs retired its Core offering to consolidate on a single CockroachDB Enterprise offering under the CockroachDB Software License. This license is available at no charge for individual users and small businesses, and offers all users, free and paid, the full breadth of CockroachDB capabilities. For details, refer to the [CockroachDB licensing update](https://www.cockroachlabs.com/enterprise-license-update/) and [Licensing FAQs]({% link {{site.versions["stable"]}}/licensing-faqs.md %}).

## Next steps

After choosing a version of CockroachDB, learn how to:

- [Create a cluster in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/create-your-cluster.md %}).
- [Upgrade a cluster in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/upgrade-cockroach-version.md %}).
- [Install CockroachDB {{ site.data.products.core }}]({% link {{site.current_cloud_version}}/install-cockroachdb.md %})
- [Upgrade a Self-Hosted cluster]({% link {{site.current_cloud_version}}/upgrade-cockroach-version.md %}).

Be sure to review Cockroach Labs' [Release Support Policy]({% link releases/release-support-policy.md %}) and review information about applicable [software licenses](#licenses).