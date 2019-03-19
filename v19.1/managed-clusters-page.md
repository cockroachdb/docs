---
title: Clusters Page
summary: The Clusters page of the Console provides a high-level view of your clusters.
toc: true
build_for: [managed]
---

The **Clusters** page of the Console provides a high-level view of your clusters.

<img src="{{ 'images/v19.1/managed/all-clusters-page.png' | relative_url }}" alt="All Clusters" style="border:1px solid #eee;max-width:100%" />

For each cluster, the following details display:

- The cluster's **Name**
- The **Version** of CockroachDB the cluster is running
- The **Regions** the cluster is in
- The date and time the cluster was **Created**

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](managed-cluster-overview.html) page will display.

## Access tab

On the **Clusters > Access** tab, Console administrators can manage Console access settings for the organization.

<img src="{{ 'images/v19.1/managed/access-tab.png' | relative_url }}" alt="Access tab" style="border:1px solid #eee;max-width:100%" />

### Add Console users

To add Console users:

1. Click **Invite User** in the top left corner.

    The **Invite Team Members** modal displays.

    <img src="{{ 'images/v19.1/managed/invite-team-members-modal.png' | relative_url }}" alt="Invite team members" style="border:1px solid #eee;max-width:100%" />

2. Enter the user's **Email**.
3. To add multiple users, click **Add another** and repeat steps 3 and 4.
4. When you are done adding users, click **Invite**.

    An email will be sent to the users you have invited.
