---
title: Cluster API v2.0
summary: Programmatically access and monitor cluster and node status information with a RESTful API.
toc: true
---

The CockroachDB Cluster API is a REST API that provides information about a cluster and its nodes. The API offers programmatic access to much of the information available in the [DB Console](ui-overview.html) user interface, enabling you to monitor and troubleshoot your cluster using your choice of tooling.

The Cluster API is hosted by all nodes of your cluster and provides information about all nodes. The API is available on the same port that is listening for HTTP connections to the DB Console. This defaults to `8080` and can be specified using `--http-addr={server}:{port}` when configuring your node.

## Resources

The following endpoints are available as URLs under the `/api/v2` base path (for example, `https://localhost:8080/api/v2/health/`). Additional endpoints are planned for future versions of CockroachDB.

Each listed endpoint links to its full [API reference documentation](https://cockroachlabs.com/docs/api/cluster/v2.html).

Endpoint | Name | Description
--- | --- | ---
[`/health`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/health) | Check node health | Determine if the node is running and ready to accept SQL connections.
[`/nodes`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/listNodes) | List nodes | Get details on all nodes in the cluster, including node IDs, software versions, and hardware.
[`/nodes/{node_id}/ranges`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/listNodeRanges) | List node ranges | For a specified node, get details on the ranges that it hosts. 
[`/ranges/hot`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/listHotRanges) | List hot ranges | Get information on ranges receiving a high number of reads or writes.
[`/ranges/{range_id}`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/listRange) | Get range details | Get detailed technical information on a range. Typically used by Cockroach Labs engineers.
[`/sessions`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/listSessions) | List sessions | Get SQL session details of all current users or a specified user.
[`/login`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/login) | Log in | Authenticate as a [SQL role](create-role.html#create-a-role-that-can-log-in-to-the-database) that is a member of the [admin role](authorization.html#admin-role) to retrieve a session token to use with further API calls.
[`/logout`](https://cockroachlabs.com/docs/api/cluster/v2.html#operation/logout) | Log out | Invalidate the session token.

## Requirements

All endpoints except `/health` and `/login` require authentication using a session token. To obtain a session token, you will need:

* A [SQL role](create-role.html) that is a member of the [`admin` role](authorization.html#admin-role) and has login permissions and a password. You will use these credentials with the `/login` endpoint to retrieve the session token which you can then use with further API calls.

To connect with the API on a secure cluster, you will need:

* The CA cert used by the cluster or any intermediary proxy server, either in the client's cert store as a trusted certificate authority or as a file manually specified by the HTTP request (for example, using curl's [cacert](https://curl.se/docs/manpage.html#--cacert)).  

## Authentication

1. Request a session token using the `/login` endpoint. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -d "username=user&password=pass" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    https://localhost:8080/api/v2/login/
    ~~~

2. Record the token (`session` value) that is returned.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    {"session":"CIGAiPis4fj3CBIQ3u0rRQJ3tD8yIqee4hipow=="}
    ~~~

3. Pass the token with each call using the `X-Cockroach-API-Session` header. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -H "X-Cockroach-API-Session: CIGAiPis4fj3CBIQ3u0rRQJ3tD8yIqee4hipow==" \
    https://localhost:8080/api/v2/nodes/
    ~~~

## Versioning and Stability

Future versions of CockroachDB may provide multiple API versions and will continue to provide access to this v2.0 API until it is deprecated. 

All endpoint paths and payloads will remain available within a major API version number (v2.x). Minor versions could add new endpoints but will not remove existing endpoints.
