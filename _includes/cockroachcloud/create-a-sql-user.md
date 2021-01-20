{% include cockroachcloud/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page.

    <img src="{{ 'images/v19.2/cockroachcloud/sql-users.png' | relative_url }}" alt="SQL users" style="border:1px solid #eee;max-width:100%" />

2. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

3. Enter a **Username** and **Password**.
    {{site.data.alerts.callout_info}}
    Password must be at least 12 characters long.
    {{site.data.alerts.end}}
4. Click **Save**.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Granting privileges](user-authorization.html#granting-privileges) and [Using roles](user-authorization.html#using-roles).
