---
title: Hashicorp Vault Integration
summary: Overview of uses cases for integrating CRDB with HashiCorp Vault
toc: true
docs_area: reference.third_party_support
---

This pages reviews the supported integrations between CockroachDB and [HashiCorp's Vault](https://www.vaultproject.io/).

Vault offers tooling to extend CockroachDB's data security capabilities. Vault provides a dedicated secrets service, which can either be self-hosted, or accessed as a software as a service (SASS) product through HashiCorp Cloud Platform (HCP).

We officially support three integrations between Vault and CockroachDB:

- [Using Vault's enterprise Key Management Secrets (KMS) Engine to manage & distribute encryption keys to AWS or GCP KMS for {{ site.data.products.dedicated }}'s customer-managed encryption key (CMEK) functionality.](#using-vault-kms-to-handle-a-cockroachdb-dedicated-cluster-cmek-store-key)
- [Using Vault's open-source Transit Secrets Engine to generate the store key for encryption at rest for a {{ site.data.products.core }} cluster.](#using-vaults-transit-secrets-engine)
- [Using Vault's open-source PKI Secrets Engine to manage the server and client certificates for a Self-hosted CockroachDB cluster.](#using-vaults-postgresql-database-secrets-engine-to-manage-cockroachdb-sql-user-credentials)

In addition, because of CockroachDB's PostgreSQL compatibility, customers can also use Vault's open-source PostgreSQL Database Secrets Engine to manage CockroachDB SQL user credentials.
	
## Using Vault KMS to handle a {{ site.data.products.dedicated }} cluster CMEK store key

{{ site.data.products.dedicated }} supports the use of customer managed encrypted keys (CMEK) for the encryption of data at rest.

[Vault's Key Management secrets engine](https://learn.hashicorp.com/tutorials/vault/key-management-secrets-engine-gcp-cloud-kms) allows customers to manage encryption keys on external key management services (KMS) such as those offered by Google Cloud Platform (GCP) or Amazon Web Services (AWS).

CockroachDB customers can integrate the services, using Vault's KMS secrets engine to handle the full lifecycle (generation, rotation, revocation) of the encryption keys that {{ site.data.products.db }} uses to protect their data.

## Using Vault's Transit Secrets Engine

{{ site.data.products.enterprise }} customers can provide their own externally managed encryption keys (CMEK) when they deploy CockroachDB. Vault's open-source [Transit Secrets Engine](https://www.vaultproject.io/docs/secrets/transit) can be used to generate appropriate encryption keys.

## Using Vault's PKI Secrets Engine to manage PKI

{{ site.data.products.core }} customers can use Vault's open-source public key infrastructure (PKI) secrets engine to manage certificates. Vault's PKI Secrets Engine greatly eases the security-critical work involved in securely maintaining a certificate authority (CA), generating, signing and distributing PKI certificates.

Using Vault to manage certificates makes it possible to use only certificates with brief validity duration, which is an important component of PKI security, particularly in the absence of a certificate revocation solution, which is not available to {{ site.data.products.db }} customers requires significant overhead in any case.

## Using Vault's PostgreSQL Database Secrets Engine to manage CockroachDB SQL user credentials

CockroachDB users can use Vault's open-source PostgreSQL Database Secrets Engine to handle the full lifecycle of SQL user credentials (creation, password rotation, deletion). Vault manages SQL user credentials as [Dynamic Secrets](https://www.vaultproject.io/use-cases/dynamic-secrets). This means that credentials are generated and issued on demand from pre-configured templates, rather than created and persisted. Credentials are issued for specific clients and for short validity durations, further minimizing both the likelihood of a credential compromise, and the possible impact of any compromise that might occur.