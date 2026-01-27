---
title: Ory Overview
summary: Learn about Ory and its component services - Hydra, Kratos, and Keto
toc: true
docs_area: Integrate
---

[Ory](https://www.ory.com/) is an open-source identity and access management (IAM) platform that provides modular components for authentication and authorization in distributed systems. Key components include:

- [Ory Hydra](https://www.ory.com/hydra) for OAuth2 and OIDC flows.
- [Ory Kratos](https://www.ory.com/kratos) for identity management (including users, groups, and organizations).
- [Ory Keto](https://www.ory.com/keto) for fine-grained authorization and relationship-based access control (ReBAC,  inspired by Google Zanzibar).

The following diagram shows the relationship between Ory Hydra, Kratos and Keto:

<img src="/docs/images/{{ page.version.version }}/integrate-ory-architecture-overview.png" alt="Ory Architecture Overview"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

## Ory components

### Ory Hydra

Ory Hydra is a server implementation of the [OAuth 2.0 authorization framework](https://oauth.net/2/) and the [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-final.html). It tracks clients, consent requests, and tokens with strong consistency to prevent replay attacks and duplicate authorizations.

The OAuth 2.0 authorization framework enables a third-party application to obtain limited access to an HTTP service, either on behalf of a resource owner by orchestrating an approval interaction between the resource owner and the HTTP service, or by allowing the third-party application to obtain access on its own behalf.

The following diagram shows the series of requests made between a user, an application client, and an underlying authorization server:

<img src="/docs/images/{{ page.version.version }}/integrate-ory-oauth2-flow.png" alt="OAuth2 Flow"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

This sequence diagram illustrates the OAuth 2.0 authorization flow as a series of requests and responses, using Ory Hydra as the authorization server:

<img src="/docs/images/{{ page.version.version }}/integrate-ory-hydra-flow.png" alt="Interaction flow using Ory Hydra"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

The diagram depicts the interactions between four key components:

- **Client**: An application seeking access to protected resources.
- **Resource Owner**: The user.
- **Ory Hydra**: The authorization server.
- **Resource Server**: The API or service that hosts protected resources.

The flow begins when the Client initiates a request for authorization from the Resource Owner. This typically takes the form of a redirect to a login or consent screen provided by Ory Hydra. The Resource Owner reviews the request and, upon granting access, provides an authorization grant (often an authorization code) to the Client.

The Client then uses this authorization grant to request an access token from Hydra. Along with the grant, the Client also authenticates itself (using credentials such as a Client ID and secret). Hydra validates the authorization grant and Client credentials. If everything checks out, it responds by issuing an access token to the Client.

Armed with the access token, the Client then makes a request to the Resource Server, presenting the token as proof of authorization. The Resource Server validates the access token, often by introspecting it via Hydra or verifying its signature if it’s a [JSON Web Token (JWT)](https://www.jwt.io/introduction#what-is-json-web-token) and, if valid, serves the requested protected resource to the Client.

This flow encapsulates the standard Authorization Code Grant pattern in OAuth 2.0, with Ory Hydra fulfilling the role of an authorization server that manages token issuance, validation, and policy enforcement.

### Ory Kratos

Ory Kratos stores user identity records, recovery flows, sessions, and login attempts in transactional tables.

Each identity can be associated with one or more credentials, stored in the `identity_credentials` table. These credentials define how a user authenticates with the system, such as through a password, social login, or other mechanisms.

Kratos enables users to sign up and manage their profiles without administrative help. It implements the following flows:

- Registration
- Login
- Logout
- User Settings
- Account Recovery
- Address Verification
- User-Facing Error
- 2FA / MFA

The following diagram demonstrates how an API Client might interact with Ory Kratos:

<img src="/docs/images/{{ page.version.version }}/integrate-ory-kratos-registration.png" alt="Kratos Registration"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

### Ory Keto

Ory Keto provides scalable, relationship-based access control (ReBAC).

In Keto, authorization is checked by evaluating whether a relation tuple exists (directly or through recursive expansion) that permits a given subject to perform a relation on an object in a namespace. This data model is designed for high scalability and flexibility, enabling complex access patterns like group membership, role inheritance, and hierarchical access rights.

A permission model is a set of rules that define which relations are checked in the database during a permission check.

Permission checks are answered based on:

- The data available in CockroachDB, for example: "user Bob is the owner of document X".

- Permission rules, for example: "All owners of a document can view it".

When you ask Keto, "Is user Bob allowed to view document X?" the system checks whether Bob has view permission, and then checks whether Bob is the owner of document X. The permission model tells Ory Keto what to check in the database.

The following diagram illustrates the object relationships that Ory Keto enables:

<img src="/docs/images/{{ page.version.version }}/integrate-ory-permission-graph.png" alt="Permission Graph"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

## Integrate with Ory

Ory services can use CockroachDB clusters as their persistent data store. Learn how to [create a joint CockroachDB/Ory environment]({% link {{ page.version.version }}/ory-integration-guide.md %}).

## See also

- [Integrate CockroachDB with Ory]({% link {{ page.version.version }}/ory-integration-guide.md %})
