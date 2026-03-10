User/role management operations (such as [`GRANT`]({% link {{ page.version.version }}/grant.md %}) and [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})) are [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}). As such, they inherit the [limitations of schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}#known-limitations).

For example, schema changes wait for concurrent [transactions]({% link {{ page.version.version }}/transactions.md %}) using the same resources as the schema changes to complete. In the case of [role memberships]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) being modified inside a transaction, most transactions need access to the set of role memberships. Using the default settings, role modifications require schema leases to expire, which can take up to 5 minutes.

This means that [long-running transactions]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#hanging-or-stuck-queries) elsewhere in the system can cause user/role management operations inside transactions to take several minutes to complete. This can have a cascading effect. When a user/role management operation inside a transaction takes a long time to complete, it can in turn block all user-initiated transactions being run by your application, since the user/role management operation in the transaction has to commit before any other transactions that access role memberships (i.e., most transactions) can make progress.

If you want user/role management operations to finish more quickly, and do not care whether concurrent transactions will immediately see the side effects of those operations, set the [session variable]({% link {{ page.version.version }}/set-vars.md %}) `allow_role_memberships_to_change_during_transaction` to `true`.

When this session variable is enabled, any user/role management operations issued in the current session will only need to wait for the completion of statements in other sessions where `allow_role_memberships_to_change_during_transaction` is not enabled.

To accelerate user/role management operations across your entire application, you have the following options:

1. Set the session variable in all sessions by [passing it in the client connection string]({% link {{ page.version.version }}/connection-parameters.md %}#supported-options-parameters).
1. Apply the `allow_role_memberships_to_change_during_transaction` setting globally to an entire cluster using the [`ALTER ROLE ALL`]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-all-users) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER ROLE ALL SET allow_role_memberships_to_change_during_transaction = true;
    ~~~
