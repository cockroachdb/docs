---
title: Cluster API
summary: Programmatically access and monitor cluster and node status information with a RESTful API.
toc: true
---

The CockroachDB Cluster API is a REST API that provides information about a cluster and its nodes. The API offers programmatic access to much of the information available in the [DB Console](ui-overview.html) user interface, enabling you to monitor and troubleshoot your cluster using your choice of tooling.

The Cluster API is hosted by all nodes of your cluster and provides information about all nodes. The API is available on the same port that is listening for HTTP connections to the DB Console.

## Resources

The following endpoints are available as URLs under the `/api/v2` base path (for example, `https://localhost:8080/api/v2/health/`). Additional endpoints are planned for future versions of CockroachDB.

Each listed endpoint links to its full [API reference documentation](../api/cluster/v2.html).

Endpoint | Name | Description
--- | --- | ---
[`/health`](../api/cluster/v2.html#operation/health) | Check node health | Determine if the node is running and ready to accept SQL connections.
[`/nodes`](../api/cluster/v2.html#operation/listNodes) | List nodes | Get information on all nodes in the cluster including node IDs, software versions, and hardware.
[`/nodes/{node_id}/ranges`](../api/cluster/v2.html#operation/listNodeRanges) | List node ranges | For a specified node, obtain details on the ranges that it hosts. 
[`/ranges/hot`](../api/cluster/v2.html#operation/listHotRanges) | List hot ranges | Get information on ranges receiving a high number of reads or writes.
[`/ranges/{range_id}`](../api/cluster/v2.html#operation/listRange) | Get range details | Get detailed technical information on a range. Typically of use only to Cockroach Labs engineers.
[`/sessions`](../api/cluster/v2.html#operation/listSessions) | List sessions | Get details of all current users' SQL sessions or sessions by a specific user.
[`/login`](../api/cluster/v2.html#operation/login) | Log in | Authenticate as an admin on the cluster to retrieve a session token to use with further API calls.
[`/logout`](../api/cluster/v2.html#operation/logout) | Log out | Invalidate the session token.

## Requirements

To connect with the API on a secure cluster, you will need:

* A [client TLS certificate generated for the SQL role](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client), using the same CA cert used by the cluster. 

All endpoints except `health/` and `login/` require authentication using a session token. To obtain a session token, you will need:

* A [SQL role](create-role.html) that is a member of the admin role and has login permissions and a password. You will use these credentials with the `login/` endpoint to retrieve the session token which you can then use with further API cals.

## Authentication

1. Retrieve a session token using the `login/` endpoint. For example:

   ``` shell
   curl -d "username=user&password=pass" \
   -H 'Content-Type: application/x-www-form-urlencoded' \
   --cacert certs/ca.crt \
   https://localhost:8080/api/v2/login/
   ```

   A token is returned.

   ``` shell
   {"session":"CIGAiPis4fj3CBIQ3u0rRQJ3tD8yIqee4hipow=="}
   ```

2. Pass the token (`session` value) with each call using the `X-Cockroach-API-Session` header. For example:

   ``` shell
   curl -H "X-Cockroach-API-Session: <token>" \
   --cacert certs/ca.crt \
   https://localhost:8080/api/v2/nodes/
   ```
