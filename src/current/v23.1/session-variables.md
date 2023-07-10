---
title: Session Variables
summary: A list of supported session variables that can be used with the SET statement to modify the current configuration of the client session.
toc: true
docs_area: reference.sql
---

The [`SET`](set-vars.html) statement can modify one of the session configuration variables. These can also be queried via [`SHOW`](show-vars.html). By default, session variable values are set for the duration of the current session.

CockroachDB supports setting session variables for the duration of a single transaction, using [the `LOCAL` keyword](set-vars.html#set-local).

## Supported variables

{% include {{ page.version.version }}/misc/session-vars.md %}