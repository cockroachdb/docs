---
title: Salted Challenge Response Authentication Mechanism (scram-sha-256)
summary: An discussion of the security and performance considerations for using scram-sha-256 in CockroachDB.
toc: true
docs_area: reference.security
---

This page provides an overview of security and performance considerations for using scram-sha-256 in CockroachDB.
As of v22.1, CockroachDB supports scram-sha-256 authentication for clients, across all releases and offerings.

## SCRAM and scram-sha-256

[Salted Challenge Response Authentication Mechanism (SCRAM)](https://en.wikipedia.org/wiki/Salted_Challenge_Response_Authentication_Mechanism) is a general solution to the problem of how to authenticate a user based on a password, without allowing potential attackers eavesdropping on the connection to steal the password or impersonate the user through [replay](https://en.wikipedia.org/wiki/Replay_attack).

scram-sha-256 is a modern, cryptographically strong implementation of SCRAM. It includes a configurable parameter, **iteration count**, which is the number of times the hashing function is performed; this allows operators to tune the cryptographic strength of the hashing to their needs by increasing the iteration count. This gives the protocol longevity, as its cryptographic strength can be increased over time, as computation becomes cheaper.

## Advantages and tradeoffs

### Protection from replay and MitM attacks

### Separation of concerns

Isolation of responsibility for un-hashed passwords (prevent credential theft and stuffing attacks).

### Offload computation cost for password hashing encryption to client

## Implementing SCRAM in your CockroachDB Cluster

### Enabling scram-sha-256 authentication for new users/roles

that one cluster settings that does this.

### Migrating existing users/roles to scram-sha-256 authentication

that one cluster settings that does this.