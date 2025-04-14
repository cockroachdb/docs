---
title: Row-Level Security (RLS) Overview
summary: XXX
toc: true
keywords: security,row level security, RLS
docs_area: develop
---

Row Level Security (_RLS_) is a security feature that allows organizations to restrict access to specific rows of data in a database based on user [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles), [permissions]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-model), or other criteria.

RLS complements standard SQL privileges ([`GRANT`]({% link {{ page.version.version }}/grant.md %})/[`REVOKE`]({% link {{ page.version.version }}/revoke.md %})) by allowing administrators to define policies that determine precisely which rows users can view or modify within a specific table.

Policies function as filters or constraints applied automatically by CockroachDB during query execution. They are based on boolean expressions evaluated in the context of the current user, session properties, and the row data itself.

When RLS is enabled on a table:

1. Existing [SQL privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) still determine *if* a user can access the table at all (e.g., `SELECT`, `INSERT`).
2. [RLS policies]({% link {{ page.version.version }}/show-policies.md %}) determine *which rows* within the table are accessible or modifiable for specific commands.

## Use cases

Primary use cases for RLS include:

- [Restricting access to sensitive data for compliance](#restricting-access-to-sensitive-data-for-compliance)
- [Designing multi-tenant applications](#designing-multi-tenant-applications)

### Restricting access to sensitive data for compliance

In industries like finance or healthcare, organizations are required to ensure that only authorized users access sensitive data. Row-Level Security (RLS) addresses this requirement directly within the database.

For example, RLS allows a financial institution to restrict access to customer records based on roles or departments. In healthcare, RLS can be used to enforce policies ensuring patient records are visible only to the medical staff involved in their care.

RLS embeds access control logic directly into the database and eliminates the need for manual filtering in application code. This centralized enforcement prevents inconsistencies, reduces security attack surface, and simplifies compliance with data access regulations.

### Designing multi-tenant applications

[XXX](XXX): YOU ARE HERE

In multi-tenant applications, like Software as a Service (SaaS), isolating data between tenants within shared tables is a fundamental requirement. Row-Level Security (RLS) provides the database-level mechanism for enforcing this isolation. SaaS providers utilize RLS policies to ensure tenants can only access their own data, eliminating the need for complex and potentially insecure application-layer filtering logic based on tenant IDs. These policies automatically enforce tenant separation directly within the database, guaranteeing that each tenant’s data is securely isolated and accessible only by their authorized users.

## Policy Evaluation Semantics

DESIGN DOC:

- All policies apply to a specific set of roles. For a policy to be applicable, it must match at least one of the roles assigned to it. If the policy is associated with the PUBLIC role, it applies to all roles. In order for reads or writes to succeed, there must be at least one permissive policy for the user's role.
- Permissive policies are combined using OR logic, while restrictive policies are combined using AND logic. The overall policy enforcement is determined by evaluating: (permissive policies) AND (restrictive policies).
- USING filters rows during reads; WITH CHECK validates writes and defaults to USING if absent.

GEMINI:

For a given user, table, and command:

1.  Applicable Policies: Identify all policies matching the user's roles, the table, and the command.
2.  Permissive `USING` Combination: The `USING` expressions of all applicable `PERMISSIVE` policies are combined with `OR`. If no permissive policies exist, access is implicitly denied unless restrictive policies exist.
3.  Restrictive `USING` Combination: The `USING` expressions of all applicable `RESTRICTIVE` policies are combined with `AND`.
4.  Final `USING` Filter: A row is visible/modifiable if `(Permissive OR combination)` is `TRUE` AND `(Restrictive AND combination)` is `TRUE`. If no permissive policies match, the first term is `FALSE`. If no restrictive policies match, the second term is `TRUE`.
5.  `WITH CHECK` Evaluation (for `INSERT`/`UPDATE`):
    *   Permissive `WITH CHECK` expressions are combined with `OR`.
    *   Restrictive `WITH CHECK` expressions are combined with `AND`.
    *   The row passes if `(Permissive OR combination)` is `TRUE` AND `(Restrictive AND combination)` is `TRUE`. If the check fails, an error is raised.

Default Deny: If RLS is enabled but no policies apply to a given user/command combination, access is denied by default. It is common practice to define a permissive base policy or rely on restrictive policies for fine-grained control.

## Considerations

Performance: Complex policy expressions evaluated per-row can impact query performance. Optimize expressions and consider indexing relevant columns. Testing revealed approximately the following performance impacts to a write-heavy workload:

| Number of policies | Percentage slowdown (approx.) |
|--------------------|-------------------------------|
| 1                  | 110%                          |
| 10                 | 140%                          |
| 50                 | 200%                          |

(above via https://cockroachlabs.slack.com/archives/C083W9NK34H/p1744914022589429)

Security: Policy expressions execute with the privileges of the user invoking the query, unless functions marked `SECURITY DEFINER` are used (use with extreme caution). Ensure expressions do not have unintended side effects.

Complexity: Managing numerous overlapping policies can become complex. Clear naming conventions and documentation are essential.

Views: RLS policies on underlying tables apply when views are accessed. Policies can also be defined directly on views.

Inheritance/Partitioning: Policies on parent tables typically apply to child/partition tables, but specific behaviors may vary depending on the database implementation.

CDC messages that are emitted from a table will not be filtered using RLS policies.

Backup/Restore will bypass RLS policies.

LDR/PCR do not take into account RLS policies. Since RLS policies amount to a schema change, LDR's limitations around schema changes also apply to RLS. For PCR, the target cluster will have all RLS policies applied to the data because it’s a byte for byte replication which replicates the same schema and any changes to the schema.

- Foreign keys (including cascades), unique/primary key constraints, TRUNCATE, backup/restore, and changefeeds (CDC) bypass RLS.
- Views use the role of the owner; future work may include security_invoker support in order to use the role of the user executing the view.

## Examples

### `DROP POLICY`

Removes an existing policy.

Syntax:

{% include_cached copy-clipboard.html %}
~~~
DROP POLICY [ IF EXISTS ] policy_name ON table_name [ CASCADE | RESTRICT ];
~~~

*   `IF EXISTS`: Suppresses error if the policy doesn't exist.
*   `CASCADE`/`RESTRICT`: Standard dependency handling (usually not relevant for policies themselves).

### `CREATE POLICY`

Defines a new RLS policy on a table.

Syntax:

{% include_cached copy-clipboard.html %}
~~~
CREATE POLICY policy_name ON table_name
    [ AS { PERMISSIVE | RESTRICTIVE } ]
    [ FOR { ALL | SELECT | INSERT | UPDATE | DELETE } ]
    [ TO { role_name | PUBLIC | CURRENT_USER | SESSION_USER } [, ...] ]
    [ USING ( using_expression ) ]
    [ WITH CHECK ( check_expression ) ];
~~~

Components:

*   `policy_name`: Unique identifier for the policy on the table.
*   `table_name`: The table to which the policy applies.
*   `AS { PERMISSIVE | RESTRICTIVE }`: (Default: `PERMISSIVE`)
    *   `PERMISSIVE`: Policies are combined using `OR`. A row is accessible if *any* permissive policy grants access.
    *   `RESTRICTIVE`: Policies are combined using `AND`. All restrictive policies must grant access for a row to be accessible. Restrictive policies are evaluated *after* permissive policies. If any restrictive policy denies access, the row is inaccessible, regardless of permissive policies.
*   `FOR command`: (Default: `ALL`) Specifies the SQL command(s) the policy applies to (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
*   `TO role_name | ...`: (Default: `PUBLIC`) Specifies the database role(s) to which the policy applies.
*   `USING ( using_expression )`:
    *   Applies to `SELECT`, `UPDATE`, `DELETE`. Also applies to `INSERT` for `INSERT ... ON CONFLICT DO UPDATE`.
    *   Defines the filter condition. Only rows for which `using_expression` evaluates to `TRUE` are visible or available for modification. Rows evaluating to `FALSE` or `NULL` are silently excluded.
    *   Evaluated *before* any data modification attempt.
*   `WITH CHECK ( check_expression )`:
    *   Applies to `INSERT`, `UPDATE`.
    *   Defines a constraint condition. Rows being inserted or updated must satisfy `check_expression` (evaluate to `TRUE`).
    *   Evaluated *after* the row data is prepared but *before* it is written.
    *   If the expression evaluates to `FALSE` or `NULL`, the operation fails with a row-level security policy violation error.

Evaluation Context: Expressions (`USING`, `WITH CHECK`) can reference table columns and utilize session-specific functions (e.g., `current_user`, `session_user`) and variables.

Example: Only allow users to see/modify their own rows in an `orders` table.

{% include_cached copy-clipboard.html %}
~~~ sql
-- Minimal schema for the 'orders' table example.
CREATE TABLE orders (user_id TEXT PRIMARY KEY, order_details TEXT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Assume 'orders' table has a 'user_id' column matching logged-in user names.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_orders_policy ON orders
    FOR ALL
    TO PUBLIC -- Applies to all roles
    USING ( user_id = current_user )
    WITH CHECK ( user_id = current_user );
~~~

### `ALTER POLICY`

Modifies an existing policy.

Syntax:

{% include_cached copy-clipboard.html %}
~~~
ALTER POLICY policy_name ON table_name RENAME TO new_policy_name;

ALTER POLICY policy_name ON table_name
    [ TO { role_name | PUBLIC | CURRENT_USER | SESSION_USER } [, ...] ]
    [ USING ( using_expression ) ]
    [ WITH CHECK ( check_expression ) ];
~~~

Capabilities:

*   Rename the policy.
*   Change the applicable roles.
*   Modify the `USING` expression.
*   Modify the `WITH CHECK` expression.

*Note: Cannot change the `PERMISSIVE`/`RESTRICTIVE` nature or the applicable command (`FOR`) via `ALTER`. Requires `DROP` and `CREATE`.*

### Enable or Disable RLS

RLS must be explicitly enabled per table. Table owners typically control this.

Enable:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
~~~

Disable:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
~~~

Force (Bypass for Owner):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
~~~

*Note: `FORCE` ensures policies apply even to the table owner. By default, owners bypass RLS.*

NB. RLS applies to a table only when explicitly enabled in its table definition using ALTER TABLE ... ENABLE ROW LEVEL SECURITY. Exempt roles include admins, table owners (unless the table is set to FORCE ROW LEVEL SECURITY), and roles with BYPASSRLS.

### Example: RLS for Data Security (Fine-Grained Access Control)

#### Goal

Restrict access to specific rows within a table based on user roles, attributes, or relationships defined within the data itself. This goes beyond table-level `GRANT` permissions. Common examples include restricting access to salary information, personal data, or region-specific records.

#### Scenario Example: Employee Data Access

Consider an `employees` table containing sensitive salary information. We want to enforce the following rules:
*   Employees can view their own record.
*   Managers can view the records of their direct reports.
*   Members of the `hr_department` role can view all records.

#### Implementation Example

1. Sample Schema & Roles:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create a role needed for the example policies.
-- Note: In a real scenario, manage roles appropriately.
-- This may require admin privileges not available to all users.
CREATE ROLE hr_department;

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
('david', 'David Green', 'carol', 70000);

-- Grant basic table access (RLS will refine row access)
GRANT SELECT, UPDATE(full_name) ON employees TO PUBLIC; -- Example: allow self-update of name
GRANT SELECT, INSERT, UPDATE, DELETE ON employees TO hr_department;
~~~

2. Enable RLS:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- Optional: Ensure owner is also subject to policies if needed
-- ALTER TABLE employees FORCE ROW LEVEL SECURITY;
~~~

3. Define Policies:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Policy 1: Allow HR full access
CREATE POLICY hr_access ON employees
    FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
    TO hr_department
    USING (true) -- No row restriction for HR
    WITH CHECK (true); -- No check restriction for HR
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Policy 2: Allow employees to view/update their own record
-- Note: Assumes database username matches 'employees.username'
CREATE POLICY self_access ON employees
    AS PERMISSIVE -- Combine with other permissive policies (like manager access)
    FOR SELECT, UPDATE -- Only applies to SELECT and UPDATE commands
    TO PUBLIC -- Applies to all roles not covered by more specific policies
    USING (username = current_user)
    WITH CHECK (username = current_user); -- Ensure users can only update their own record
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Policy 3: Allow managers to view direct reports' records
-- Requires a way to look up the manager's username. Using current_user here.
CREATE POLICY manager_access ON employees
    AS PERMISSIVE -- Combine with self_access
    FOR SELECT -- Only for viewing
    TO PUBLIC
    USING (manager_username = current_user);
    -- No WITH CHECK needed as it's SELECT-only
~~~

4. Verification (Conceptual):

- `SELECT * FROM employees;` executed by user `alice` (manager): Shows Alice, Bob, Carol.
- `SELECT * FROM employees;` executed by user `bob` (employee): Shows only Bob.
- `SELECT * FROM employees;` executed by user `carol` (manager): Shows Carol, David.
- `SELECT * FROM employees;` executed by user belonging to `hr_department`: Shows all rows.
- `UPDATE employees SET salary = 999999 WHERE username = 'bob';` executed by `alice`: Fails (violates `self_access` `WITH CHECK` if Alice tries to update Bob's salary, and `manager_access` doesn't grant `UPDATE`).
- `UPDATE employees SET full_name = 'Robert Jones' WHERE username = 'bob';` executed by `bob`: Succeeds (allowed by `self_access`).

#### Considerations

- Performance: Complex `USING` clauses, especially those involving subqueries or joins to check relationships (like manager hierarchy), can impact query performance. Index relevant columns (`username`, `manager_username`).
- `PERMISSIVE` vs `RESTRICTIVE`: `PERMISSIVE` is often suitable here, allowing access if *any* relevant policy grants it (e.g., self-access OR manager-access). `RESTRICTIVE` policies act as additional hurdles that *must* be passed.
- `SECURITY DEFINER` Functions: If policy logic requires elevated privileges (e.g., accessing a central authorization table), use `SECURITY DEFINER` functions with extreme caution, ensuring they are secure against misuse.
- Complexity: Managing many overlapping policies requires careful design, naming, and documentation. Consider simplifying rules or using role inheritance where possible.

### Example: RLS for Multi-Tenant Isolation

#### Goal

Enforce strict data separation between different tenants (customers, organizations) sharing the same database infrastructure and schema. Each tenant must only be able to see and modify their own data. This is critical for SaaS applications.

#### Scenario Example: Shared Invoice Table

A SaaS application serves multiple tenants. All invoice data resides in a single `invoices` table, distinguished by a `tenant_id` column. The application ensures that user sessions are associated with a specific `tenant_id`.

#### Implementation Example

1. Sample Schema & Tenant Context:

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

-- Index tenant_id for performance! Crucial for RLS.
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);

-- Assume application sets the tenant context for the session, e.g.:
-- SET app.current_tenant_id = '...'; -- (Use appropriate GUC or session variable)
-- We will use current_setting('app.current_tenant_id') in policies.
-- Ensure this setting is reliably managed by the application layer.
~~~

2. Enable RLS:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY; -- Crucial: Apply to owner/admins too unless bypassed explicitly
~~~

3. Define Tenant Isolation Policy:

A single, robust policy is often sufficient and preferred for clarity and security.

{% include_cached copy-clipboard.html %}
~~~ sql
-- Policy: Enforce tenant isolation for all operations
CREATE POLICY tenant_isolation ON invoices
    AS RESTRICTIVE -- Ensures this MUST pass, prevents accidental bypass by permissive policies
    FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
    TO PUBLIC -- Applies to all application users (adjust if specific roles are used)
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID) -- Filter rows on SELECT/UPDATE/DELETE
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::UUID); -- Enforce tenant_id on INSERT/UPDATE
~~~

Explanation:

*   `AS RESTRICTIVE`: Makes this policy mandatory. If other policies exist, they must *also* pass. For simple tenant isolation, this is often the safest default. If only this policy exists, `PERMISSIVE` would functionally be similar but `RESTRICTIVE` signals intent more clearly.
*   `FOR ALL`: Covers all data modification and retrieval.
*   `TO PUBLIC`: Applies the policy broadly. Roles should primarily manage *table-level* access (`GRANT`), while this policy handles *row-level* visibility.
*   `USING`: Ensures queries only *see* rows matching the session's `tenant_id`. The `current_setting('var', true)` variant returns NULL if the setting is not defined, preventing accidental exposure if the context isn't set (NULL comparison yields NULL, denying access). The cast `::UUID` is necessary if `tenant_id` is UUID type.
*   `WITH CHECK`: Critically important. Prevents users from `INSERT`ing rows with a `tenant_id` different from their session's `tenant_id`, or `UPDATE`ing a row to change its `tenant_id` across boundaries. Without this, a user could potentially insert data into another tenant's space.

4. Verification (Conceptual):

*   Session A: `SET app.current_tenant_id = 'tenant-A-uuid'; SELECT * FROM invoices;` -> Shows only invoices where `tenant_id = 'tenant-A-uuid'`.
*   Session B: `SET app.current_tenant_id = 'tenant-B-uuid'; SELECT * FROM invoices;` -> Shows only invoices where `tenant_id = 'tenant-B-uuid'`.
*   Session A: `INSERT INTO invoices (tenant_id, ...) VALUES ('tenant-B-uuid', ...);` -> Fails (violates `WITH CHECK` constraint).
*   Session A: `INSERT INTO invoices (tenant_id, ...) VALUES ('tenant-A-uuid', ...);` -> Succeeds.
*   Session A: `UPDATE invoices SET tenant_id = 'tenant-B-uuid' WHERE invoice_id = 123;` -> Fails (violates `WITH CHECK`).

#### Considerations

*   Tenant Context Management: The reliability of setting and isolating the `app.current_tenant_id` (or equivalent mechanism) per session/request is paramount. This is typically handled in the application layer or connection pool middleware. Failure here bypasses RLS.
*   Performance: The `USING (tenant_id = ...)` check is highly efficient if `tenant_id` is indexed. Avoid complex logic in tenant isolation policies; keep them simple and fast.
*   `WITH CHECK` is Non-Negotiable: Omitting `WITH CHECK` creates a severe security vulnerability, allowing cross-tenant data insertion or modification.
*   Superuser/Admin Access: Database superusers and roles with the `BYPASSRLS` attribute bypass RLS. Application-level administrative roles needing cross-tenant access might require specific functions or views designed with `SECURITY DEFINER` (use cautiously) or temporary privilege escalation managed outside standard RLS.
*   Default Deny: If RLS is enabled (`FORCE`) and the `current_setting` is missing, the `USING` condition evaluates to NULL, denying access, which is generally the desired safe behavior.
*   Testing: Rigorously test tenant isolation, including edge cases and attempts to circumvent the policies.

## Video demo: Row-level Security

For a demo showing how to combine Row-level security with [Multi-region SQL]({% link {{ page.version.version }}/multiregion-overview.md %}) to constrain access to specific rows based on a user's geographic region, play the following video:

[XXX](XXX): ADD LINKS TO ROB'S VIDEO HERE

https://drive.google.com/drive/folders/1XTBTpxnGxs6P1aZd_3rU_emH7px3LiFE

## See also

+ [`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %})
- [`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %})
- [`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %})
- [`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %})
- [`ALTER TABLE {ENABLE, DISABLE} ROW LEVEL SECURITY`]({% link {{ page.version.version }}/alter-table.md %}#enable-disable-row-level-security)
- [`ALTER ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls)
- [`CREATE ROLE ... WITH BYPASSRLS`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-bypass-row-level-security-rls)

<!-- sqlchecker tests cleanup block, comment this out after writing the doc -->

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TABLE IF EXISTS employees, orders CASCADE;
DROP ROLE IF EXISTS hr_department;
DROP POLICY IF EXISTS user_orders_policy ON orders CASCADE;
DROP TABLE IF EXISTS tenants, invoices CASCADE;
DROP POLICY IF EXISTS tenant_isolation ON invoices CASCADE;
~~~
