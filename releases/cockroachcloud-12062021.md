---
title: What's New in CockroachDB Cloud
toc: true
summary: Additions and changes in CockroachDB Cloud since November 8, 2021.
---

## December 6, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

- New {{ site.data.products.db }} clusters will now run [v21.2.1](v21.2.1.html).
- New {{ site.data.products.db }} clusters will now have [Admission Control](../{{site.versions["stable"]}}/architecture/admission-control.html) enabled by default.
- {{ site.data.products.dedicated }} clusters will now run on new [machine types and disks](../cockroachcloud/create-your-cluster.html#step-2-select-the-cloud-provider). Clusters created before December 1, 2021 will be transitioned to the new hardware configurations by the end of the month, and pricing may change slightly.

### Console changes

- The **Add/remove nodes** button is now disabled for custom clusters. If you are a contract customer and would like to scale your custom cluster, [contact Support](https://support.cockroachlabs.com/).

### Bug fixes

- Fixed a bug where an error was occurring on the [VPC Peering and AWS PrivateLink](../cockroachcloud/network-authorization.html) pages for clusters with a large number of jobs.
- Fixed a bug where the **Test email alerts** section on the [**Alerts** page](../cockroachcloud/alerts-page.html) was not visible for organizations with only custom clusters.
- Fixed a bug where users were prompted to upgrade {{ site.data.products.serverless }} clusters, which are [upgraded automatically](../cockroachcloud/upgrade-policy.html).
- Previously, [SQL metrics graphs](../cockroachcloud/cluster-overview-page.html) for inactive {{ site.data.products.serverless }} clusters showed discontinuous timeseries lines or an error message. Continuous graphs will now remain available for scaled down clusters.