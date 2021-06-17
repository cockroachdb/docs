---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud since May 3, 2021.
---

## June 7, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

- New CockroachCloud clusters will now run CockroachDB [v21.1.1](v21.1.1.html).
  
### Console changes

- All CockroachCloud Dedicated users now have access to the [**Statements**](../cockroachcloud/statements-page.html) and [**Sessions**](../cockroachcloud/sessions-page.html) pages in the Console.
- All CockroachCloud Dedicated users now have access to the [**Alerts**](../cockroachcloud/alerts-page.html) page in the Console, which allows you to toggle alerts, send test alerts, and manage alert recipients for your Organization.
- Previously, users were getting stuck during the verification step of creating an [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) endpoint. Now, users can enter the verification step of the **Add Endpoint Connection** dialog with an incomplete connection endpoint ID preset.
- Added a **Cloud** column to the **Clusters** page so users can see which cloud provider any cluster is using without having to click through to the **Cluster Overview** page.
- The maximum number of nodes in a cluster created through the Console was raised to 50 nodes per region and 150 nodes per cluster.

### Bug fixes

- Fixed a bug where clicking the **Logout** button would trigger an error and display a blank page.
- The page will no longer refresh after switching the authentication method through the **Account** page.
- Switching organizations will no longer log you out of all sessions.
