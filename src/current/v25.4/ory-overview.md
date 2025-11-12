---
title: Ory Overview
summary: Learn about Ory and its component services - Hydra, Kratos, and Keto
toc: true
docs_area: Integrate
---

As organizations scale globally and users expect seamless, real-time access from anywhere in the world, traditional identity and access management (IAM) systems often become a bottleneck. These legacy solutions, typically built on monolithic, region-bound architectures, struggle to provide the resilience, performance, and flexibility required in distributed, cloud-native environments. They often lack support for multi-region replication, offer limited observability, and are difficult to adapt to evolving product needs. Most importantly, they do not offer enterprises the control they need over their architecture as their business grows.

## What is Ory?

Ory is a leading identity and access management (IAM) solution. Ory helps organizations modernize their authentication and authorization stacks with a composable, cloud-native approach. Ory has established itself as a pioneer in delivering flexible, scalable, and developer-friendly IAM tools for modern applications.

Ory provides modular, cloud-native IAM tools built for distributed systems. Key components include:

- [Ory Hydra](https://www.ory.sh/hydra) for OAuth2 and OIDC flows
- [Ory Kratos](https://www.ory.sh/kratos) for identity management (including users, groups, and organizations)
- [Ory Keto](https://www.ory.sh/keto) for fine-grained authorization and relationship-based access control (ReBAC,  inspired by Google Zanzibar)

<img src="https://github.com/amineelkouhen/crdb-ory-sandbox/raw/main/images/fig1_Ory_Architecture_Overview.png" alt="Ory Architecture Overview"  style="border:1px solid #eee;max-width:100%" />

### Ory Hydra

Ory Hydra is a server implementation of the OAuth 2.0 authorization framework and the OpenID Connect Core 1.0. It tracks clients, consent requests, and tokens with strong consistency to prevent replay attacks or duplicate authorizations.

The OAuth 2.0 authorization framework enables a third-party application to obtain limited access to an HTTP service, either on behalf of a resource owner by orchestrating an approval interaction between the resource owner and the HTTP service, or by allowing the third-party application to obtain access on its own behalf.

<img src="https://github.com/amineelkouhen/crdb-ory-sandbox/raw/main/images/fig7_OAuth2_Flow.png" alt="OAuth2 Flow"  style="border:1px solid #eee;max-width:100%" />

The OAuth 2.0 authorization flow involving a client application, the resource owner, Ory Hydra (as the authorization server), and the resource server is structured as follows:

<img src="https://github.com/amineelkouhen/crdb-ory-sandbox/raw/main/images/fig8_interaction_flow_using_Ory_Hydra.png" alt="Interaction flow using Ory Hydra"  style="border:1px solid #eee;max-width:100%" />

The sequence diagram depicts the interactions between four key components:

- the Client
- the Resource Owner (typically the user)
- Ory Hydra
- the Resource Server (the API or service that hosts protected resources).

The flow begins when the Client (an application seeking access to protected resources) initiates a request for authorization from the Resource Owner. This typically takes the form of a redirect to a login or consent screen provided by the Authorization Server (Ory Hydra). The Resource Owner reviews the request and, upon granting access, provides an authorization grant (often an authorization code) to the client.

Next, the Client uses this authorization grant to request an access token from Ory Hydra. Along with the grant, the client also authenticates itself (using credentials such as a client ID and secret). Ory Hydra validates the authorization grant and client credentials. If everything checks out, it responds by issuing an access token to the client.

Armed with the access token, the Client then makes a request to the Resource Server, presenting the token as proof of authorization. The Resource Server validates the access token, often by introspecting it via Hydra or verifying its signature if it’s a JWT (JSON Web Token) and, if valid, serves the requested protected resource to the client.

This flow encapsulates the standard Authorization Code Grant pattern in OAuth 2.0, with Ory Hydra fulfilling the role of a secure, standards-compliant authorization server that manages token issuance, validation, and policy enforcement. It's designed to separate concerns between applications and services, enabling scalable and secure delegated access.

### Ory Kratos

Ory Kratos stores user identity records, recovery flows, sessions, and login attempts in transactional tables.

Each identity can be associated with one or more credentials, stored in the identity_credentials table. These credentials define how a user authenticates with the system, such as through a password, social login, or other mechanisms.

Ory Identities implements flows that users perform themselves as opposed to administrative intervention. Facebook and Google both provide self-service registration and profile management features as you are able to make changes to your profile and sign up yourself. Ory Identities implements the following flows:

- Registration
- Login
- Logout
- User Settings
- Account Recovery
- Address Verification
- User-Facing Error
- 2FA / MFA

Let's assume the Registration flow of Kratos. The Registration Flow for API clients doesn't use HTTP Redirects and can be summarized as follows:

<img src="https://github.com/amineelkouhen/crdb-ory-sandbox/raw/main/images/registration.png" alt="Kratos Registration"  style="border:1px solid #eee;max-width:100%" />

### Ory Keto

Ory Keto provides scalable access control as relationships (ReBAC-style authorization).

In Ory Keto, authorization is checked by evaluating whether a relation tuple exists (directly or through recursive expansion) that permits a given subject to perform a relation on an object in a namespace. This data model is designed for high scalability and flexibility, enabling complex access patterns like group membership, role inheritance, and hierarchical access rights.

A permission model is a set of rules that define which relations are checked in the database during a permission check.

Permission checks are answered based on:

The data available in CockroachDB, for example: `User:Bob is owner of Document:X`

Permission rules, for example: `All owners of a document can view it`.
When you ask Keto Permissions: is `User:Bob allowed to view on Document:X`, the system checks up how Bob could have the view permission, and then checks if Bob is owner of the `document X`. The permission model tells Ory Permissions what to check in the database.

<img src="https://github.com/amineelkouhen/crdb-ory-sandbox/raw/main/images/permission_graph.png" alt="Permission Graph"  style="border:1px solid #eee;max-width:100%" />

## Integrate with Ory

Ory services can use CockroachDB clusters as their persistent data store. Learn how to [create a joint Cockroachdb/Ory environment]({% link {{ page.version.version }}/ory-integration-guide.md %}).

<br><br><br>
