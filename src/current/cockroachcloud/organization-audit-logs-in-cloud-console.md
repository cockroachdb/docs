---
title: View Organization Audit Logs in the Cloud Console
summary: Learn how to view CockroachDB Cloud organization audit logs in the Cloud Console.
toc: true
docs_area: manage
cloud: true
---

CockroachDB {{ site.data.products.cloud }} captures audit logs when many types of events occur, such as when a cluster is created or when a user is added to or removed from an organization.

## View audit logs

1. Navigate to the [CockroachDB Cloud Console](https://cockroachlabs.cloud/) and log in as an account with the [Organization Admin role]({% link cockroachcloud/authorization.md %}#org-administrator).
1. In the top navigation bar, select **Organization**, then choose **Audit Logs** from the dropdown menu. This will bring you to the **Audit Logs** page, which shows a (possibly empty) list of audit logs.

## Filter audit logs
Filter the audit logs by the following fields:

- **Time Range (UTC)**: 
  - Default: Last 48 hours.
  - To set the time range, select **Start date** or **End date**. Select your desired time range in the calendar dropdown or type in your desired dates and times. 
- **User email**: Optionally select one or more email addresses of the [organization's members]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users).
- **Action name**: Optionally select one or more predefined auditable actions.
- **Cluster name**: Optionally select one or more cluster names.

## Audit logs table

If audit logs are found for the filter selections, a table will be displayed with the following columns:

- **Time (UTC)**
- **Users**: Either a member's email or a [service account name]({% link cockroachcloud/managing-access.md %}#manage-service-accounts). (Note: There is no filter for service account names.)
- **Action name**
- **Cluster name**
- **Source**: either `UI` or [`API`]({% link cockroachcloud/cloud-api.md %})

## Audit log details

Click on a log row in the audit logs table to open an **Action details** right sidebar displaying event information, including the full payload in the **Details** section.

## URL Query Parameters

All selected filters are reflected in the URL query parameters, making it easy to share specific views. For example:

- `startingFrom` and `endingAt` for time range
- `logId` for the **Action ID** of an expanded log entry in the sidebar

```
https://cockroachlabs.cloud/audit-logs?startingFrom=2025-03-04T19%3A51%3A36.590Z&endingAt=2025-03-07T19%3A51%3A36.000-05%3A00&logId=78d55b3c-424e-45fa-bbce-03f2ed738897
```

## Examples

For organization administrators, security teams, and compliance officers, audit logs provide critical insights into system activities. These logs are essential for:

- Tracking user role changes
  - Example: To identify when and by whom an Admin role was assigned, filter by action `ADD_USER_TO_ROLE`.
- Investigating cluster costs
  - Example: To determine who created a cluster and when, filter by action `CREATE_CLUSTER`.
- Understanding IP allowlisting changes
  - Example: To identify why and by whom an IP address was added, filter by action `ADD_IP_ALLOWLIST`.
- Verifying cluster deletions
  - Example: To ensure cluster deletions were intentional, filter by action `DELETE_CLUSTER`.
- Diagnosing performance issues
  - Example: To track configuration changes affecting performance, filter by action `UPDATE_CLUSTER`
- Analyzing security threats
  - Example: To investigate failed login attempts and suspicious login activity, filter by action `USER_LOGIN`.
- Reviewing maintenance schedule changes
  - Example: To track modifications to maintenance windows, filter by actions `SET_CLUSTER_MAINTENANCE_WINDOW` and `DELETE_CLUSTER_MAINTENANCE_WINDOW`.

## See also
- [Export CockroachDB Cloud Organization Audit Logs](cockroachcloud/cloud-org-audit-logs)
