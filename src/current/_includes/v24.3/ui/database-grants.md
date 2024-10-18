## Database Grants

{% include_cached new-in.html version="v24.3" %} To view this page, click on a database name on the [**Databases**](#databases) page and then click on the **Grants** tab.

The **Database Grants** page shows the [privileges]({% link {{ version_prefix }}/security-reference/authorization.md %})#managing-privileges) granted to users and roles for the database.

The following information is displayed for each grantee:

 Column    | Description
-----------|-------------
Grantee    | The role or user.
Privileges | The list of privileges for the role or user on the database.

For more details about grants and privileges, refer to [`GRANT`]({% link {{ version_prefix }}/grant.md %}).