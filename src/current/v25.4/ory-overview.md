---
title: Ory Overview
summary: Learn about Ory and its component services - Hydra, Kratos, and Keto
toc: true
docs_area: Integrate
---

Ory is an open-source identity and access management (IAM) platform that provides modular components for authentication and authorization in distributed systems. Key components include:

- [Ory Hydra](https://www.ory.sh/hydra) for OAuth2 and OIDC flows.
- [Ory Kratos](https://www.ory.sh/kratos) for identity management (including users, groups, and organizations).
- [Ory Keto](https://www.ory.sh/keto) for fine-grained authorization and relationship-based access control (ReBAC,  inspired by Google Zanzibar).

<img src="{{ 'images/v25.4/integrate-ory-architecture-overview.png' | relative_url }}" alt="Ory Architecture Overview"  style="border:1px solid #eee;max-width:100%" />

## Ory components

### Ory Hydra

Ory Hydra is a server implementation of the OAuth 2.0 authorization framework and the OpenID Connect Core 1.0. It tracks clients, consent requests, and tokens with strong consistency to prevent replay attacks and duplicate authorizations.

The OAuth 2.0 authorization framework enables a third-party application to obtain limited access to an HTTP service, either on behalf of a resource owner by orchestrating an approval interaction between the resource owner and the HTTP service, or by allowing the third-party application to obtain access on its own behalf.

<img src="{{ 'images/v25.4/integrate-ory-oauth2-flow.png' | relative_url }}" alt="OAuth2 Flow"  style="border:1px solid #eee;max-width:100%" />

The OAuth 2.0 authorization flow involving a client application, the resource owner, Ory Hydra (as the authorization server), and the resource server is structured as follows:

<img src="{{ 'images/v25.4/integrate-ory-hydra-flow.png' | relative_url }}" alt="Interaction flow using Ory Hydra"  style="border:1px solid #eee;max-width:100%" />

The sequence diagram depicts the interactions between four key components:

- the client
- the resource owner (typically the user)
- Ory Hydra
- the resource server (the API or service that hosts protected resources)

The flow begins when the Client (an application seeking access to protected resources) initiates a request for authorization from the Resource Owner. This typically takes the form of a redirect to a login or consent screen provided by the Authorization Server (Ory Hydra). The Resource Owner reviews the request and, upon granting access, provides an authorization grant (often an authorization code) to the client.

The Client then uses this authorization grant to request an access token from Ory Hydra. Along with the grant, the client also authenticates itself (using credentials such as a client ID and secret). Ory Hydra validates the authorization grant and client credentials. If everything checks out, it responds by issuing an access token to the client.

Armed with the access token, the Client then makes a request to the Resource Server, presenting the token as proof of authorization. The Resource Server validates the access token, often by introspecting it via Hydra or verifying its signature if it’s a JWT (JSON Web Token) and, if valid, serves the requested protected resource to the client.

This flow encapsulates the standard Authorization Code Grant pattern in OAuth 2.0, with Ory Hydra fulfilling the role of a secure, standards-compliant authorization server that manages token issuance, validation, and policy enforcement. It is designed to separate concerns between applications and services, enabling scalable and secure delegated access.

### Ory Kratos

Ory Kratos stores user identity records, recovery flows, sessions, and login attempts in transactional tables.

Each identity can be associated with one or more credentials, stored in the `identity_credentials` table. These credentials define how a user authenticates with the system, such as through a password, social login, or other mechanisms.

Ory Identities enables users to sign up and manage their profiles without administrative help. Ory Identities implements the following flows:

- Registration
- Login
- Logout
- User Settings
- Account Recovery
- Address Verification
- User-Facing Error
- 2FA / MFA

Kratos' registration flow for API clients doesn't use HTTP redirects and can be summarized as follows:

<img src="{{ 'images/v25.4/integrate-ory-kratos-registration.png' | relative_url }}" alt="Kratos Registration"  style="border:1px solid #eee;max-width:100%" />

### Ory Keto

Ory Keto provides scalable, relationship-based access control (ReBAC).

In Ory Keto, authorization is checked by evaluating whether a relation tuple exists (directly or through recursive expansion) that permits a given subject to perform a relation on an object in a namespace. This data model is designed for high scalability and flexibility, enabling complex access patterns like group membership, role inheritance, and hierarchical access rights.

A permission model is a set of rules that define which relations are checked in the database during a permission check.

Permission checks are answered based on:

- The data available in CockroachDB, for example: "user Bob is the owner of document X".

- Permission rules, for example: "All owners of a document can view it".

When you ask Ory Keto, "Is user Bob allowed to view document X?" the system checks whether Bob has view permission, and then checks whether Bob is the owner of document X. The permission model tells Ory Permissions what to check in the database.

<img src="{{ 'images/v25.4/integrate-ory-permission-graph.png' | relative_url }}" alt="Permission Graph"  style="border:1px solid #eee;max-width:100%" />

## Integrate with Ory

Ory services can use CockroachDB clusters as their persistent data store. Learn how to [create a joint CockroachDB/Ory environment]({% link {{ page.version.version }}/ory-integration-guide.md %}).

## See also

- [Integrate CockroachDB with Ory]({% link {{ page.version.version }}/ory-integration-guide.md %})
