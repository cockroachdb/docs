---
title: Organize CockroachDB Cloud Clusters Using Folders
summary: Learn how to use folders to organize CockroachDB Cloud clusters and manage access to them.
toc: true
docs_area: manage
---

This page explains how to organize and manage access to your {{ site.data.products.db }} organization's clusters with folders using the CockroachDB {{ site.data.products.cloud }} Console. You can also use the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}), or the [Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) v1.1.0 or above. For more details about managing access to {{ site.data.products.db }} resources, refer to [Managing Users, Roles, and Service Accounts in {{ site.data.products.db }}]({% link cockroachcloud/managing-access.md %}).

{{site.data.alerts.callout_success}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

## How folders work

Folders allow you to organize and manage access to your clusters according to your organization's requirements, and to [summarize billing by folder]({% link cockroachcloud/billing-management.md %}#view-invoices). For example, you can create top-level folders for each business unit in your organization, and within those folders, you can organize clusters by geographic location and then by their level of maturity, such as production, staging, and testing. For more details, refer to [Folder Structure](#folder-structure).

Each folder can contain a mix of folders and clusters. Roles assigned on a folder are inherited by its descendants.

Each folder is assigned a unique ID when it is created, and each folder and cluster has an optional _parent ID_ field, which determines its position in the organization's hierarchy.

- Clusters or folders within a folder have their parent ID set to that folder's ID.
- A cluster or folder created at the root level of the organization has no parent ID. When using the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}), you can either omit the parent ID for a folder or cluster, or set it to `root`, to create it at or move it to the root level.
- Moving a folder is a lightweight operation that does not modify the folder itself or its descendant folders or clusters; only the folder's parent ID field is updated. Similarly, when moving a cluster into or out of a folder, only the cluster's parent ID field is updated. If you move a folder that contains descendant resources, the descendant resources are not directly modified.

A folder operation may fail if it violates [folder naming](#folder-naming) or [folder structure](#folder-structure) restrictions or if you attempt to move a folder into itself or into one of its descendant folders.

### Folder naming

- Folder names must begin and end with a letter or number. The only allowed special characters are spaces, hyphens, apostrophes, and underscores.
- Folder names must be at least 3 characters long and cannot exceed 40 characters.

### Folder structure

Folders give you the flexibility to organize and manage access to your clusters using the structure that makes the most sense for your organization. Keep the following structural limitations in mind:

- Folders can be nested a maximum of four levels deep, including the root organization level. A folder at the maximum depth can contain only clusters.

    In the following scenario, cluster `Cluster B2` is allowed within `Subfolder B2`, but `Subfolder B3` cannot be created, because it is nested too deeply.

    ~~~
    root
      -- Folder A
          -- Subfolder A
      -- Folder B
          -- Subfolder B
            -- Subfolder B2
              -- Cluster B2
              -- Subfolder B3     <-- Too deep, violates folder structure
    ~~~

- An organization can have a maximum of 65 folders, regardless of how they are organized.

Operations that violate these restrictions result in an error.

### Folders and role assignment

A role granted on a folder is inherited on its descendant folders and clusters. All existing organizational roles, such as [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator) or [Cluster Creator]({% link cockroachcloud/authorization.md %}#cluster-creator), can be granted at the folder scope.

A role granted directly on a cluster is unchanged if the cluster is moved into or out of a folder.

The following roles, when granted at the organization level, allow reading of the entire folder hierarchy:

- Org Administrator
- Cluster Administrator
- Cluster Operator
- Cluster Developer

The following roles allow creation of clusters at the level of the hierarchy where they are granted:

- Cluster Administrator
- Cluster Creator

The following additional roles explicitly allow management of folders and their contents:

- {% include cockroachcloud/org-roles/folder-admin.md %}

- {% include cockroachcloud/org-roles/folder-mover.md %}

The remainder of this page shows how to create folders, manage access to them, and use them to organize your clusters.

## Initial setup

Your user account must have the following roles to manage access to folders:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin)

{{site.data.alerts.callout_success}}
An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can grant themselves, another user, or a service account the Folder Admin role.
{{site.data.alerts.end}}

## Grant the `FOLDER_ADMIN` or `FOLDER_MOVER` role

Folders inherit roles granted higher in the hierarchy, and folders at the root level inherit roles granted at the organization scope. To create a folder, a team member must have the `FOLDER_ADMIN` role on its parent folder. To create a folder at the root level, a team member must have the `FOLDER_ADMIN` role at the level of the organization.

{{site.data.alerts.callout_success}}
To create clusters in a folder, the member must also have the `CLUSTER_ADMIN` or `CLUSTER_CREATOR` role on that folder or by inheritance.
{{site.data.alerts.end}}

To grant the `FOLDER_ADMIN` role:

1. On the **Access Management** page, locate the team member's details whose role you want to change.
1. In the row for the target member, click the three-dots **Action** button and select **Edit Roles**.
1. Set **Scope** to **Organization** or to a folder in the hierarchy. The role is granted on all of the folder's descendants.
1. Set **Role** to **Folder Admin** or **Folder Mover**.
1. Click **Confirm**.

## Create a folder

Your service account must have the following roles on the organization, the folder, or by inheritance:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin)

1. Go to the **Clusters** page. The folders and clusters at the root of the organization are shown.
1. If you have permission to create folders at the root of the organization, the **Create folder** option is displayed. Click it to create a folder.
1. In **Folder name**, provide a name for the folder.
1. In **Folder location**, choose the folder's location. Only locations where you have permission to create folders are shown.
  - To create the folder at the level of the organization, select the organization name.
  - To create the folder within another folder, select the parent folder.
1. Click **Create**.

## Manage access to a folder

1. To manage access to a folder, go to **Organization** > **Access Management**.
1. In the row for the target member, click the three-dots **Action** button and select **Edit Roles**.
1. Set **Scope** to the folder you just created. The role is granted on all of the folder's descendants.
1. Set **Role** to **Folder Admin** or **Folder Mover**.

    To access a folder's clusters, a user or service account must also have the **Cluster Administrator**, **Cluster Creator**, or **Cluster Operator** role on the folder. The role may be granted by inheritance or directly on a cluster.

1. Click **Confirm**.

## List folder contents

Your service account must have one of the following roles to read a folder's contents:

- [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator).
- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) or [Folder Mover]({% link cockroachcloud/authorization.md %}#folder-mover).
- [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator), [Cluster Developer]({%link cockroachcloud/authorization.md %}#cluster-developer), [Cluster Creator]({% link cockroachcloud/authorization.md %}#cluster-creator), or [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator).

1. To list the clusters and folders at the level of the organization, go to **Clusters**.
1. To list the clusters and folders in a folder, click the folder name.
1. To view details about a cluster, click the cluster name.

## Create a cluster in a folder

Your service account must have the following roles on the organization or the folder:

- [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator) or [Cluster Creator]({% link cockroachcloud/authorization.md %}#cluster-creator)

1. Go to the **Clusters** page. The folders and clusters at the root of the organization are shown.
1. Browse to the folder where you want to create the cluster.
1. Click **Create**, then click **Create cluster**.
    {{site.data.alerts.callout_info}}
    If you do not have permission to create folders at this location, you will see only **Create cluster**.
    {{site.data.alerts.end}}
1. Configure the cluster as desired, then click **Create Cluster**.
1. To grant others roles directly on the newly-created cluster:
    1. Go to **Organization** > **Access Management**.
    1. In the row for the target member, click the three-dots **Action** button and select **Edit Roles**.
    1. Set **Scope** to the folder you just created.
    1. Set **Role** to the role you want to grant.
    1. Click **Confirm**.

## Move a cluster into or out of a folder

Your service account must have permission to move clusters at both the source and destination locations. This permission is provided by the following roles:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) or [Folder Mover]({% link cockroachcloud/authorization.md %}#folder-mover)

Folder Movers can move clusters within the folder hierarchy even if they do not have a role that allows them to connect to the cluster, such as Cluster Creator or Cluster Operator.

{{site.data.alerts.callout_info}}
When you move a cluster into or out of a folder, users or service accounts who had access to the previous location through inheritance may lose access. Roles granted directly on a cluster do not change when the cluster is moved.
{{site.data.alerts.end}}

To move a cluster from the organization level into a folder, or to move it from one folder to another:

1. Go to the **Clusters** page. The folders and clusters at the root of the organization are shown.
1. Browse to the folder that contains the cluster, then click the cluster name to open its details.
1. Click **Actions** > **Move Cluster**.
1. In the dialog, select the destination to move the cluster to, then click **Next**.
1. Click **Move**.

To move a cluster to a new folder from the **Clusters** page:

1. Browse to the location of the destination folder.
1. Click the the three-dots **Action** button, then select **Move**.

{{site.data.alerts.callout_info}}
A cluster is [billed]({% link cockroachcloud/billing-management.md %}#view-invoices) to the folder it resides in at the end of the billing period, even if it was moved from one folder to another during the billing period.
{{site.data.alerts.end}}

## Move a folder into another folder

Your service account must have permission to move folders at both the source and destination locations. This permission is provided by the following roles:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) or [Folder Mover]({% link cockroachcloud/authorization.md %}#folder-mover)

{{site.data.alerts.callout_info}}
When you move a folder, users or service accounts who had access to the previous location through inheritance may lose access to its descendant folders and clusters. Roles granted directly on a folder or a cluster do not change when the folder or cluster is moved.
{{site.data.alerts.end}}

To move a folder and its contents into another folder:

1. Go to the **Clusters** page. The folders and clusters at the root of the organization are shown.
1. Browse to the location of the folder that you want to move.
1. Next to the folder you want to move, click the three-dots **Action** button and select **Move folder**.
1. In the dialog, set **Destination** to the new location for the folder, then click **Next**.
1. Click **Move**.

## Delete a folder

Your service account must have the following roles on the organization, the folder, or by inheritance:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin)

{{site.data.alerts.callout_info}}
Only an empty folder can be deleted.
{{site.data.alerts.end}}

To delete a folder:

1. Move or delete all descendant folders and clusters.
1. Go to the **Clusters** page. The folders and clusters at the root of the organization are shown.
1. Browse to the location of the folder that you want to delete.
1. Next to the folder you want to delete, click the three-dots **Action** button and select **Delete folder**.
1. Type the name of the folder to confirm, then click **Delete**.

## Limitations

- Folders can be nested a maximum of four levels deep, including the organization level.
- An organization can have a maximum of 65 folders, regardless of how they are organized.
- You can manage folders using the CockroachDB {{ site.data.products.cloud }} Console, the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}), or the [Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) v1.1.0 or above. {% include cockroachcloud/limitations/limitation-ccloud-folders.md %}

## See also

- [CockroachDB Cloud Access Management (Authorization) Overview]({% link cockroachcloud/authorization.md %})
- [Manage Users, Roles, and Service Accounts]({% link cockroachcloud/managing-access.md %})
