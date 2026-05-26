---
title: ALTER JOB
summary: Use the ALTER JOB statement to transfer ownership of a job between users or roles.
toc: true
---

The `ALTER JOB` statement transfers ownership of a [job]({% link {{ page.version.version }}/show-jobs.md %}) between [users]({% link {{ page.version.version }}/create-user.md %}) or [roles]({% link {{ page.version.version }}/create-role.md %}).

## Required privileges

To alter job ownership, the user must be one of the following: 

- The current job owner.
- A member of the role that is the current owner. 
- An `admin`.

Unless the user is an `admin`, they can only transfer ownership of a job to themselves or to a role of which they are a member.

To add a user to a role, refer to the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) statement.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_job.html %}
</div>

### Parameters

Parameter | Description
----------+------------
`a_expr` | The job ID to modify.
`role_spec` | The role or user.

## Example

To transfer job ownership from the user who created the job to a role they're a member of:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER JOB job_id OWNER TO role_name;
~~~

## See also

- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})