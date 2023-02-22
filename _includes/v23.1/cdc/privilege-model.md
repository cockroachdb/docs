{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new [system-level privilege model](security-reference/authorization.html#system-level-privileges) that provides finer control over a user's privilege to work with the database, including creating and managing changefeeds. 

There is continued support for the [legacy privilege model](#legacy-privilege-model) for changefeeds in v23.1, however it **will be removed** in a future release of CockroachDB. We recommend implementing the new privilege model that follows in this section for all changefeeds.
{{site.data.alerts.end}}

You can [grant](grant.html#grant-privileges-on-specific-tables-in-a-database) a user the `CHANGEFEED` privilege to allow them to create changefeeds on a specific table:

{% include_cached copy-clipboard.html %}
~~~sql
GRANT CHANGEFEED ON TABLE example_table TO user;
~~~

When you grant a user the `CHANGEFEED` privilege, they can:

- Create changefeeds on the target table even if the user does **not** have the [`CONTROLCHANGEFEED` role option](alter-role.html#role-options) or the `SELECT` privilege on the table. 
- {% include_cached new-in.html version="v23.1" %} Manage the changefeed jobs that they have created using the [`SHOW CHANGEFEED JOB`](show-jobs.html), [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html) commands.

These users will be able to create changefeeds, but they will not be able to run a `SELECT` query on that data directly. However, they could still read this data indirectly if they have read access to the [sink](changefeed-sinks.html).

{% include {{ page.version.version }}/cdc/ext-conn-cluster-setting.md %}

### Privilege model

Granted privileges | Usage 
-------------------+-------
`CHANGEFEED` | Create changefeeds on tables defined in the `GRANT` statement.<br>Manage the changefeed job.
`CHANGEFEED` + `USAGE` on external connections | Create changefeeds on tables defined in the `GRANT` statement **only** to an external connection URI that the user has [`USAGE`](create-external-connection.html#required-privileges) on.<br>Manage the changefeed job.
`SELECT` | Create a sinkless changefeed that emits messages to a SQL client.
**Deprecated** `CONTROLCHANGEFEED` role option + `SELECT` | Create changefeeds on tables defined in the `GRANT` statement.

You can add `CHANGEFEED` to the user or role's [default privileges](security-reference/authorization.html#default-privileges) with [`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html#grant-default-privileges-to-a-specific-role):

{% include_cached copy-clipboard.html %}
~~~sql
ALTER DEFAULT PRIVILEGES GRANT CHANGEFEED ON TABLES TO user;
~~~

{{site.data.alerts.callout_info}}
Users with the `CONTROLCHANGEFEED` role option must have `SELECT` on each table, even if they are also granted the `CHANGEFEED` privilege. The `CONTROLCHANGEFEED` role option will be deprecated in a future release.
{{site.data.alerts.end}}