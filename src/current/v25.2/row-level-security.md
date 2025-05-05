---
title: Row-Level Security (RLS) Overview
summary: Restrict access to specific rows of data based on user roles, permissions, or other criteria
toc: true
keywords: security, row level security, RLS
docs_area: develop
---

Row Level Security (_RLS_) is a security feature that allows organizations to restrict access to specific rows of data in a database based on user [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles), [permissions]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-models), or other criteria.

Row-level security complements standard SQL privileges ([`GRANT`]({% link {{ page.version.version }}/grant.md %})/[`REVOKE`]({% link {{ page.version.version }}/revoke.md %})) by allowing administrators to define policies that determine precisely which rows users can view or modify within a specific table.

## Use cases

Use cases for row-level security include:

- [Restricting access to sensitive data for compliance](#restricting-access-to-sensitive-data-for-compliance)
- [Designing multi-tenant applications](#designing-multi-tenant-applications)

### Restricting access to sensitive data for compliance

In industries like finance or healthcare, organizations are required to ensure that only authorized users access sensitive data. Row-level security (RLS) addresses this requirement directly within the database.

For example, RLS allows a financial institution to restrict access to customer records based on roles or departments. In healthcare, RLS can be used to enforce policies ensuring patient records are visible only to the medical staff involved in their care.

RLS embeds access control logic directly into the database and eliminates the need for manual filtering in application code. This centralized enforcement prevents inconsistencies, reduces security attack surface, and simplifies compliance with data access regulations.

For an example, see [RLS for Data Security (Fine-Grained Access Control)](#rls-for-data-security-fine-grained-access-control).

### Designing multi-tenant applications

In multi-tenant applications such as typical Software-as-a-Service (SaaS) deployments, isolating data between tenants within shared tables is a requirement. Row-Level Security (RLS) provides a database-level mechanism for enforcing this isolation. SaaS providers can utilize RLS policies to ensure tenants can only access their own data, eliminating the need for complex and potentially insecure application-layer filtering logic based on tenant IDs.

For an example, see [RLS for Multi-Tenant Isolation](#rls-for-multi-tenant-isolation).

## How to use row-level security

At a high level, the steps for using row-level security (RLS) are as follows:

1. Create [schema objects]({% link {{ page.version.version }}/schema-design-overview.md %}) and [insert data]({% link {{ page.version.version }}/insert-data.md %}). ([`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}), [`INSERT`]({% link {{ page.version.version }}/insert.md %}))
2. [Create roles]({% link {{ page.version.version }}/create-role.md %}) & [grant access]({% link {{ page.version.version }}/grant.md %}) to schema objects by those roles. ([`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}), [`GRANT`]({% link {{ page.version.version }}/grant.md %}))
3. Enable row-level security on the schema objects. ([`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security))
4. Define row-level security policies on the schema objects which are assigned to specific roles. ([`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}))

For detailed examples showing how to use row-level security, see the [examples](#examples).

## How row-level security policies are evaluated

Policies function as filters or constraints applied automatically by CockroachDB during [query execution]({% link {{ page.version.version }}/architecture/sql-layer.md %}#query-execution). They are based on boolean expressions evaluated in the context of the current [user]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles), [session properties]({% link {{ page.version.version }}/show-sessions.md %}), and the row data itself.

When row-level security is enabled on a table:

1. Existing [SQL privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) still determine **if** a user can access the table at all (e.g., `SELECT`, `INSERT`).
2. [Row-level security policies]({% link {{ page.version.version }}/show-policies.md %}) determine **which rows** within the table are accessible or modifiable for specific commands.

Further details about RLS evaluation include:

- All [policies]({% link {{ page.version.version }}/show-policies.md %}) apply to a specific set of [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles). For a policy to be applicable, it must match at least one of the roles assigned to it. If the policy is associated with the `PUBLIC` role, it applies to all roles. In order for reads or writes to succeed, there must be at least one permissive policy for the user's role. 
- If RLS is enabled but no policies apply to a given combination of user and SQL statement, **access is denied by default**.
- Permissive policies are combined using `OR` logic, while restrictive policies are combined using `AND` logic. The overall policy enforcement is determined by evaluating a logical expression of the form: `(permissive policies) AND (restrictive policies)`.
- The `USING` clause of [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}) filters rows during reads; the `WITH CHECK` clause validates writes, and defaults to `USING` if absent.

## Considerations

### Performance

Complex [policy expressions]({% link {{ page.version.version }}/create-policy.md %}) evaluated per-row can impact query performance. To limit the performance impacts of row-level security, optimize your policy expressions and consider [indexing]({% link {{ page.version.version }}/indexes.md %}) relevant columns.

According to internal testing, row-level security had the following performance impacts on a write-heavy [`sysbench`](https://github.com/akopytov/sysbench) workload:

| Number of policies | Percentage slowdown of the workload (approx.) |
|--------------------|-----------------------------------------------|
| 1                  | 110%                                          |
| 10                 | 140%                                          |
| 50                 | 200%                                          |

### Security privileges

[Policy expressions]({% link {{ page.version.version }}/create-policy.md %}) execute with the [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) of the user invoking the query, unless functions marked [`SECURITY DEFINER`]({% link {{ page.version.version }}/create-function.md %}#create-a-security-definer-function) are used. 

{{site.data.alerts.callout_danger}}
Functions marked `SECURITY DEFINER` should only be used with **extreme caution** to ensure expressions do not have unintended side effects.
{{site.data.alerts.end}}

## Limitations

### SQL language features that bypass row-level security

The following SQL language features bypass row-level security:

- [Foreign keys]({% link {{ page.version.version }}/foreign-key.md %}) (including cascades)
- [Primary key constraints]({% link {{ page.version.version }}/primary-key.md %})
- [Unique constraints]({% link {{ page.version.version }}/unique.md %})
- [`TRUNCATE`]({% link {{ page.version.version }}/truncate.md %})

### Change data capture (CDC)

[CDC]({% link {{ page.version.version }}/change-data-capture-overview.md %}) messages that are emitted from a table will not be filtered using RLS policies. Furthermore, [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}) are not supported on tables using RLS, and will fail with the error message: `CDC queries are not supported on tables with row-level security enabled`

### Backup and restore

[Backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) functionality does not take RLS policies into account.

### Logical data replication (LDR) and Physical cluster replication (PCR)

[Logical Data Replication (LDR)]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) and [Physical Cluster Replication (PCR)]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) do not take RLS policies into account.

LDR's [limitations with respect to schema changes]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#schema-changes) also apply to RLS, since RLS policies amount to a schema change.

If you use PCR, the target cluster will have all RLS policies applied to the data because PCR performs byte for byte replication.

### Views

When [views]({% link {{ page.version.version }}/views.md %}) are accessed, RLS policies on any underlying [tables]({% link {{ page.version.version }}/schema-design-table.md %}) are applied. [Policies]({% link {{ page.version.version }}/create-policy.md %}) can also be defined directly on views.

Views use the [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) of the view owner to determine row-level security filters, **not** the role of the user executing the view. This can cause issues because the view owner may have entirely different policies than the user executing the view.

The following security attributes for views are unimplemented:

- `security_invoker`, which would allow using the role of the user executing the view.
- `security_barrier`, which instructs the [optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) to process policy filtering first, ensuring that [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) (UDFs) never receive rows violating RLS policies.

## Examples

### Create a policy

For an example, see [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}).

### Alter a policy

For an example, see [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %}).

### Drop a policy

For an example, see [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %}).

### Enable or disable row-level security

For examples, see:

- [`ALTER TABLE ... (ENABLE, DISABLE) ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security).
- [`ALTER TABLE ... (FORCE, UNFORCE) ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#force-unforce-row-level-security).

### RLS for Data Security (Fine-Grained Access Control)

In a fine-grained access control scenario, we want to restrict access to specific rows within a table based on user [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles), attributes, or relationships defined within the data itself. This goes beyond table-level [`GRANT`]({% link {{ page.version.version }}/grant.md %}) permissions. Common examples include restricting access to salary information, personal data, or region-specific records.

For example, imagine an `employees` table containing sensitive salary information. We want to enforce the following rules:

- Employees can view their own record.
- Managers can view the records of their direct reports.
- Members of the `hr_department` role can view all records.

#### Set up fine-grained access control schema

First, define the `hr_department` role and `employees` table, add some data, and grant basic table access:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create a role needed for the example policies.
-- Note: In a real scenario, manage roles appropriately.
-- This may require admin privileges not available to all users.
CREATE ROLE hr_department;
CREATE ROLE manager;
CREATE ROLE employee;

-- Create roles for employees.
CREATE ROLE alice;
CREATE ROLE bob;
CREATE ROLE carol;
CREATE ROLE david;
CREATE ROLE edward;

GRANT hr_department to edward;
GRANT manager to alice, carol;
GRANT employee to alice, bob, carol, david, edward;

-- Assume roles 'hr_department' and potentially others exist.
-- Usernames are assumed to match the 'username' column for simplicity.
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    manager_username TEXT,
    salary NUMERIC(10, 2) NOT NULL
);

-- Sample Data
INSERT INTO employees (username, full_name, manager_username, salary) VALUES
('alice', 'Alice Smith', NULL, 120000),
('bob', 'Bob Jones', 'alice', 80000),
('carol', 'Carol White', 'alice', 85000),
('david', 'David Green', 'carol', 70000),
('edward', 'Edward Scissorhands', 'alice', 70000);

-- Grant basic table access (RLS will refine row access)
GRANT SELECT, INSERT, UPDATE, DELETE ON employees TO hr_department;
GRANT SELECT ON employees TO manager;
GRANT SELECT ON employees TO employee;
~~~

#### Enable row-level security for fine-grained access control

Next, enable row-level security using the [`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security) statement. Optionally, you may want to ensure that the table owner is also subject to RLS using [`ALTER TABLE ... FORCE ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#force-unforce-row-level-security).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- Optional: Ensure owner is also subject to policies if needed
-- ALTER TABLE employees FORCE ROW LEVEL SECURITY;
~~~

#### Define row-level security policies for fine-grained access control

Next, define RLS policies on the table. Policy 1 allows HR full access to the table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE POLICY hr_access ON employees
    FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
    TO hr_department
    USING (true) -- No row restriction for HR
    WITH CHECK (true); -- No check restriction for HR
~~~

Policy 2 allows employees to view their own record.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE POLICY self_access ON employees
    AS PERMISSIVE -- Combine with other permissive policies (like manager access)
    FOR SELECT
    TO employee
    USING (username = current_user);
~~~

Policy 3 allows managers to view their direct reports' records. This requires a way to look up the manager's username. In this example, we use the `current_user` special form of the [function with the same name]({% link {{ page.version.version }}/functions-and-operators.md %}#special-syntax-forms).

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE POLICY manager_access ON employees
    AS PERMISSIVE
    FOR SELECT -- Only for viewing
    TO manager
    USING (manager_username = current_user);
    -- No WITH CHECK needed as it's SELECT-only
~~~

#### Verify fine-grained access control policies

To verify that the RLS settings are working as expected, execute the statements in this section.

The following statement is executed by user `alice` (the manager), and returns: Alice, Bob, Carol, and Edward, but **not** David, since he works for Carol.

This is expected behavior due to Alice's `manager` role having `self_access` or `manager_access` policies.

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE alice;
SELECT * FROM employees;
RESET ROLE;
~~~

~~~
          id          | username |      full_name      | manager_username |  salary
----------------------+----------+---------------------+------------------+------------
  1068380269155778561 | alice    | Alice Smith         | NULL             | 120000.00
  1068380269155844097 | bob      | Bob Jones           | alice            |  80000.00
  1068380269155876865 | carol    | Carol White         | alice            |  85000.00
  1068380269155942401 | edward   | Edward Scissorhands | alice            |  70000.00
~~~

The following statement is executed by user `bob` (an employee), and returns only Bob's information.

This is expected behavior due to Bob's `employee` role only having the `self_access` policy.

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE bob;
SELECT * FROM employees;
RESET ROLE;
~~~

~~~
          id          | username | full_name | manager_username |  salary
----------------------+----------+-----------+------------------+-----------
  1068380269155844097 | bob      | Bob Jones | alice            | 80000.00
(1 row)
~~~

The following statement is executed by user `carol` (a manager), and returns: Carol, David.

This is expected behavior due to Carol's `manager` role having `self_access` or `manager_access` policies.

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE carol;
SELECT * FROM employees;
RESET ROLE;
~~~

~~~
          id          | username |  full_name  | manager_username |  salary
----------------------+----------+-------------+------------------+-----------
  1068380269155876865 | carol    | Carol White | alice            | 85000.00
  1068380269155909633 | david    | David Green | carol            | 70000.00
(2 rows)
~~~

The following statement is executed by a user `edward` belonging to `hr_department`, and returns all rows.

This is expected behavior due to Edward's `hr_department` role having `hr_access` or `self_access` policies.

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE edward;
SELECT * FROM employees;
RESET ROLE;
~~~

~~~
          id          | username |      full_name      | manager_username |  salary
----------------------+----------+---------------------+------------------+------------
  1068380269155778561 | alice    | Alice Smith         | NULL             | 120000.00
  1068380269155844097 | bob      | Bob Jones           | alice            |  80000.00
  1068380269155876865 | carol    | Carol White         | alice            |  85000.00
  1068380269155909633 | david    | David Green         | carol            |  70000.00
  1068380269155942401 | edward   | Edward Scissorhands | alice            |  70000.00
(5 rows)
~~~

The following statement is executed by the user `alice`, and fails because it violates the `self_access` policy's `WITH CHECK` clause since Alice tries to update Bob's salary, and `manager_access` doesn't grant `UPDATE`.

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE alice;
UPDATE employees SET salary = 999999 WHERE username = 'bob';
RESET ROLE;
~~~

~~~
ERROR: user alice does not have UPDATE privilege on relation employees
SQLSTATE: 42501
~~~

### RLS for Multi-Tenant Isolation

Multi-tenant isolation is used to enforce strict data separation between different tenants (customers, organizations) sharing the same database infrastructure and schema. Each tenant must only be able to see and modify their own data. This is a critical requirement for Software-as-a-Service (SaaS) applications.

For example, imagine a SaaS application serving multiple tenants, with all invoice data residing in a single `invoices` table. This table is distinguished by a `tenant_id` column. The application ensures that each user session is associated with a specific `tenant_id`.

#### Create multi-tenant schema

First, create the schema and index for the `tenants` and `invoices` tables. Next, add an index on `tenant_id` for increased lookup performance.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    customer_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
~~~

Populate the schema with data:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Insert the known tenants first to satisfy FK constraints
INSERT INTO tenants (tenant_id, name) VALUES
    ('9607a12c-3c2f-407b-ae3c-af903542395b', 'Tenant A Inc.'),
    ('8177c2fc-3b55-47b7-bf84-38bd3a3e9c0a', 'Tenant B Solutions');

-- Insert some additional dummy tenants
INSERT INTO tenants (name) VALUES
    ('Example Corp'),
    ('Global Widgets Ltd.');

-- Now, populate the invoices table
-- Use the known tenant UUIDs and some generated ones (assuming default gen_random_uuid works or select from tenants)

-- Invoice for Tenant A
INSERT INTO invoices (tenant_id, customer_name, amount) VALUES
    ('9607a12c-3c2f-407b-ae3c-af903542395b', 'Customer One', 1500.75);

-- Invoice for Tenant B
INSERT INTO invoices (tenant_id, customer_name, amount) VALUES
    ('8177c2fc-3b55-47b7-bf84-38bd3a3e9c0a', 'Customer Two', 899.00);

-- Another invoice for Tenant A
INSERT INTO invoices (tenant_id, customer_name, amount) VALUES
    ('9607a12c-3c2f-407b-ae3c-af903542395b', 'Customer Three', 210.50);

-- Invoice for Example Corp (assuming its UUID was generated)
INSERT INTO invoices (tenant_id, customer_name, amount)
    SELECT tenant_id, 'Customer Four', 5000.00
    FROM tenants WHERE name = 'Example Corp';

-- Invoice for Global Widgets Ltd. (assuming its UUID was generated)
INSERT INTO invoices (tenant_id, customer_name, amount)
    SELECT tenant_id, 'Customer Five', 120.99
    FROM tenants WHERE name = 'Global Widgets Ltd.';

-- Yet another invoice for Tenant B
INSERT INTO invoices (tenant_id, customer_name, amount) VALUES
    ('8177c2fc-3b55-47b7-bf84-38bd3a3e9c0a', 'Customer Six', 345.67);
~~~

#### Define user roles for app developer

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE app_dev;
GRANT SELECT ON tenants TO app_dev;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO app_dev;
~~~

#### Define how the application sets the tenant ID for the session

Next, each application will need to set the tenant context for the session. In this example, we will use the `application_name` session variable to pass in a tenant ID which will later be extracted from the variable.

Specifically, the UUID following the period in `application_name` is the tenant ID. We will use the `current_setting()` function in our RLS policies to extract the ID.

{{site.data.alerts.callout_danger}}
For multi-tenancy to work correctly, this setting **must** be reliably managed by the application layer and passed in the connection string.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'my_cool_app.9607a12c-3c2f-407b-ae3c-af903542395b';
~~~

#### Enable row-level security for multi-tenant isolation

To enable row-level security for the `invoices` table, issue the statements below.

{{site.data.alerts.callout_danger}}
For multi-tenant isolation to work properly in this example, you **must** also `FORCE ROW LEVEL SECURITY` so that the policies also apply to the table owner.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- Consider applying to owner/admins too unless bypassed explicitly
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
~~~

#### Define tenant isolation policies

The following policy enforces tenant isolation for all operations.

{% include_cached copy-clipboard.html %}
~~~ sql
-- CREATE POLICY tenant_isolation ON invoices AS RESTRICTIVE FOR ALL TO public USING (tenant_id = split_part(current_setting('application_name', true), '.', 2)::UUID) WITH CHECK (tenant_id = split_part(current_setting('application_name', true), '.', 2)::UUID);

CREATE POLICY tenant_isolation ON invoices
    AS RESTRICTIVE
    FOR ALL
    TO app_dev
    USING (tenant_id = split_part(current_setting('application_name', true),'.',2)::UUID) -- Filter rows on SELECT/UPDATE/DELETE
    WITH CHECK (tenant_id = split_part(current_setting('application_name', true),'.',2)::UUID); -- Enforce tenant_id on INSERT/UPDATE
~~~

Explanation of policy:

- `AS RESTRICTIVE`: Makes this policy mandatory. If other policies exist, they must *also* pass. For simple tenant isolation, this is often the safest default.
- `FOR ALL`: Covers all data modification and retrieval.
- `TO PUBLIC`: Applies the policy broadly. Roles should primarily manage table-level access using `GRANT`, while this policy handles row-level visibility.
- `USING`: Ensures queries only see rows matching the session's tenant ID, which is passed in using the `application_name` session variable and extracted using the `split_part` function.
- `WITH CHECK`: Prevents users from `INSERT`ing rows with a tenant ID column different from their session's calculated tenant ID, or `UPDATE`ing a row to change its `tenant_id` column across tenant boundaries. Without this, a user could potentially insert data into another tenant's space.

#### Verify multi-tenant isolation policies

To verify that the RLS settings are working as expected, execute the statements in this section. They use two tenants with the following IDs:

- Tenant A, which has ID `9607a12c-3c2f-407b-ae3c-af903542395b`.
- Tenant B, which has ID `8177c2fc-3b55-47b7-bf84-38bd3a3e9c0a`.

First, become the `app_dev` role which the policy applies to.

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE app_dev;
~~~

Tenant A should see only those columns in `invoices` which have a `tenant_id` column matching its ID.

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'my_cool_app.9607a12c-3c2f-407b-ae3c-af903542395b'; 
SELECT * FROM invoices;
~~~

Tenant B should see only those columns in `invoices` which have a `tenant_id` column matching its ID.

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'my_cool_app.8177c2fc-3b55-47b7-bf84-38bd3a3e9c0a';
SELECT * FROM invoices;
~~~

Tenant A should not be able to make changes to the `invoice` table for rows which don't have a `tenant_id` column matching its ID.

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'my_cool_app.9607a12c-3c2f-407b-ae3c-af903542395b';
INSERT INTO invoices (tenant_id, customer_name, amount) VALUES ('8177c2fc-3b55-47b7-bf84-38bd3a3e9c0a'::UUID, 'Customer Three', 123.45);
~~~

The above statement fails because it violates the policy's `WITH CHECK` constraint, and the following error is signalled:

~~~
ERROR:  new row violates row-level security policy for table "invoices"
~~~

Tenant A should be able to modify rows in the `invoice` table that have a `tenant_id` column matching its ID.

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'my_cool_app.9607a12c-3c2f-407b-ae3c-af903542395b';
INSERT INTO invoices (tenant_id, customer_name, amount) VALUES ('9607a12c-3c2f-407b-ae3c-af903542395b'::UUID, 'Customer Three', 678.90);
~~~

The above statement succeeds.

### Video demo: Row-level Security

For a demo showing how to combine Row-level security with [Multi-region SQL]({% link {{ page.version.version }}/multiregion-overview.md %}) to constrain access to specific rows based on a user's geographic region, play the following video:

{% include_cached youtube.html video_id="ZG8RsfwMaa8" %}

## See also

+ [`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %})
- [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %})
- [`ALTER TABLE {ENABLE, DISABLE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security)
- [`ALTER TABLE {FORCE, UNFORCE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#force-unforce-row-level-security)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)

<!-- Sqlchecker test cleanup block. NB. This must always come last. Be sure to comment this out when finished writing the doc. -->

<!--

{% include_cached copy-clipboard.html %}
~~~ sql
RESET ROLE;
DROP POLICY IF EXISTS hr_access ON employees CASCADE;
DROP POLICY IF EXISTS manager_access ON employees CASCADE;
DROP POLICY IF EXISTS self_access ON employees CASCADE;
REVOKE ALL ON employees FROM hr_department;
REVOKE ALL ON employees FROM manager;
REVOKE ALL ON employees FROM employee;
REVOKE ALL ON invoices FROM app_dev;
REVOKE ALL ON tenants FROM app_dev;
DROP ROLE hr_department;
DROP ROLE manager;
DROP ROLE employee;
DROP ROLE edward;
DROP ROLE alice;
DROP ROLE bob;
DROP ROLE carol;
DROP ROLE david;
DROP TABLE IF EXISTS employees CASCADE;
DROP POLICY IF EXISTS tenant_isolation ON invoices CASCADE;
DROP TABLE IF EXISTS tenants, invoices CASCADE;
DROP ROLE app_dev;
~~~

-->
