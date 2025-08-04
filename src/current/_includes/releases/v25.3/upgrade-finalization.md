During a major-version upgrade, certain features and performance improvements are available until the upgrade is finalized. In v25.3, these are:

- The `CITEXT` data type
- Support for automatically determining the region column for a REGIONAL BY ROW table using a foreign key constraint
- Lock loss detection for weaker isolation levels 
- Automatic user provisioning via the LDAP/Active Directory integration
- The `estimated_last_login_time` column in `SHOW ROLES`/`SHOW USERS` output