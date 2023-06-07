{% include cockroachcloud/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page.

    <img src="{{ 'images/cockroachcloud/sql-users.png' | relative_url }}" alt="SQL users" style="border:1px solid #eee;max-width:100%" />

1. Click the **Add User** button in the top right corner.

    The **Create SQL user** dialog displays.

1. Enter a username in the **SQL user** field.
1. Click **Generate & save password**.
1. Copy the **Generated password** and save it in a secure location.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Managing SQL users on a cluster](managing-access.html#manage-sql-users-on-a-cluster).
