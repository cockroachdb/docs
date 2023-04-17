---
title: Managing Certificate Authentication for SQL Clients in CockroachDB Dedicated Clusters
summary: procedures for managing client certificates for dedicated clusters
toc: true
docs_area: manage.security
---

SQL clients may authenticate to {{ site.data.products.dedicated }} clusters using PKI security certificates. This page describes the procedures for administering the cluster's certificate authority (CA) certificate, and for authenticating to a cluster using client certificates.

Refer to [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)](../{{site.versions["stable"]}}/security-reference/transport-layer-security.html) for an overview of PKI certificate authentication in general and its use in CockroachDB.

Refer to [Authenticating to {{ site.data.products.db }}](authentication.html) for an overview of authentication in {{ site.data.products.db }}, both at the level of the organization and at the callout

{{site.data.alerts.callout_info}}
This feature is in [**limited access**](../{{site.versions["stable"]}}/cockroachdb-feature-availability.html), and is only available to organizations that choose to opt-in. To enroll your organization, contact your Cockroach Labs account team. These features are subject to change.
{{site.data.alerts.end}}

## Uploading a certificate authority (CA) certificate for a {{ site.data.products.dedicated }} cluster
### Using the API

### Using Terraform

## Updating the certificate authority (CA) certificate for a dedicated cluster
### Using the API

### Using Terraform

## Deleting the certificate authority (CA) certificate for a dedicated cluster
### Using the API

### Using Terraform

## Authenticating a SQL client against a {{ site.data.products.dedicated }} cluster
