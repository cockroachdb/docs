Users created through automatic provisioning have specific restrictions:

- **Password changes**: Auto-provisioned users cannot change their own passwords using `ALTER USER`, even if the cluster setting `sql.auth.change_own_password.enabled` is true.
- **PROVISIONSRC modification**: The `PROVISIONSRC` role option cannot be modified or removed once set.
- **Authentication method**: These users must authenticate through OIDC; password-based authentication is not available.

Attempting to change the password of an auto-provisioned user will result in an error:

~~~ sql
ALTER USER provisioned_user WITH PASSWORD 'newpassword';
~~~

~~~
ERROR: cannot alter PASSWORD/PROVISIONSRC option for provisioned user provisioned_user
~~~