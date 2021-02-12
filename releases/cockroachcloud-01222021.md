---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud since December 11, 2020.
---

## January 22, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General Changes

New CockroachCloud clusters will now run CockroachDB [v20.2.3](v20.2.3.html).

### Bug Fixes

- Fixed a bug where deleting your only organization would prevent your email from being used for a new organization in the future.
- Fixed a bug where [VPC peering](../cockroachcloud/network-authorization.html#vpc-peering) appeared to be available on clusters that it wasn't supported on.
