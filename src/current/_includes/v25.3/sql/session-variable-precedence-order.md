When a [session]({% link {{ page.version.version }}/show-sessions.md %}) starts, CockroachDB determines the initial value of each [session variable]({% link {{ page.version.version }}/session-variables.md %}) by evaluating the settings in the following order (items earlier in the list take precedence over later items):

1. [Connection string parameters]({% link {{ page.version.version }}/connection-parameters.md %}): A value supplied as a query parameter in the connection URL (for example, `.../movr?sslmode=disable&timezone=UTC`).
2. [Per-role, per-database defaults]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-a-role-in-a-specific-database): A value set by `ALTER ROLE {role_name} IN DATABASE {db_name} SET {var}={value}`.
3. [Per-role, all-database defaults]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-a-role): A value set by `ALTER ROLE {role_name} SET {var}={value}`.
4. [All-role, per-database defaults]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-a-specific-database): A value set by `ALTER ROLE ALL IN DATABASE {db_name} SET {var}={value}` or equivalently by `ALTER DATABASE {db_name} SET {var}={value}`.
5. [Cluster-wide defaults for all roles and all databases]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-all-users): A value set by `ALTER ROLE ALL SET {var}={value}`.

If a session variable is not modified using any of the above methods, the built-in system default value is used. Note that the [`root` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#root-user) is exempt from settings 3–5; it is only affected by values specified in the connection string.

CockroachDB also supports setting session variables for the duration of a single transaction using [`SET LOCAL`]({% link {{ page.version.version }}/set-vars.md %}#set-a-variable-for-the-duration-of-a-single-transaction).

{{site.data.alerts.callout_info}}
Because session variable resolution happens at session start time, changes to defaults only apply to **future** sessions. Existing open sessions retain their current values unless the variable is changed explicitly with [`SET`]({% link {{ page.version.version }}/set-vars.md %}).
{{site.data.alerts.end}}
