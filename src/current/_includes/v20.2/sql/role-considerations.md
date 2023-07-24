### Role name limitations

The following requirements apply to all role names (also known as usernames).

- Role names are case-insensitive and must be unique.
- When surrounded by quotes in SQL statements (always recommended)—single or double quotes, depending on the statement—role names:
    - Can contain letters, underscores, digits, periods, and dashes. Letters include `a`-`z`, those with diacritical marks, and non-Latin letters.
    - Can begin with a letter, underscore, or digit.
- When referenced in SQL without quotes, role names:
    - Cannot contain periods or dashes.
    - Cannot begin with a digit.
    - Cannot match the name of a SQL keyword.
- Role names cannot exceed 63 bytes. This limits them to 63 characters when all are ASCII characters and to fewer characters when a broader character set is used.

### Role membership and privileges

- After creating roles, you can [grant them privileges to databases and tables](grant.html) and later [revoke](revoke.html) privileges.
- Roles can be members of other roles. All [privileges](authorization.html#privileges) of a role are inherited by all of its members.
- Role options of a role are NOT inherited by any of its members.
- All roles belong to the `public` role, to which you can likewise [grant](grant.html) and [revoke](revoke.html) privileges.
- There is no limit to the number of members in a role.
- Membership loops are not allowed (whether direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).
- On secure clusters, you must [create client certificates for users](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) and users must [authenticate their access to the cluster](authentication.html#client-authentication).
