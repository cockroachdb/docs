{{site.data.alerts.callout_danger}}
As of v25.1, **viewing and managing** a changefeed job by users with the [`CHANGEFEED` privilege](#changefeed-privilege) is **deprecated**. This functionality of the `CHANGEFEED` privilege will be removed in a future release.

We recommend transitioning users that need to view and manage running changefeed jobs to [roles]({% link {{ page.version.version }}/create-role.md %}) that own the [jobs]({% link {{ page.version.version }}/show-jobs.md %}) or [granting]({% link {{ page.version.version }}/grant.md %}) them the `VIEWJOB` or `CONTROLJOB` privilege. For more details, refer to [View and manage changefeed jobs](#view-and-manage-changefeed-jobs).
{{site.data.alerts.end}}

### Privilege model

{{site.data.alerts.callout_success}}
For fine-grained access control, we recommend using the system-level privileges [`CHANGEFEED`](#changefeed-privilege) and [`CONTROLJOB` / `VIEWJOB`](#view-and-manage-changefeed-jobs).
{{site.data.alerts.end}}

The following summarizes the operations users can run depending on whether the assigned privileges are at the job or table level:

Granted privileges | Usage
-------------------+-------
`CHANGEFEED` | Create changefeeds on tables. For details, refer to [`CHANGEFEED` privilege](#changefeed-privilege).<br>**Deprecated**: View and manage changefeed jobs on tables. Instead, transition users that need to view and manage running changefeed jobs to [roles]({% link {{ page.version.version }}/create-role.md %}) that own the [jobs]({% link {{ page.version.version }}/show-jobs.md %}) or [granting]({% link {{ page.version.version }}/grant.md %}) them the `VIEWJOB` or `CONTROLJOB` privilege. For more details, refer to [View and manage changefeed jobs](#view-and-manage-changefeed-jobs).
`CHANGEFEED` + [`USAGE`]({% link {{ page.version.version }}/create-external-connection.md %}#required-privileges) on external connection | Create changefeeds on tables to an external connection URI. For details, refer to [`CHANGEFEED` privilege](#changefeed-privilege).<br>**Deprecated**: View and manage changefeed jobs on tables. Instead, transition users that need to view and manage running changefeed jobs to [roles]({% link {{ page.version.version }}/create-role.md %}) that own the [jobs]({% link {{ page.version.version }}/show-jobs.md %}) or [granting]({% link {{ page.version.version }}/grant.md %}) them the `VIEWJOB` or `CONTROLJOB` privilege. For more details, refer to [View and manage changefeed jobs](#view-and-manage-changefeed-jobs).<br><br>**Note:** If you need to manage access to changefeed sink URIs, set the `changefeed.permissions.require_external_connection_sink.enabled=true` cluster setting. This will mean that users with these privileges can **only** create changefeeds on external connections.
Job ownership | [View]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) and manage changefeed jobs ([pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), and [cancel]({% link {{ page.version.version }}/cancel-job.md %})). For details, refer to [View and manage changefeed jobs](#view-and-manage-changefeed-jobs).
`CONTROLJOB` | Manage changefeed jobs ([pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), and [cancel]({% link {{ page.version.version }}/cancel-job.md %})). For details, refer to [View and manage changefeed jobs](#view-and-manage-changefeed-jobs).
`VIEWJOB` | [View]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) changefeed jobs. For details, refer to [View and manage changefeed jobs](#view-and-manage-changefeed-jobs).
`SELECT` | Create a sinkless changefeed that emits messages to a SQL client.
**Deprecated** `CONTROLCHANGEFEED` role option + `SELECT` | Create changefeeds on tables. Users with the `CONTROLCHANGEFEED` role option must have `SELECT` on each table, even if they are also granted the `CHANGEFEED` privilege.<br><br>The `CONTROLCHANGEFEED` role option will be removed in a future release. We recommend using the system-level privileges [`CHANGEFEED`](#changefeed-privilege) and [`CONTROLJOB`/ `VIEWJOB`](#view-and-manage-changefeed-jobs) for fine-grained access control.
`admin` | Create, view, and manage changefeed jobs. 

#### `CHANGEFEED` privilege

{{site.data.alerts.callout_info}}
Viewing and managing changefeed jobs with the `CHANGEFEED` privilege is **deprecated** as of v25.1. Instead, transition users that need to view and manage running changefeed jobs to [roles]({% link {{ page.version.version }}/create-role.md %}) that own the [jobs]({% link {{ page.version.version }}/show-jobs.md %}) or [granting]({% link {{ page.version.version }}/grant.md %}) them the `VIEWJOB` or `CONTROLJOB` privilege. For more details, refer to [View and manage changefeed jobs](#view-and-manage-changefeed-jobs).
{{site.data.alerts.end}}

You can [grant]({% link {{ page.version.version }}/grant.md %}#grant-privileges-on-specific-tables-in-a-database) a user the `CHANGEFEED` privilege to allow them to create changefeeds on a specific table:

{% include_cached copy-clipboard.html %}
~~~sql
GRANT CHANGEFEED ON TABLE example_table TO user;
~~~

When you grant a user the `CHANGEFEED` privilege on a set of tables, they can create changefeeds on the target tables even if the user does **not** have the [`CONTROLCHANGEFEED` role option]({% link {{ page.version.version }}/alter-role.md %}#role-options) or the `SELECT` privilege on the tables.

These users will be able to create changefeeds, but they will not be able to run a `SELECT` query on that data directly. However, they could still read this data indirectly if they have read access to the [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}).

You can add `CHANGEFEED` to the user or role's [default privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges) with [`ALTER DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/alter-default-privileges.md %}#grant-default-privileges-to-a-specific-role):

{% include_cached copy-clipboard.html %}
~~~sql
ALTER DEFAULT PRIVILEGES GRANT CHANGEFEED ON TABLES TO user;
~~~

{% include {{ page.version.version }}/cdc/ext-conn-cluster-setting.md %}

#### View and manage changefeed jobs

Users can [view]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) and manage changefeed jobs when one of the following are met:

- **Job ownership**: They own the job, or are a member of a role that owns a job.  
- **Global privileges**: They are assigned [`CONTROLJOB` or `VIEWJOB`]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

To give a set of users access to a specific job, or set of jobs, assign them to a [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles) that owns the job(s). 

You can transfer ownership of a job to a role or user using the [`ALTER JOB`]({% link {{ page.version.version }}/alter-job.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~sql
ALTER JOB job_ID OWNER TO role_name;
~~~