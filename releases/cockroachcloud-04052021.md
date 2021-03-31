---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud since March 8, 2021.
---

## April 5, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

New CockroachCloud clusters will now run CockroachDB [v20.2.7](20.2.7.html).

### Console changes

- The login form no longer focuses on the email
  field on page load. This change makes the form more flexible once other
  authentication methods are available.
- Extraneous information is no longer displayed in the
  error for failed GCP peering attempts.

### Bug fixes

- The region shown in the GUI for free-tier
  clusters is now correct. Previously, the GUI showed the wrong
  region when creating an AWS free-tier cluster.
- Fixed a bug where an error was thrown when
  displaying the **Connect** modal for an old GCP cluster that does not have
  the custom `crdb` network. These clusters do not support VPC peering, but
  the lack of the `crdb` network was causing the listing of VPC peerings
  to fail even though no such peerings exist.
