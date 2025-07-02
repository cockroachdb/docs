---
title: View Organization Audit Logs in the Cloud Console
summary: Learn how to view CockroachDB Cloud organization audit logs in the Cloud Console.
toc: true
docs_area: manage
cloud: true
---

CockroachDB {{ site.data.products.cloud }} captures audit logs when many types of events occur, such as when a cluster is created or when a user is added to or removed from an organization.

## View audit logs

To access the **Audit Logs** page:

1. Navigate to the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/) and log in as a user with the [Organization Admin role]({% link cockroachcloud/authorization.md %}#organization-admin).
1. In the top navigation bar, open the **Organization** menu and select **Audit Logs**.

## Filter audit logs

Filter the audit logs by the following fields:

- **Time Range (UTC)**: 
  - Default: Last 48 hours.
  - To set the time range, click the **Time Range (UTC)** field. You can select a **Start date** and **End date** from the displayed calendar or manually enter dates and times for the range.
- **User email**: Select one or more email addresses from the list of [organization members]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users) (optional).
- **Action name**: Select one or more predefined auditable actions (optional).
- **Cluster name**: Select one or more cluster names (optional).

## Audit Logs table

If audit logs are found for the filter selections, a table is displayed with the following columns:

- **Time (UTC)**
- **User**: Displays the following:

  - User's email if **Source** is `UI`.
  - [Service account name]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) if **Source** is `API`. *(Note: You cannot filter by service account name.)*
  - `CRL User` if **Source** is `CRL`. *(Note: You cannot filter by `CRL User`.)*
- **Action name**
- **Cluster name**
- **Source**: Displays the following:
  
  - `UI` for actions executed in the {{ site.data.products.cloud }} Console.
  - `API` for actions executed via the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}).
  - `CRL` for actions executed by Cockroach Labs.

## Audit log details

Click a row in the Audit Logs table to open the **Action details** panel, which displays event information, including the full payload in the Details section.

## URL query parameters

All selected filters are reflected in the URL query parameters, making it easy to share specific views. For example:

- `startingFrom` and `endingAt`: Define the selected time range.
- `logId`: Specifies the **Action ID** of an expanded log entry in the sidebar.

```
https://cockroachlabs.cloud/audit-logs?startingFrom=2025-03-04T19%3A51%3A36.590Z&endingAt=2025-03-07T19%3A51%3A36.000-05%3A00&logId=78d55b3c-424e-45fa-bbce-03f2ed738897
```

## Example use cases

For organization administrators, security teams, and compliance officers, audit logs provide critical insights into system activities. These logs are essential for:

- Tracking user role changes
  - Example: To identify when and by whom an Admin role was assigned, filter by the action `ADD_USER_TO_ROLE`.
- Investigating cluster costs
  - Example: To determine who created a cluster and when, filter by the action `CREATE_CLUSTER`.
- Understanding IP allowlisting changes
  - Example: To identify why and by whom an IP address was added, filter by the action `ADD_IP_ALLOWLIST`.
- Verifying cluster deletions
  - Example: To ensure cluster deletions were intentional, filter by the action `DELETE_CLUSTER`.
- Diagnosing performance issues
  - Example: To track configuration changes affecting performance, filter by the action `UPDATE_CLUSTER`.
- Analyzing security threats
  - Example: To investigate failed login attempts and suspicious login activity, filter by the action `USER_LOGIN`.
- Reviewing maintenance schedule changes
  - Example: To track modifications to maintenance windows, filter by the actions `SET_CLUSTER_MAINTENANCE_WINDOW` and `DELETE_CLUSTER_MAINTENANCE_WINDOW`.

## See also

- [Export CockroachDB {{ site.data.products.cloud }} Organization Audit Logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
