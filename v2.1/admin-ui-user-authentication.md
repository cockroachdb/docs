---
title: Secure the Admin UI
summary: Learn how to enable user authentication for secure clusters for the Admin UI.
toc: false
---

By default, CockroachDB allows all users to access and view the Admin UI. However, for secure clusters, you can enable user authentication so that only authorized users can access and view the Admin UI.

<div id="toc"></div>

1. Start a secure cluster as described in our [deployment tutorials](manual-deployment.html).

    However, when starting each node, be sure to set the `COCKROACH_EXPERIMENTAL_REQUIRE_WEB_LOGIN=TRUE` environment variable, for example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ COCKROACH_EXPERIMENTAL_REQUIRE_WEB_LOGIN=TRUE \
      ./cockroach start --host=<node1 hostname> --certs-dir=certs
    ~~~

2. For each user who should have access to the Admin UI, [create a user with a password](create-user.html).

    On accessing the Admin UI, these users will see a Login screen, where they will need to enter their usernames and passwords.
