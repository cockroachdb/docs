---
title: CockroachDB Security Overview
summary: An overview of CockroachDB Security Features broken by Product, Cloud Serverless and Dedicated, Self-Hosted and Enterprise
toc: true
docs_area: reference.security
---
## Product Definitions

### Cloud Products

<b>CockroachDB Serverless</b> (beta) provides fast and easy access (including a *free* tier) to CockroachDB as a web service, hosted by Cockroach Labs. Clusters run in multi-tenant Google Cloud Platform (GCP) or Amazon Web Services (AWS) environments with shared compute and networking resources.

<b>CockroachDB Dedicated</b> offers a single-tenant cluster running in its own Virtual Private Cloud (VPC). Compute and networking resources are isolated. Additional security-enhancing features such as single-sign on (SSO) and SQL audit logging are available.

[Sign up for a CockroachDB Cloud account!](https://www.cockroachlabs.com/get-started-cockroachdb/)

### Self-Hosted Products

Cockroach Labs maintains <a href="https://github.com/cockroachdb/cockroach">CockroachDB as an open-source core</a>, which is available to operate under a number of different licensing options, including several free options.

<b>Self-Deployed CockroachDB</b> here refers to the situation of a user deploying and operating their own cluster.

<b>Self-Deployed CockroachDB Enterprise</b> refers to an ongoing paid license relationship with Cockroach Labs. This license unlocks advanced features (see below). In this situation the customer maintains full control over their data, compute, and network resources while benefiting from the expertise of the Cockroach Labs' Enterprise Support staff. 

- See the [list of Enterprise features](../enterprise-licensing.html)
- Read the [licensing FAQ](../licensing-faqs.html)
- [Contact our sales team](mailto:sales@cockroachlabs.com) for further questions about CockroachDB Enterprise

## Comparison of security features in CockroachDB product offerings

<table>
  <tr>
    <th width="120">Security Domain</th>
    <th>Serverless Cloud</th>
    <th>Dedicated Cloud</th>
    <th>Self-Deployed</th>
    <th>Self-Deployed Enterprise</th>
    <th>Feature</th>
  </tr>
 <tr>
   <td rowspan="4"><a href="authentication.html">Authentication</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Inter-node and node identity authentication using TLS 1.3</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Client identity authentication using username/password</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td><a href="https://openid.net/connect/">OIDC authentication</a></td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td><a href="https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol">OCSP</a> certificate revocation protocol</td>
 </tr>
 <tr>
   <td rowspan="5" ><a href="encryption.html">Encryption</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Encryption-in-flight using TLS 1.3</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Backups for AWS clusters are encrypted-at-rest using <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html">AWS S3’s server-side encryption</a></td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Backups for GCP clusters are encrypted-at-rest using <a href="https://cloud.google.com/storage/docs/encryption/default-keys">Google-managed server-side encryption keys</a></td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Industry standard encryption-at-rest provided at the infrastructure level by your chosen infrastructure-as-a-service (IAAS) provider, either Google Cloud Platform (GCP) or Amazon Web Services (AWS). See documentation for <a href="https://cloud.google.com/compute/docs/disks#pd_encryption">GCP persistent disk encryption</a> or <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html">AWS elastic block storage</a>.
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td>Cockroach Labs' proprietary storage-level encryption-at-rest service using the <a href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard">Advanced Encryption Standard (AED)</a></td>
 </tr>
 <tr>
   <td rowspan="2" ><a href="authorization.html">Authorization</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Users and privileges</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Role-based access control (RBAC)</td>
 </tr>
 <tr>
  <td rowspan="4"><a href="network-security.html">Network Security</a></td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td><a href="authentication.html"></a>SQL-level configuration allowed authentication attempts by IP address</td>
 </tr>
 <tr>
   <td>&nbsp;</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Network-level Configuration of allowed IP addresses</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td><a href="../../cockroachcloud/create-your-cluster.html#step-7-enable-vpc-peering-optional">VPC Peering</a> for GCP clusters and AWS PrivateLink for AWS clusters </td>
 </tr>
 <tr>
   <td>&nbsp;</td>
   <td>&nbsp;</td>
   <td>&nbsp;</td>
   <td>✓</td>
   <td>HTTP API access using login tokens</td>
 </tr>
 <tr>
  <td><a href="https://en.wikipedia.org/wiki/Non-repudiation">Non-Repudiation</a></td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td><a href="../sql-audit-logging.html">SQL Audit Logging</a></td>
 </tr>
 <tr>
  <td><a href="../demo-fault-tolerance-and-recovery.html">Availability/Resilience</a></td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>CockroachDB, as a disributed-from-the-ground-up SQL database, is uniquely resilient by nature. A cluster can tolerate node-failures as long as the majority of nodes remain functional. Large, well distributed clusters deployed in reliable infrastructure across multiple regions of the globe&mdash;such as those operated by Cockroach Labs, can be highly resilient even in the face of catastrophic infrastructure failures.</td>
 </tr>
</table>

!!! Fact check HTTP API access using loging tokens for self-and self-w-ent; self you could surely do this yourself; it's not a feature we offer but our tool is certainly compatible with it Same with VPC Peering. But... further question, for ent *is* it a feature, like will we do it for you?

!!! what about sql audit logging, copy above implies not available in serverless


## Understanding database security

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

Along with authentication and encryption, we also need to allow CockroachDB to restrict access to **authorized** clients (or nodes acting as clients). CockroachDB allows you to create, manage, and remove your cluster's [users](authorization.html#create-and-manage-users) and assign SQL-level [privileges](authorization.html#managing-privileges) to the users. Additionally, you can use [role-based access management (RBAC)](authorization.html#create-and-manage-users) for simplified user management.

Finally, CockroachDB's **SQL audit logging** gives you detailed information about queries being executed against your system. This feature is especially useful when you want to log all queries that are run against a table containing personally identifiable information (PII).

The following section summarizes the CockroachDB security features and provides links to detailed documentation for each feature.