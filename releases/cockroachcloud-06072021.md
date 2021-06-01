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
- Users can now create [multi-region clusters](../cockroachcloud/create-your-cluster.html) and [add or remove regions](../cockroachcloud/cluster-management.html?filters=dedicated#add-or-remove-regions-from-a-cluster) to or from existing clusters.
  
### Console changes

- Previously, users were getting stuck during the verification step of creating an [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) endpoint. Now, users can enter the verification step of the **Add Endpoint Connection** dialog with an incomplete connection endpoint ID preset.
- Added a **Cloud** column to the **Clusters** page so users can see which cloud provider any cluster is using without having to click through to the **Cluster Overview** page.
- There is no longer a maximum number of nodes per cluster, but there is a maximum of 50 nodes per region.
- Updated the Statements and Sessions views in 21.1 clusters that are supported by protobufs in CRDB 21.1.0

### Bug fixes

- Fixed a bug where clicking the **Logout** button would trigger an error and display a blank page.
- The page will no longer refresh after switching the authentication method through the **Account** page.
- Switching organizations will no longer log you out of all sessions.
