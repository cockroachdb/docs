- If the [role](security-reference/authorization.html#roles) for which you are trying to `DROP OWNED BY` was granted a [system-level privilege](security-reference/authorization.html#system-level-privileges) (i.e., using the [`GRANT SYSTEM ...`](grant.html#grant-system-level-privileges-on-the-entire-cluster) statement), the error shown below will be signalled.  The workaround is to use [`SHOW SYSTEM GRANTS FOR {role}`](show-system-grants.html) and then use [`REVOKE SYSTEM ...`](revoke.html#revoke-system-level-privileges-on-the-entire-cluster) for each privilege in the result. For more information about this known limitation, see [cockroachdb/cockroach#88149](https://github.com/cockroachdb/cockroach/issues/88149).

    ~~~
    ERROR: cannot perform drop owned by if role has synthetic privileges; foo has entries in system.privileges
    SQLSTATE: 0A000
    HINT: perform REVOKE SYSTEM ... for the relevant privileges foo has in system.privileges
    ~~~

Note that the phrase "synthetic privileges" in the above error message refers to [system-level privileges](security-reference/authorization.html#system-level-privileges).