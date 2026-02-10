---
title: AuthZed Overview
summary: Learn about AuthZed and TODO
toc: true
docs_area: Integrate
---

## What Is AuthZed?

[AuthZed](https://authzed.com/) is a platform focused exclusively on *authorization*. In contrast to authentication, which verifies a user's identity, authorization decides a user's access rights for resources once their identity is known. AuthZed centralizes, unifies, and scales this core security layer so developers don’t have to implement their own permission logic in every application. AuthZed provides both **managed cloud authorization services** and an **open-source authorization engine (SpiceDB)**, designed to power authorization at scale and with strong semantic flexibility.

<!-- ## What is authorization? 

Authorization answers the question, `What can a user do once they’ve successfully logged in?` Logging into a system doesn’t mean unrestricted access. Instead, authorization ensures that users can only access what’s necessary for their role. Authorization models vary in how they determine what a user can do.

Traditional role-based access systems (RBAC) were once baked directly into the application layer. Fortunately, we now have alternatives that solve authorization at scale. Modern authorization systems, such as those inspired by [Google’s Zanzibar paper](https://authzed.com/docs/spicedb/concepts/zanzibar) and implemented by projects like AuthZed, distribute authorization decisions across clusters of machines.

AuthZed is a modern authorization infrastructure platform that enables engineering teams to **stop building custom authorization stacks** and instead adopt a scalable, consistent, fine-grained access control system across any application. -->

At its core, **SpiceDB** is behind the authorization model provided by all of AuthZed's products. It is designed to be entirely agnostic to authentication solutions/identity providers. SpiceDB implements a relationship-based permissions model that supports strong consistency, global replication, and extremely high scale, processing millions of authorization requests per second for modern, distributed apps. SpiceDB is a graph engine that centrally stores authorization data (relationships, and permissions). Authorization requests (e.g., checkPermission, lookupResources) are resolved via a dispatcher that traverses the permission graph.

<img src="{{ 'images/v26.1/authzed_1.png' | relative_url }}" alt="TODO"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

AuthZed’s mission is to:

- Eliminate fragmented, application-specific authorization logic;
- Provide a **single system of record** for permissions and access policies;
- Deliver **enterprise-grade performance and consistency** across distributed environments; and
- Support complex, evolving access control requirements without rewriting code

## Why Use AuthZed?

Modern applications and distributed systems require **fine-grained, flexible, and scalable authorization**. Traditional Role-Based Access Control (RBAC) built into applications can be brittle, inconsistent, and hard to maintain at scale. You’d check a user’s role against a local table and move on. That model collapses under global scale, where:

- Users exist across multiple data regions.
- Permissions depend on dynamic relationships between entities.
- Permission evaluation requires context from several data sources.

For all these, AuthZed offers:

- **Centralized authorization** for all services and applications
- **Permission evaluation at scale** with low latency
- **Consistency guarantees** across distributed systems
- **Flexible relationship-based access control (ReBAC)** that supports complex business policies
- **Cloud-hosted or self-managed deployment options** to fit your needs

## Where can AuthZed and CockroachDB win together?

AuthZed has chosen CockroachDB as the underlying datastore for both AuthZed Dedicated and AuthZed Cloud.

In the world of authorization, uptime and resiliency are essential. CockroachDB allows AuthZed and SpiceDB deployments to survive a node, AZ, or region outage with zero downtime.

CockroachDB was built around this principle: Its serializable isolation model provides the strongest transactional consistency guarantee in SQL,  not “eventual,” not “read-committed,” but linearizable across a global cluster. That same property is what emerging authorization systems are now chasing, but for policy instead of data. That’s why SpiceDB uses CockroachDB as the underlying datastore. With this design, it gains a globally distributed, strongly consistent SQL foundation.

<img src="{{ 'images/v26.1/authzed_2.png' | relative_url }}" alt="TODO"  style="border:1px solid #eee;max-width:50%;margin:auto;display:block" />

CockroachDB’s multi-region replication and high availability ensure that authorization decisions are consistent, low-latency, and resilient across geographies. Taken together, this architecture combines SpiceDB’s flexible, API-first authorization model with CockroachDB’s fault-tolerant database platform to deliver secure, fine-grained and strongly consistent access control that scales to enterprise workloads worldwide.

Additionally, CockroachDB’s multi-active architecture allows AuthZed and SpiceDB deployments to scale writes horizontally. AuthZed has been able to scale real-world deployments to tens of thousands of writes per second.

Understanding how AuthZed structures its offerings helps clarify where CockroachDB fits in the broader authorization landscape. AuthZed focuses exclusively on authorization infrastructure (not authentication or identity management) and delivers its solutions through SpiceDB, a high-performance, relationship-based permission database inspired by Google’s Zanzibar.

SpiceDB is the core engine behind all AuthZed products, available in multiple forms depending on deployment and support needs:

- [SpiceDB (Open Source)](https://authzed.com/spicedb): The foundational, community-driven version of the authorization engine, free to use and self-hosted under the Apache 2.0 license.
- [SpiceDB Enterprise](https://authzed.com/products/spicedb-enterprise): A self-managed enterprise edition that includes audit logging, fine-grained API control, FIPS-validated cryptography, and dedicated support.
- [AuthZed Dedicated](https://authzed.com/products/authzed-dedicated): A fully managed, single-tenant SaaS offering that provides all enterprise features along with global, regionally distributed deployments and integrated APIs for permission filtering.
- [AuthZed Cloud](https://authzed.com/products/authzed-cloud): A multi-tenant managed platform designed for teams that want to start quickly without operational overhead.

Across all these tiers, CockroachDB plays a critical role as the underlying datastore. In a world where authorization, uptime and resiliency are non-negotiable, a single missed permission update can translate into security or access errors.

## AuthZed’s Offerings

AuthZed has multiple commercial offerings to address different scenarios and use cases. Besides open-source SpiceDB, AuthZed offers managed authorization infrastructure through AuthZed Dedicated and AuthZed Cloud. They also offer a self-hosted SpiceDB Enterprise tier.

<img src="{{ 'images/v26.1/authzed_3.png' | relative_url }}" alt="TODO"  style="border:1px solid #eee;max-width:80%;margin:auto;display:block" />

The following sections outline the key differences between open source SpiceDB, Self-hosted SpiceDB Enterprise, AuthZed Dedicated, and AuthZed Cloud.

### SpiceDB Open-Source

Open source SpiceDB is the foundational, community-driven version of SpiceDB. It provides the core authorization engine and all its capabilities for free, under the Apache 2.0 license.

#### Key Characteristics:

- Cost: Free
- Deployment: Self-managed (requires users to deploy, operate, and maintain the infrastructure)
- Features: Core SpiceDB functionality (schema, relationships, API for checking permissions, etc.)
- Support: Community-driven (Discord, GitHub issues)

#### Who Uses Open Source SpiceDB?

- Developers who are looking to learn more about SpiceDB
- Developers that want to build SpiceDB into a binary
- Teams that are comfortable running an authorization system with only community support

### Self-hosted SpiceDB Enterprise

Self-hosted AuthZed Enterprise is designed for large organizations with specific security, compliance, or operational requirements. It builds upon the open-source version but includes additional enterprise-grade features and support from AuthZed.

#### Key Characteristics:

- Cost: Licensing and support agreements
- Deployment: Self-hosted within the organization's own infrastructure (on-premises or cloud)
- Features:
    - All SpiceDB functionality found in open source SpiceDB
    - Audit Logging
    - Restricted API Access (fine-grained API tokens)
    - FIPS-validated cryptography
    - Cryptographically-signed releases
    - Annual penetration tests
    - Access to the security embargo program (customers are notified about vulnerabilities and given a chance to upgrade before vulnerabilities are publicly announced)
- Support: Dedicated enterprise-level support from AuthZed, including support response time SLAs. 24/7/265 support is available.

#### Who Uses Open Source SpiceDB?

- Organizations with strict compliance requirements that require them to self-host.

For those who do not wish to self-host, SpiceDB Enterprise is also available to be provisioned in AuthZed's Cloud platforms.

### AuthZed Cloud

AuthZed Cloud is for those who want to get started quickly with SpiceDB, not worry about maintenance, and are ok with a multi-tenant service that is accessed over the internet, and is missing Enterprise features.

#### Key Characteristics:

- Cost: Priced per vCPU and GiB hour
- Deployment: Multi-tenant SaaS deployment
- Features:
    - All SpiceDB functionality found in open source and enterprise SpiceDB:
    - Audit logging
    - Restricted API Access (fine-grained API tokens)
    - FIPS-validated cryptography
    - Cryptographically-signed releases
    - Annual penetration tests.
    - Access to the security embargo program (customers are notified about vulnerabilities and given a chance to upgrade before vulnerabilities are publicly announced)
- Fully managed infrastructure for authorization systems powered by SpiceDB
- Support:
    - Community support (Discord) with the option to upgrade to a paid support plan with a dedicated Customer Success Engineer

#### Who Uses Open Source SpiceDB?

- Organizations that want to move quickly with AuthZed/SpiceDB and are ok with a multi-tenant service.

### AuthZed Dedicated
AuthZed Dedicated is AuthZed’s flagship commercial offering. AuthZed Dedicated provides all the benefits of AuthZed Enterprise as a fully-managed private SaaS solution.

#### Key Characteristics

- Cost: Priced as annual commitments per vCPU and GiB
- Deployment: Private SaaS deployment
- Features:
    - All SpiceDB functionality found in open source and enterprise SpiceDB:
    - Audit logging
    - Restricted API Access (fine-grained API tokens)
    - FIPS-validated cryptography
    - Cryptographically-signed releases
    - Annual penetration tests
    - Access to the security embargo program (customers are notified about vulnerabilities and given a chance to upgrade before vulnerabilities are publicly announced)
    - Fully managed infrastructure for authorization systems powered by SpiceDB
    - Permissions Systems that can be deployed across multiple cloud regions spread across the world
    - Access to AuthZed Materialize for improved performance and APIs used to integrate permission filtering capabilities natively into other systems
- Support:
    - Standard support included. Enterprise support with a 24/7/365 response time is available.

#### Who Uses AuthZed Dedicated?

- Organizations that need an enterprise ready authorization system without the operational burden.


## Integrate with AuthZed
Learn how to [create a joint environment]({% link {{ page.version.version }}/authzed-integration-guide.md %}) where CockroachDB can serve as the source of truth for data and policy consistency by modeling a global project management app with authorization checks powered by AuthZed.

## See also

- [Integrate CockroachDB with AuthZed]({% link {{ page.version.version }}/authzed-integration-guide.md %})