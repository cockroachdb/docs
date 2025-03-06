---
title: View Organization Audit Logs in Cloud Console
summary: Learn about viewing CockroachDB Cloud organization audit logs in the Cloud Console.
toc: true
docs_area: manage
cloud: true
---

CockroachDB {{ site.data.products.cloud }} captures audit logs when many types of events occur, such as when a cluster is created or when a user is added to or removed from an organization.

## Why audit logs matter
For organization administrators, security teams, and compliance officers, audit logs provide critical insights into system activities. These logs are essential for:
- Tracking user role changes (e.g., identifying when and by whom an Admin role was assigned)
- Investigating cluster costs (e.g., determining who created a cluster and when)
- Understanding IP allowlisting changes (e.g., identifying why and by whom an IP address was added)
- Verifying cluster deletions (e.g., ensuring deletions were intentional, prompted by alerts)
- Diagnosing performance issues (e.g., tracking configuration changes affecting performance)
- Analyzing security threats (e.g., investigating failed login attempts and suspicious activity)
- Reviewing maintenance schedule changes (e.g., tracking modifications to maintenance windows)

## View audit logs

1. Navigate to the [CockroachDB Cloud Console](https://cockroachlabs.cloud/) and log in as an account with the [Organization Admin role]({% link cockroachcloud/authorization.md %}#org-administrator).
1. Select **Organization** » **Audit Logs** from the top navigation bar dropdown. This will bring you to the **Audit Logs** page, which shows a (possibly empty) list of audit logs.

## Filter audit logs
Filter the audit logs by the following fields:

- **Time Range (UTC)**: 
  - Default: Last 48 hours.
  - To set the time range, click on the **Start date** or **End date**. Select your desired time range in the calendar dropdown or type in your desired dates and times. 
- **User email**: Optionally select one or more email addresses of the [organization's members]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users).
- **Action name**: Optionally select one or more predefined auditable actions.
- **Cluster name**: Optionally select one or more cluster names.

## Audit log details
 Click on a log entry to open an **Action details** right sidebar displaying event information, including the full payload in the **Details** section.

## URL Query Parameters

The state of all selected filters is reflected in the URL query parameters for easy sharing, such as

- `startingFrom` and `endingAt` for time range
- `logId` for the **Action ID** of an expanded log entry in the sidebar

For example:

```
https://cockroachlabs.cloud/audit-logs?startingFrom=2025-03-04T19%3A51%3A36.590Z&endingAt=2025-03-07T19%3A51%3A36.000-05%3A00&logId=78d55b3c-424e-45fa-bbce-03f2ed738897
```

## Data Presentation

If audit logs are found for the filter selections, a table will be displayed with the following columns:

- **Time (UTC)**
- **Users**: either member email or [service account name]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) (Note that there is no filter for service account name)
- **Action name**
- **Cluster name**
- **Source**: either `UI` or [`API`]({% link cockroachcloud/cloud-api.md %})

## See also
- [Export CockroachDB Cloud Organization Audit Logs](cockroachcloud/cloud-org-audit-logs)