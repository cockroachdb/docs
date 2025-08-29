- [`ENUM`]({% link {{ page.version.version }}/enum.md %}) types are not dropped.
- [`DROP OWNED BY`]({% link {{ page.version.version }}/drop-owned-by.md %}) drops all owned objects as well as any [grants]({% link {{ page.version.version }}/grant.md %}) on objects not owned by the [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles).
- If the [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) for which you are trying to `DROP OWNED BY` was granted a [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (i.e., using the [`GRANT SYSTEM ...`]({% link {{ page.version.version }}/grant.md %}#grant-system-level-privileges-on-the-entire-cluster) statement), the following error will be signalled:

    ~~~
    ERROR: cannot perform drop owned by if role has synthetic privileges; foo has entries in system.privileges
    SQLSTATE: 0A000
    HINT: perform REVOKE SYSTEM ... for the relevant privileges foo has in system.privileges
    ~~~

    The phrase "synthetic privileges" in the error message refers to [system-level privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

    The workaround is to use [`SHOW SYSTEM GRANTS FOR {role}`](show-system-grants.html) and then use [`REVOKE SYSTEM ...`](revoke.html#revoke-system-level-privileges-on-the-entire-cluster) for each privilege in the result. [#88149](https://github.com/cockroachdb/cockroach/issues/88149)