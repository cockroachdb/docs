---
title: Role-based SQL Audit Logging
summary: Use the sql.log.user_audit cluster setting to turn SQL audit logging on or off for a user or role.
toc: true
docs_area: manage
---

Role-based SQL audit logging gives you detailed information about queries being executed against your system by specific users or roles. An event of type [`role_based_audit_event`]({% link {{ page.version.version }}/eventlog.md %}#role_based_audit_event) is recorded when an executed query belongs to a user whose role membership corresponds to a role that is enabled to emit an audit log via the [`sql.log.user_audit` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-log-user-audit). The event is logged in the [`SENSITIVE_ACCESS`]({% link {{ page.version.version }}/logging.md %}#sensitive_access) logging channel.

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}



This page shows how to enable role-based SQL audit logging in CockroachDB, including:

- [How to configure audit logging.](#configure-logging)
- [Where the audit log files are stored.](#file-storage-location)
- [What the audit log files look like.](#file-format)

{{site.data.alerts.callout_info}}
Logging, in general, can negatively impact performance. Log only what you require to limit impact to your workload.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For the best visibility into security-related events on your cluster, we recommend configuring `SENSITIVE_ACCESS` together with the `USER_ADMIN`, `PRIVILEGES`, and `SESSIONS` logging channels. To learn more, refer to [Logging Use Cases]({% link {{ page.version.version }}/logging-use-cases.md %}#security-and-audit-monitoring).
{{site.data.alerts.end}}

## Configure Logging

### Prerequisites

You must have:

- [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or `MODIFYCLUSTERSETTING` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) to configure the cluster setting,
- an [Enterprise license configured]({% link {{ page.version.version }}/licensing-faqs.md %}#set-a-license), and
- your [logging infrastructure configured]({% link {{ page.version.version }}/configure-logs.md %}), particularly the [location of audit logs](#file-storage-location).

### Syntax of audit settings

`sql.log.user_audit`

With the [`sql.log.user_audit` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-log-user-audit), you can set an audit logging configuration using a table-like syntax, as shown in the [Examples](#examples). Each row in the configuration represents an audit setting and must be separated by a new line. An audit setting is comprised of two columns separated by a space:

- `USER/ROLE`: the name of the user or role you want to audit.
    - The *special* `USER/ROLE` value `ALL` applies the audit setting to *all* users.
- `STATEMENT_FILTER`: the statement filter for the role. The following keywords are valid:
    - `ALL` will enable audit logging for all SQL statements for the given audit setting.
    - `NONE` will exclude audit logging for all SQL statements for the given audit setting.

Once `sql.log.user_audit` is set, the default behavior is for role-based SQL audit logging to take effect immediately within user sessions.

`sql.log.user_audit.reduced_config.enabled`

When enabled, the [`sql.log.user_audit.reduced_config.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-log-user-audit-reduced-config-enabled) computes a "reduced" audit configuration based on the user's current [role memberships]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) and the current value for the `sql.log.user_audit` cluster setting. The "reduced" audit configuration is computed at the **first SQL event emitted by the user, after the setting is enabled**. When the cluster setting is enabled, CockroachDB computes the audit configuration once at [session]({% link {{ page.version.version }}/show-sessions.md %}) start, instead of at each SQL event. However with the setting enabled, changes to the audit configuration (user role memberships or cluster setting configuration) are not reflected within a user session. To reflect the configuration changes in auditing behavior, users need to start a new session.

### Matching order

{{site.data.alerts.callout_info}}
The order in which the audit settings in the configuration are specified is important, as shown in the [example of a user with multiple roles](#user-with-multiple-roles). When determining whether to emit a log, the first audit setting that matches a user is the audit setting that gets applied. 
{{site.data.alerts.end}}

For each statement executed, CockroachDB gets the user's role memberships and iterates through the audit settings, looking for a matching audit setting by role or username. At the first audit setting match, CockroachDB stops iteration. If auditing is enabled (the `STATEMENT_FILTER` is set to `ALL`) for the matching audit setting, the statement is logged as an audit event. If the `STATEMENT_FILTER` is set to `NONE`, the statement is not logged.

### Validate setting

You can check the value of the `sql.log.user_audit` setting by running the [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}) command:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CLUSTER SETTING sql.log.user_audit;
~~~

## File format

Audit log messages, like all [log messages]({% link {{ page.version.version }}/logging-overview.md %}), consist of two sections:

- A payload that contains notable events structured in JSON. These can include information such as the application name, full text of the query (which may contain PII), user account that triggered the event, number of rows produced (e.g., for `SELECT`) or processed (e.g., for `INSERT` or `UPDATE`), status of the query, and more. For more details on the information logged, refer to common fields of [`role_based_audit_event`]({% link {{ page.version.version }}/eventlog.md %}#role_based_audit_event).
- An envelope that contains event metadata (e.g., severity, date, timestamp, channel). Depending on the log format you specify when [configuring logs]({% link {{ page.version.version }}/configure-logs.md %}), the envelope can be formatted either as JSON or as a flat prefix to the message.

## File storage location

By [default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), audit logs are prefixed `cockroach-sql-audit` and are stored in the [same directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory) as the other logs generated by CockroachDB.

To store the audit log files in a specific directory, [configure the `SENSITIVE_ACCESS` channel]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files) with a custom `dir` path.

{{site.data.alerts.callout_success}}
If your deployment requires particular lifecycle and access policies for audit log files, point `SENSITIVE_ACCESS` to a directory that has permissions set so that only CockroachDB can create/delete files.
{{site.data.alerts.end}}

## Examples

### Exclude one role from logging

With the audit settings in this example,

- Users with the username or role `service_account_role` will not emit audit logs for any statements they issue.
- All remaining users will emit audit logs for any statements they issue. `ALL` is used twice. The first `ALL` refers to all `USER/ROLE`s. The second `ALL` refers to logging all actions/statements.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.log.user_audit = '
    service_account_role NONE
    ALL ALL
';
~~~

### Include only one role for logging

With the audit settings in this example,

- Users with the username or role `test_role` will emit audit logs for all statements they issue.
- Users with the username or role `another_role` will not emit audit logs for any statements they issue. In principle, you can achieve this by simply omitting `another_role` from the configuration entirely. It is included here as a basis of comparison to the next example - [User with multiple roles](#user-with-multiple-roles).
- All remaining users will not emit audit logs for any statements they issue.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.log.user_audit = '
    test_role       ALL
    another_role    NONE
    ALL             NONE
';
~~~

### User with multiple roles

With the audit settings in this example,

- Users with the username or role `test_role` will not emit audit logs for any statements they issue.
- Users with the username or role `another_role` will emit audit logs for all statements they issue.
- All remaining users will not emit audit logs for any statements they issue.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.log.user_audit = '
    test_role       NONE
    another_role    ALL
    ALL             NONE
';
~~~

Grant an existing user, `test_user`, both roles `test_role` and `another_role`:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT test_role to test_user;
GRANT another_role to test_user;
~~~

If `test_user` executes a statement, an audit log will not be emitted. In this case, CockroachDB would match `test_user` to role `test_role`, which is listed first and has the `STATEMENT_FILTER` set to `NONE`. Even though `test_user` is a member of role `another_role` which has `STATEMENT_FILTER` set to `ALL`, CockroachDB does not match `test_user` to that role because it is listed second.

## See also

- [Table-based SQL Audit Logging]({% link {{ page.version.version }}/sql-audit-logging.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [Logging Use Cases]({% link {{ page.version.version }}/logging-use-cases.md %})
