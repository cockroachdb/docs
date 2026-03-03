---
title: Cluster Settings
summary: Learn about cluster settings that apply to all nodes of a CockroachDB cluster.
toc: false
docs_area: reference.cluster_settings
---

Cluster settings apply to all nodes of a CockroachDB cluster and control, for example, whether or not to share diagnostic details with Cockroach Labs as well as advanced options for debugging and cluster tuning.

{{site.data.alerts.callout_info}}
In contrast to cluster-wide settings, node-level settings apply to a single node. They are defined by flags passed to the `cockroach start` command when starting a node and cannot be changed without stopping and restarting the node. For more details, see [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %}).
{{site.data.alerts.end}}

This page provides information on:

- [Available settings](#settings)
- How to [view current cluster settings](#view-current-cluster-settings)
- How to [change a cluster setting](#change-a-cluster-setting)
- [Sensitive settings](#sensitive-settings)

## Settings

{{site.data.alerts.callout_danger}}
These cluster settings have a broad impact on CockroachDB internals and affect all applications, workloads, and users running on a CockroachDB cluster. For some settings, a [session setting]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) could be a more appropriate scope.
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/{{ page.release_info.crdb_branch_name }}/docs/generated/settings/settings.html %}

<a name="setting-goschedstats-always-use-short-sample-period-enabled"></a>

<table>
  <tr>
    <td><code>goschedstats.always_use_short_sample_period.enabled</code></td>
    <td>boolean</td>
	<td>false</td>
	<td>When set to true, the system uses a shorter sampling period of runnable queue lengths. This setting should always be enabled for <a href="recommended-production-settings.html">production clusters</a> to help prevent unnecessary queuing in the <a href="admission-control.html">admission control</a> subsystem.</td>
    <td>Advanced/Self-Hosted</td>
  </tr>
</table>

## View current cluster settings

Use the [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}) statement.

## Change a cluster setting

Cluster settings can be updated via SQL command while the cluster is running. Use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement.

Before changing a cluster setting, note the following:

- 	Changing a cluster setting is not instantaneous, as the change must be propagated to other nodes in the cluster.

- 	Do not change cluster settings while [upgrading to a new version of CockroachDB]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}). Wait until all nodes have been upgraded before you make the change.

## Sensitive settings

You can prevent users without sufficient permissions from viewing the values of cluster settings that CockroachDB classifies as sensitive.

By default, users with the `VIEWCLUSTERSETTING` privilege can view the values of all settings displayed when using the [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}) statement and the [DB Console Advanced Debug > Cluster Settings page]({% link {{ page.version.version }}/ui-debug-pages.md %}).

If you enable the option to redact sensitive settings, the sensitive setting values are hidden from those users, and visible only to users with the `admin` role or the `MODIFYCLUSTERSETTING` privilege.

To enable this redaction of sensitive setting values, set the cluster setting [`server.redact_sensitive_settings.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-redact-sensitive-settings-enabled) to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.redact_sensitive_settings.enabled = 'true';
~~~

The table summarizes when sensitive setting values are visible or redacted:

| User attribute | Redaction disabled | Redaction enabled |
|----------------|:------------------:|:-----------------:|
|`admin` role | visible | visible
|`MODIFYCLUSTERSETTING` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) | visible | visible
|`VIEWCLUSTERSETTING` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) | visible | **redacted**
| None of the above attributes | not visible | not visible |

The following are sensitive settings whose values are redacted:

- [`server.host_based_authentication.configuration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-host-based-authentication-configuration)
- [`server.identity_map.configuration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-identity-map-configuration)
- [`server.jwt_authentication.issuers.custom_ca`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-jwt-authentication-issuers-custom-ca)
- [`server.ldap_authentication.domain.custom_ca`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-ldap-authentication-domain-custom-ca)
- [`server.ldap_authentication.client.tls_certificate`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-ldap-authentication-client-tls-certificate)
- [`server.ldap_authentication.client.tls_key`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-ldap-authentication-client-tls-key)
- [`server.oidc_authentication.client_id`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-oidc-authentication-client-id)
- [`server.oidc_authentication.client_secret`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-oidc-authentication-client-secret)

## See also

- [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %})
- [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %})
- [Diagnostics Reporting]({% link {{ page.version.version }}/diagnostics-reporting.md %})
- [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
