---
title: cockroach auth-session
summary: To create and manage web sessions and authentication tokens to the HTTP interface from the command line, use the cockroach auth-session command.
toc: true
docs_area: reference.cli
---

To create and manage web sessions and authentication tokens to the HTTP interface from the command line, use the `cockroach auth-session` [command](cockroach-commands.html) with the appropriate subcommands and flags.

## Subcommands

Subcommand | Usage
-----------|------
`login` | Authenticate a user against a running cluster's HTTP interface, generating an HTTP authentication token (a "cookie") which can also be used by non-interactive HTTP-based database management tools. Must be used with a valid, existing user. May be used to generate a cookie for the `root` user.
`logout` | Revokes all previously-issued HTTP authentication tokens and invalidates all web sessions for the given user.
`list` | List all authenticated sessions to the HTTP interface that are currently active or have been active since the `cockroach` process started.

## Synopsis

Log in to the HTTP interface, generating an HTTP authentication token for a given user:

~~~ shell
$ cockroach auth-session login {username} [flags]
~~~

Log out from the HTTP interface, revoking all active HTTP authentication tokens for a given user:

~~~ shell
$ cockroach auth-session logout {username} [flags]
~~~

List all authenticated sessions to the HTTP interface since the `cockroach` process started:

~~~ shell
$ cockroach auth-session list [flags]
~~~

View help:

~~~ shell
$ cockroach auth-session --help
~~~

~~~ shell
$ cockroach auth-session {subcommand} --help
~~~

## Flags

All three `auth-session` subcommands accept the standard [SQL command-line flags](cockroach-start.html#flags).

In addition, the `auth-session login` subcommand supports the following flags.

Flag | Description
-----|------------
`--expire-after` | Duration of the newly-created HTTP authentication token, after which the token expires and the authentication session closes. Specify the duration in numeric values suffixed by one or more of `h`, `m`, and `s` to indicate hour, minute, and second duration. See the [example](#log-in-to-the-http-interface-with-a-custom-expiry).<br><br>**Default:** `1h0m0s` (1 hour)
`--only-cookie` | Limits output to only the newly-created HTTP authentication token (the "cookie") in the response, appropriate for output to other commands. See the [example](#log-in-to-the-http-interface-with-limited-command-output).

## Response

The `cockroach auth-session` subcommands return the following fields.

### `auth-session login`

Field | Description
------|------------
`username` | The username of the user authenticated.
`session ID` | The session ID to the HTTP interface established for that user.
`authentication cookie` | The cookie that may be used from the command line, or from other tools, to authenticate access to the HTTP interface for that user.

### `auth-session logout`

Field | Description
------|------------
`username` | The username of the user whose session was revoked.
`session ID` | The session ID to the HTTP interface previously established for that user.
`revoked` | The date and time of revocation for that user's authenticated session.

### `auth-session list`

Field | Description
------|------------
`username` | The username of the user authenticated.
`session ID` | The session ID to the HTTP interface established for that user.
`created` | The date and time a session was created.
`expired` | The date and time a session expired.
`revoked` | The date and time of revocation for that user's authenticated session. If the session is still active, this will appear as `NULL`.
`last used` | The date and time of the last access to the HTTP interface using this session token.

## Required roles

To run any of the `auth-session` subcommands, you must be a member of the [`admin` role](security-reference/authorization.html#admin-role). The user being authenticated via `login` or `logout` does not require any special roles.

## Considerations

- The `login` subcommand allows administrative users to create HTTP authentication tokens with an arbitrary expiration date and time. If operational policy requires stricter control of authentication sessions, you can:
  - Monitor `system.web_sessions` for all current and recent HTTP sessions.
  - Revoke HTTP authentication tokens as needed with the `logout` subcommand.
  - Set the `--expire-after` flag with a finer granularity.
- The `logout` subcommand logs out all sessions for the given user; you cannot target individual sessions for logout. If more control is desired, consider setting the `--expire-after` flag with a finer granularity.

## Examples

### Log in to the HTTP interface

Log in to the HTTP interface, by generating a new HTTP authentication token for the `web_user` user:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach auth-session login web_user
~~~

~~~
  username |     session ID     |                       authentication cookie
-----------+--------------------+---------------------------------------------------------------------
  web_user | 784445853689282561 | session=CIGAtrWQq7rxChIQTXxYNNQxAYjyLAjHWxgUMQ==; Path=/; HttpOnly; Secure
(1 row)
~~~

### Log in to the HTTP interface with a custom expiry

Log in to the HTTP interface, by generating a new HTTP authentication token for the `web_user` user and specifying a token expiry of 4 hours and 30 minutes:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach auth-session login web_user --expire-after=4h30m
~~~

~~~
  username |     session ID     |                       authentication cookie
-----------+--------------------+---------------------------------------------------------------------
  web_user | 784445853689282561 | session=CIGAtrWQq7rxChIQTXxYNNQxAYjyLAjHWxgUMQ==; Path=/; HttpOnly; Secure
(1 row)
~~~

### Log in to the HTTP interface with limited command output

Log in to the HTTP interface, by generating a new HTTP authentication token for the `web_user` user, limiting command output to only the generated cookie:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach auth-session login web_user --only-cookie
~~~

~~~
session=CIGA6t2q0LrxChIQV8QCF3vuYSasR7h4LPSfmg==; Path=/; HttpOnly; Secure
~~~

This is useful when passing the output of this command to another command line tool. For example, with `--only-cookie`, you might use the output of `auth-session` directly with `curl` to list local log files:

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl --cookie "$(cockroach auth-session login web_user --certs-dir=certs --only-cookie)" https://localhost:8080/_status/logfiles/local
~~~

Of course you can also provide the HTTP authentication token directly:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --cookie 'session=CIGA8I7/irvxChIQDtZQsMtn3AqpgDko6bldSw==; Path=/; HttpOnly; Secure' https://localhost:8080/_status/logfiles/local
~~~

### Terminate all active sessions for a user

Terminate all active sessions for the `web_user` user:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach auth-session logout web_user
~~~

~~~
  username |     session ID     |          revoked
-----------+--------------------+-----------------------------
  web_user | 784445853689282561 | 2022-08-02 18:24:50.819614
  web_user | 784447132063662081 | 2022-08-02 18:24:50.819614
  web_user | 784449147579924481 | 2022-08-02 18:47:20.105254
  web_user | 784449219848241153 | 2022-08-02 18:47:20.105254
(4 rows)
~~~

Note that the output includes all sessions that have existed for this user since the `cockroach` process started, which may include sessions which had been terminated previously.

### List all sessions

List all active and closed sessions for all users who have been authenticated since the `cockroach` process started:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach auth-session list
~~~

~~~
  username |     session ID     |          created           |          expires           |          revoked           |         last used
-----------+--------------------+----------------------------+----------------------------+----------------------------+-----------------------------
  root     | 784428093743988737 | 2022-08-02 16:47:36.342338 | 2022-08-02 17:47:36.341997 | NULL                       | 2022-08-02 16:47:36.342338
  root     | 784428586862215169 | 2022-08-02 16:50:06.830294 | 2022-08-02 17:50:06.829974 | NULL                       | 2022-08-02 16:50:06.830294
  web_user | 784447132063662081 | 2022-08-02 18:24:26.37664  | 2022-08-02 19:24:26.376299 | 2022-08-02 18:24:50.819614 | 2022-08-02 18:24:26.37664
  web_user | 784449147579924481 | 2022-08-02 18:34:41.463345 | 2022-08-02 19:34:41.463006 | 2022-08-02 18:47:20.105254 | 2022-08-02 18:34:41.463345
~~~

A value of `NULL` in the `revoked` column indicates that the session is still active.

## See also

- [`cockroach` Commands Overview](cockroach-commands.html)
- [DB Console Overview](ui-overview.html)
