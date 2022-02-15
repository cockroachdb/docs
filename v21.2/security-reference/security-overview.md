---
title: CockroachDB Security Overview
summary: An overview of CockroachDB Security Features
toc: true
docs_area: security-reference
---

## CockroachDB Security Features

The following security features are available in the current [CockroachDB release](../releases/index.html), and in all Cloud offerings.

Security Domain | Description
-------------|------------
[Authentication](authentication.html) | <ul><li>Node-node authentication using TLS 1.3</li><li>Client-node authentication using TLS 1.2/1.3 or username/password</li><li>[Fine-grained configuration of accepted authentication methods](authentication.html#authentication-configration) by user and source IP address </li></ul>
[Encryption](encryption.html) | <ul><li>Encryption in flight using TLS 1.2/1.3</li><li> Encryption at Rest using AES in counter mode (Enterprise feature)</li></ul>
[Authorization](authorization.html) | <ul><li>Users and privileges</li><li> Role-based access control</li></ul>
Non-Repudiability | [Audit logging](../sql-audit-logging.html) prevents data from being untraceably changed.
[Avaliability/Resilience](../demo-fault-tolerance-and-recovery.html) | CockroachDB is unique in being a disributed-from-the-ground-up SQL database. A cluster is considered tolerant to failure the amount of nodes that leaves the majority functional. Large, well distributed clusters deployed in reliable infrastructure across multiple regions of the globe&mdash;such as those operated by Cockroach Labs, are highly resilient even in the face of catastrophic infrastructure failures.

## Comparison of Security Features in Cockroach Cloud Serverless vs Dedicated Offerings

CockroachDB Serverless (beta) provides multi-tenant clusters running on Google Cloud Platform (GCP) or Amazon Web Services (AWS) machines. Compute and networking resources are shared.

CockroachDB Dedicated offers a single-tenant cluster running in its own Virtual Private Cloud (VPC). Compute and networking resources are isolated. Additional features such as SSO and SQL audit logging are available.

<table>
  <tr>
    <th width="120">Security Domain</th>
    <th>Serverless</th>
    <th>Dedicated</th>
    <th>Feature</th>
  </tr>
 <tr>
   <td rowspan="3"><a href="authentication.html">Authentication</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>Inter-node and node identity authentication using TLS 1.3</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>Client identity authentication using username/password</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>✓</td>
  <td><a href="https://openid.net/connect/">OIDC authentication</a></td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td><a href="https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol">OCSP</a> certificate revocation protocol</td>
 </tr>
 <tr>
   <td rowspan="4" >Encryption</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>Encryption-in-flight using TLS 1.3</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>Backups for AWS clusters are encrypted-at-rest using <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html">AWS S3’s server-side encryption</a></td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>Backups for GCP clusters are encrypted-at-rest using <a href="https://cloud.google.com/storage/docs/encryption/default-keys">Google-managed server-side encryption keys</a></td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>All data on {{ site.data.products.db }} is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in (i.e., <a href="https://cloud.google.com/compute/docs/disks#pd_encryption">persistent disk encryption</a> for GCP and <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html">EBS encryption-at-rest</a> for AWS). Because we are relying on the cloud provider's encryption implementation, we do not enable CockroachDB's <a href="../{{site.versions["stable"]}}/encryption.html#encryption-at-rest-enterprise">internal implementation of encryption-at-rest</a>. This means that encryption will appear to be disabled in the <a href="../{{site.versions["stable"]}}/ui-overview.html">DB Console</a>, since it is unaware of cloud provider encryption.</td>
 </tr>
 <tr>
   <td rowspan="2" ><a href="user-authorization.html">User Authorization</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>Users and privileges</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>Role-based access control</td>
 </tr>
 <tr>
  <td rowspan="3"><a href="network-authorization.html">Network Authorization</a></td>
  <td>✓</td>
  <td>✓</td>
  <td>SQL-level configuration of allowed IP addresses</td>
 </tr>
 <tr>
   <td>&nbsp;</td>
   <td>✓</td>
   <td>Network-level Configuration of allowed IP addresses</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>✓</td>
  <td><a href="network-authorization.html">VPC Peering</a> for GCP clusters and <a href="network-authorization.html">AWS PrivateLink</a> for AWS clusters </td>
 </tr>
 <tr>
   <td><a href="../{{site.versions["stable"]}}/cluster-api.html">Cluster API</a></td>
   <td>&nbsp;</td>
   <td>✓</td>
   <td>HTTP API access using login tokens</td>
 </tr>
</table>


## Understanding Database Security

An insecure database cluster comes with serious risks:

- Your cluster is open to any client that can access any node's IP addresses.
- Any user, even `root`, can log in without providing a password.
- Any user, connecting as `root`, can read or write any data in your cluster.
- There is no network encryption or authentication, and thus no confidentiality.

To avoid these security risks, CockroachDB provides authentication, encryption, authorization, and audit logging features to deploy secure clusters.

It all starts with the desire for two parties to communicate securely over an insecure computer network. A conventional solution to ensure secure communication is **symmetric encryption** that involves encrypting and decrypting a plaintext message using a shared key. This seems like the logical solution until you realize that you need a secure communication channel to share the encryption key. This is a Catch-22 situation: How do you establish a secure channel to share the encryption key?

An elegant solution is to use **Public Key Cryptography (PKI)** (also called **asymmetric encryption**) to establish a secure communication channel, and then sharing the symmetric encryption key over the secure channel.

Asymmetric encryption involves a pair of keys instead of a single key. The two keys are called the **public key** and the **private key**. The keys consist of very long numbers linked mathematically in a way such that a message encrypted using a public key can only be decrypted using the private key and vice versa. The message cannot be decrypted using the same key that was used to encrypt the message.

CockroachDB uses the [TLS 1.2/1.3](https://en.wikipedia.org/wiki/Transport_Layer_Security) security protocol that takes advantage of both symmetric as well as asymmetric encryption. The TLS 1.2 protocol uses asymmetric encryption to establish a secure channel as well as **authenticate** the communicating parties. It then uses symmetric encryption to protect data in flight.

However, it's not enough to protect data in flight; you also need to protect data at rest. That's where CockroachDB's **Encryption at Rest** feature comes into the picture. Encryption at Rest is an Enterprise feature that allows encryption of all files on disk using [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) in [counter mode](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Counter_(CTR)), with all key
sizes allowed.

Along with authentication and encryption, we also need to allow CockroachDB to restrict access to **authorized** clients (or nodes acting as clients). CockroachDB allows you to create, manage, and remove your cluster's [users](authorization.html#create-and-manage-users) and assign SQL-level [privileges](../authorization.html#assign-privileges) to the users. Additionally, you can use [role-based access management (RBAC)](../authorization.html#create-and-manage-roles) for simplified user management.

Finally, CockroachDB's **SQL audit logging** gives you detailed information about queries being executed against your system. This feature is especially useful when you want to log all queries that are run against a table containing personally identifiable information (PII).

The following section summarizes the CockroachDB security features and provides links to detailed documentation for each feature.