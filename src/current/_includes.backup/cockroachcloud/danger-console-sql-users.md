{{site.data.alerts.callout_danger}}
By default, a new SQL user created using the UI or Cloud API is granted the SQL `admin` role. An `admin` SQL user has full privileges for all databases and tables in the cluster, and can create additional SQL users and manage their privileges.
When possible, it is best practice to limit each user's privileges to the minimum necessary for their tasks, in keeping with the [Principle of Least Privilege (PoLP)](https://wikipedia.org/wiki/Principle_of_least_privilege).

Refer to: [Manage SQL users on a cluster]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster)
{{site.data.alerts.end}}