---
title: Organize CockroachDB Cloud Clusters Using Folders
summary: Learn how to use folders to organize CockroachDB Cloud clusters and manage access to them.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_success}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

This page explains how to organize and manage access to your {{ site.data.products.db }} organization's clusters using folders. For more details about managing access to {{ site.data.products.db }} resources, refer to [Managing Users, Roles, and Service Accounts in {{ site.data.products.db }}]({% link cockroachcloud/managing-access.md %}).

## How folders work

Folders allow you to organize and manage access to your clusters according to your organization's requirements. For example, you can create top-level folders for each business unit in your organization, and within those folders, you can organize clusters by geographic location and then by their level of maturity, such as production, staging, and testing. For more details, refer to [Folder Structure](#folder-structure).

Each folder can contain a mix of folders and clusters. Roles assigned on a folder are inherited by its descendants.

Each folder that you create has an ID. To create a cluster in a folder or to move a cluster into a folder, you set its `parent_id` field to the folder's ID.

If no parent ID is specified for a cluster, it is created at the root level of the organization. Clusters and folders at the organization level have their `parent_id` set to `root`.

To move a folder or a cluster, you update its `parent_id`. If you move a folder that contains descendant resources, the descendant resources are not directly modified. A folder operation may fail in the following circumstances:

- A naming collision, such as an attempt to move a folder into a location that already contains a folder with the same name. Name collisions are limited to other folders. A folder and cluster at the same level of the hierarchy can share a name.
- A violation of the [folder structure](#folder-structure) limitations.
- An attempt to move a folder into itself or into one of its descendant folders.

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
              -- Subfolder B3
    ~~~

- Each folder, including the root of the organization, can contain a maximum of 200 direct descendants, including folders or clusters.

Operations that violate these limitations result in an error.

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

- **Folder Admins** can create, rename, and move, or delete folders where they are granted the role, and they can also manage access to these folders. This role can be granted at the level of the organization or on a specific folder. If granted on a specific folder, the role is inherited by descendant folders.

    A user with the [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) role can grant themselves, another user, or a service account the Folder Admin role.

    To create or manage clusters in a folder, a Folder Admin also needs the Cluster Administrator or [Cluster Creator]({% link cockroachcloud/authorization.md %}#cluster-creator) role on that folder directly or by inheritance. To delete a cluster, the Cluster Administrator role is required on the cluster directly or by inheritance.

- **Folder Movers** can rename or move descendant folders, and can move clusters within the folder hierarchy where they have the role. However, Folder Movers cannot create or delete folders or clusters, and cannot assign roles. Folder Movers can move clusters within the folder hierarchy even if they do not have a role that allows them to connect to the cluster, such as Cluster Creator or Cluster Operator.

    {{site.data.alerts.callout_info}}
    A cluster cannot be renamed.
    {{site.data.alerts.end}}

    A user with the Org Administrator or Folder Admin role can grant another user or a service account the Folder Mover role. Because the Folder Admin role is a superset of Folder Mover, there is no need for a Folder Admin to grant themselves the Folder Mover role.

The remainder of this page shows how to create folders, manage access to them, and use them to organize your clusters.

## Initial setup

During Limited Access:

- Using folders requires the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) or the [Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) v1.1.0 or above.
- The folder structure is not visible in the {{ site.data.products.cloud }} console.
- In the {{ site.data.products.cloud }} Console, all clusters that a user has permission to access are shown in a flat list. All other clusters are hidden.

### Gather required information

Your user account must have the following roles to create a service account and grant roles at the organization scope:

- [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator)

1. Sign in to the {{ site.data.products.db }} Console.

1. From the **Organization** **Information** page, make a note of your organization's ID.

1. [Create a service account]({% link cockroachcloud/managing-access.md %}#create-a-service-account) and grant it the Organization Admin role. When prompted, create an API key for the service account and copy it to a secure location. In the service account's **Details** page, make a note of the service account's ID, which is the portion of the URL after the last `/` character.

    This service account will be referred to as the _provisioning service account_ in the remainder of this page.

1. Create a second service account and grant it the Cluster Admin role. This service account will be referred to as the folder-management service account. When prompted, create an API key for the service account and copy it to a secure location. In the service account's **Details** page, make a note of the service account's ID, which is the portion of the URL after the last `/` character.

    This service account will be referred to as the _folder-management service account_ in the remainder of this page.

### Grant the `FOLDER_ADMIN` role to the service account

Folders inherit roles granted at the organization scope, and descendant folders inherit roles granted higher in the hierarchy.

During Limited Access, it is not possible to use the {{ site.data.products.db }} Console to grant the Folder Admin or Folder Mover roles.
Instead, use the CockroachDB {{ site.data.products.db }} API and the provisioning service account you created in [Gather required information](#gather-required-information) to grant the folder-management service account the `FOLDER_ADMIN` role at the level of the organization.

1. To grant the role at the level of the organization:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request POST \
           --url 'https://cockroachlabs.cloud/api/v1/roles/<folder-management-service-account-id>/ORGANIZATION/<organization_id>/FOLDER_ADMIN' \
           --header 'Authorization: Bearer <provisioning_service_account_api-key>'
    ~~~

    Replace:
    - `<service-account-id>`: the ID of the service account that is _being granted_ the role.
    - `<organization-id>` the ID you gathered in [Gather Required Information](#gather-required-information).
    - `<api-key>`: the API key of the service account that is _granting_ the role.

    After your desired folder structure is in place, you could revoke the role from the organization and grant it on individual folders instead. A recommended security practice is to limit the users or service accounts with `FOLDER_ADMIN` at the level of the organization. When you [create a folder](#create-a-folder-and-grant-access-to-it), you can grant the `FOLDER_ADMIN` role at the level of the folder.

1. To revoke the role at the level of the organization:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request DELETE \
           --url 'https://cockroachlabs.cloud/api/v1/roles/<user-id>/ORGANIZATION/<organization_id>/FOLDER_ADMIN' \
           --header 'Authorization: <api-key>'
    ~~~

    Replace:
    - `<service-account-id>`: the ID of the service account that is _being granted_ the role.
    - `<organization-id>` the ID you gathered in [Gather Required Information](#gather-required-information).
    - `<api-key>`: the API key of the service account that is _granting_ the role.

1. Optionally, you can now delete the provisioning service account. In the remainder of this page, replace `<api-key>` with the API key for the folder-management service account.

## Create a folder and grant access to it

Your service account must have the following roles on the organization, the folder, or by inheritance:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin)

1. To create a folder at the organization level, you can omit the `parent_id` field or set it `parent_id` to `root`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request POST \
           --url 'https://cockroachlabs.cloud/api/v1/folders' \
           --header 'Authorization: Bearer <api-key>' \
           --data '{"name" : "<folder_name>", "parent_id": "root"}'
    ~~~

    Replace:
    - `<folder_name>`: a name for the folder.
    - `<api-key>`: your service account's API key.

    The response includes the new folder's ID.

1. To create a descendant folder within a folder, set `parent_id` to the folder's ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request POST \
           --url 'https://cockroachlabs.cloud/api/v1/folders' \
           --header 'Authorization: Bearer <api-key>' \
           --data '{"name" : "<folder_name>", "parent_id": "<parent_id>"}'
    ~~~

    Replace:
    - `<folder_name>`: a name for the folder.
    - `<api-key>`: your service account's API key.
    - `<parent-id>`: the ID of the folder that will contain the new folder.

1. To grant your service account the `FOLDER_ADMIN` role on a folder and its descendant folders:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request POST \
           --url 'https://cockroachlabs.cloud/api/v1/roles/<service-account-id>/FOLDER/<folder-id>/FOLDER_ADMIN' \
           --header 'Authorization: Bearer <api-key>'
    ~~~

    Replace:
    - `<service-account-id>`: the ID of the service account that is _being granted_ the role.
    - `<organization-id>` the ID you gathered in [Gather Required Information](#gather-required-information).
    - `<api-key>`: the API key of the service account that is _granting_ the role.

    {{site.data.alerts.callout_info}}
    You can also grant the role to a human user. However, during Limited Access, only a service account using the {{ site.data.products.db }} API or Terraform provider can manage folders.
    {{site.data.alerts.end}}

1. If you grant the role at the level of the organization, it is inherited on all folders. To give your service account the `FOLDER_MOVER` role at the organization level:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request POST \
           --url 'https://cockroachlabs.cloud/api/v1/roles/<service-account-id>/ORGANIZATION/<organization-id>/FOLDER_ADMIN' \
           --header 'Authorization: Bearer <api-key>'
    ~~~

    Replace:
    - `<service-account-id>`: the ID of the service account that is _being granted_ the role.
    - `<organization-id>` with the ID you gathered in [Gather Required Information](#gather-required-information).
    - `<api-key>`: the API key of the service account that is _granting_ the role.

To access a folder's clusters, a user or service account must also have the Cluster Administrator, Cluster Creator, or Cluster Operator role on the folder. The role may be granted by inheritance or directly on a cluster.

## List folder contents

Your service account must have one of the following roles to read a folder's contents:

- [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator).
- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) or [Folder Mover]({% link cockroachcloud/authorization.md %}#folder-mover).
- [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator), [Cluster Developer]({%link cockroachcloud/authorization.md %}#cluster-developer), [Cluster Creator]({% link cockroachcloud/authorization.md %}#cluster-creator), or [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator).

{{site.data.alerts.callout_success}}
To discover the entire folder structure, you must list each folder's contents separately.
{{site.data.alerts.end}}

1. To list the clusters and folders at the level of the organization:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request GET \
           --url 'https://cockroachlabs.cloud/api/v1/folders/root/contents' \
           --header 'Authorization: Bearer <api-key>'
    ~~~

    Replace `<api-key>` with your service account's API key.

1. To list the clusters and folders contained within another folder, specify its ID instead of `root`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request GET \
           --url 'https://cockroachlabs.cloud/api/v1/folders/<folder_id>/contents' \
           --header 'Authorization: Bearer <api-key>'
    ~~~

    Replace:
    - `<folder-id>`: The ID of a folder.
    - `<api-key>`: Your service account's API key.

{{site.data.alerts.callout_info}}
In the API, each folder is referred to by its ID, regardless of where it is located in the hierarchy.
{{site.data.alerts.end}}

## Create a cluster in a folder

Your service account must have the following roles on the organization or the folder:

- [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator) or [Cluster Creator]({% link cockroachcloud/authorization.md %}#cluster-creator)

To create a cluster in a folder, set the `parent_id` field to the ID of the folder.

{{site.data.alerts.callout_info}}
If you do not specify a `parent_id`, or if you set `parent_id` to `root`, the cluster is created at the level of the organization.
{{site.data.alerts.end}}

For example, to create a {{ site.data.products.serverless }} deployed on GCP in a folder:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
       --url 'https://cockroachlabs.cloud/api/v1/clusters' \
       --header 'Authorization: Bearer <api-key>' \
       --header 'content-type: application/json' \
       --data '{"name":"<cluster_name>","provider":"GCP","spec":{"serverless":{"regions":["us-central1"],"spend_limit":0}, "parent_id":"<parent_id>"}}'
~~~

Replace:

- `<cluster_name>`: A name for the cluster. Replace `<parent_id>` with the ID of the folder.
- `<api-key>`: Your service account's API key.
- `<parent-id>`: The ID of a folder.

## Move a cluster into or out of a folder

Your service account must have permission to move clusters at both the source and destination locations. This permission is provided by the following roles:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) or [Folder Mover]({% link cockroachcloud/authorization.md %}#folder-mover)

{{site.data.alerts.callout_info}}
Folder Movers can move clusters within the folder hierarchy even if they do not have a role that allows them to connect to the cluster, such as Cluster Creator or Cluster Operator.
{{site.data.alerts.end}}

1. To move a cluster from the organization level into a folder, or to move it from one folder to another:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request PATCH \
           --url 'https://cockroachlabs.cloud/api/v1/clusters/<cluster-id>' \
           --header 'Authorization: Bearer <api-key>' \
           --header 'content-type: application/json' \
           --data '{"parent_id":"<parent_id>"}'
    ~~~

    Replace:
    - `<cluster-id>`: The ID of a cluster.
    - `<api-key>`: Your service account's API key.
    - `<parent-id>`: The ID of a folder.

1. To move a cluster out of a folder to the organization level:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request PATCH \
           --url 'https://cockroachlabs.cloud/api/v1/clusters/<cluster-id>' \
           --header 'Authorization: Bearer <api-key>' \
           --header 'content-type: application/json' \
           --data '{"parent_id":"root"}'
    ~~~

    Replace:
    - `<cluster-id>`: The ID of a cluster.
    - `<api-key>`: Your service account's API key.

{{site.data.alerts.callout_info}}
When you move a cluster into or out of a folder, users or service accounts who had access to the previous location through inheritance may lose access. Roles granted directly on a cluster do not change when the cluster is moved.
{{site.data.alerts.end}}

## Move a folder into another folder

Your service account must have permission to move folders at both the source and destination locations. This permission is provided by the following roles:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) or [Folder Mover]({% link cockroachcloud/authorization.md %}#folder-mover)

{{site.data.alerts.callout_info}}
When you move a folder, users or service accounts who had access to the previous location through inheritance may lose access to its descendant folders and clusters. Roles granted directly on a folder or a cluster do not change when the folder or cluster is moved.
{{site.data.alerts.end}}

1. To move a folder and its contents into another folder:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request PATCH \
           --url 'https://cockroachlabs.cloud/api/v1/folders/<folder-id>' \
           --header 'Authorization: Bearer <api-key>' \
           --header 'content-type: application/json' \
           --data '{"parent_id":"<parent_id>"}'
    ~~~

    Replace:
    - `<folder-id>`: The ID of the folder.
    - `<api-key>`: Your service account's API key.
    - `<parent-id>`: The ID of the new parent folder.

## Delete a folder

Your service account must have the following roles on the organization, the folder, or by inheritance:

- [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin)

{{site.data.alerts.callout_info}}
Only an empty folder can be deleted.
{{site.data.alerts.end}}

To delete a folder:

1. Move or delete all descendant folders and clusters.

1. Delete the folder:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request DELETE \
        --url 'https://cockroachlabs.cloud/api/v1/folders/<folder-id>' \
        --header 'Authorization: Bearer <api-key>' \
        --header 'content-type: application/json'
    ~~~

    Replace:

    - `<folder-id>`: The ID of the folder.
    - `<api-key>`: Your service account's API key.

## Limitations

- Folders can be nested a maximum of four levels deep, including the organization level.
- Each level of the hierarchy can contain a maximum of 200 direct descendant objects (folders or clusters).
- Using folders requires the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) or the [Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) v1.1.0 or above. It is not yet possible to view the folder structure, move resources, or assign the `FOLDER_ADMIN` or `FOLDER_MOVER` roles from the {{ site.data.products.db }} Console or by using the `ccloud` command.
- In the {{ site.data.products.cloud }} Console, all clusters that a user has permission to access are shown in a flat list. All other clusters are hidden.

## See also

- [CockroachDB Cloud Access Management (Authorization) Overview]({% link cockroachcloud/authorization.md %})
- [Manage Users, Roles, and Service Accounts]({% link cockroachcloud/managing-access.md %})
