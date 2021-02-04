{% include cockroachcloud/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page.

    <img src="{{ 'images/cockroachcloud/sql-users.png' | relative_url }}" alt="SQL users" style="border:1px solid #eee;max-width:100%" />

1. Click the **Add User** button in the top right corner.

    The **Add User** dialog displays.

1. Enter a **Username** and **Password**.
1. Click **Save**.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Granting privileges](user-authorization.html#grant-privileges) and [Using roles](user-authorization.html#use-roles).
