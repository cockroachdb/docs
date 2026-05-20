{{site.data.alerts.callout_info}}
Use [`ALTER ROLE ALL SET {sessionvar} = {val}`]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-all-users) instead of the `sql.defaults.*` [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}). This allows you to set a default value for all users for any [session variable]({% link {{ page.version.version }}/set-vars.md %}) that applies during login, making the `sql.defaults.*` cluster settings redundant.
{{site.data.alerts.end}}
