---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud since February 9, 2021.
---

## March 8, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

New CockroachCloud clusters will now run CockroachDB [v20.2.5](v20.2.5.html).

### Console changes

- Self-service [AWS PrivateLink](../cockroachcloud/connect-to-your-cluster.html#establish-vpc-peering-or-aws-privatelink) is now generally available for CockroachCloud clusters running on AWS.
- On the [**Clusters** page](../cockroachcloud/cluster-management.html#view-clusters-page), clusters that are running unsupported versions now have a warning in the **Version** column.

### Security updates

- CockroachCloud now does not include the supplied password in error messages that arise from resetting, editing, or creating a password when the password is too short.
- CockroachCloud now prevents clickjacking attacks by specifying `X-Frame-Options: DENY` when serving `index.html`.

### Bug fixes

- Previously, users who were not a member of any organization would get an error when trying to reset their password. A user would most likely encounter this scenario if they deleted their organization, tried to log in again, and didn't remember their password. Now, an organization will be created for the user if one does not exist. The [organization name can be edited](../cockroachcloud/create-an-account.html#change-your-organization-name) on the **Settings** tab on the organization's landing page.
