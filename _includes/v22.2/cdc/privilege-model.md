{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new changefeed privilege model that provides finer control over a user's privilege to run changefeeds. 

There is continued support for the [legacy privilege model](#legacy-privilege-model) in v22.2, however it **will be removed** in a future release. We recommend implementing the new privilege model that follows in this section for all changefeeds.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} You can [grant](grant.html#grant-privileges-on-specific-tables-in-a-database) a user the `CHANGEFEED` privilege to allow them to create changefeeds on a specific table:

{% include_cached copy-clipboard.html %}
~~~sql
GRANT CHANGEFEED ON TABLE example_table TO user;
~~~

This privilege model provides a more granular way to grant users the ability to create a changefeed on a table. A user granted the `CHANGEFEED` privilege can create changefeeds on the target table even if the user does **not** have the [`CONTROLCHANGEFEED` role option](alter-role.html#role-options) or the `SELECT` privilege on the table. 

Since you can grant the `CHANGEFEED` privilege to a user or role **without** them needing the `SELECT` privilege on a table, these users will be able to create changefeeds, but they will not be able to run a `SELECT` query on that data directly. {% if page.name == "create-changefeed.md" %} However, these users could still read this data indirectly if they have read access to the [sink](changefeed-sinks.html), or create a "sinkless" changefeed that emits messages to the SQL session.{% else %} However, these users will be able to read this data indirectly as `EXPERIMENTAL CHANGEFEED FOR` emits changefeed messages to the SQL session. {% endif %}

You can add `CHANGEFEED` to the user or role's [default privileges](security-reference/authorization.html#default-privileges) with [`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html#grant-default-privileges-to-a-specific-role):

{% include_cached copy-clipboard.html %}
~~~sql
ALTER DEFAULT PRIVILEGES GRANT CHANGEFEED ON TABLES TO user;
~~~

{{site.data.alerts.callout_info}}
Users with the `CONTROLCHANGEFEED` role option must have `SELECT` on each table, even if they are also granted the `CHANGEFEED` privilege.
{{site.data.alerts.end}}