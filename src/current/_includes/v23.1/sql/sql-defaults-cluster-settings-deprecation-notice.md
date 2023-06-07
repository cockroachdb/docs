{{site.data.alerts.callout_info}}
Use [`ALTER ROLE ALL SET {sessionvar} = {val}`](alter-role.html#set-default-session-variable-values-for-all-users) instead of the `sql.defaults.*` [cluster settings](cluster-settings.html). This allows you to set a default value for all users for any [session variable](set-vars.html) that applies during login, making the `sql.defaults.*` cluster settings redundant.
{{site.data.alerts.end}}
