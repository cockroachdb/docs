---
title: CockroachDB Cloud Security
summary: Learn about the authentication, encryption, authorization, and audit log features for CockroachDB Cloud clusters.
toc: true
docs_area: manage
---

A {{ site.data.products.dedicated }} cluster is single-tenant (no shared machines) running in a Virtual Private Cloud (no shared network) and has data encryption-in-flight enabled by default. Additionally, {{ site.data.products.dedicated }} provides authentication, authorization, and SQL audit logging features to secure your clusters.

{{ site.data.products.serverless }} provides multi-tenant clusters running on GCP or AWS machines. They have similar encryption, authentication, and user authorization capabilities to {{ site.data.products.dedicated }}, but machines and networks are shared.

The following table summarizes the {{ site.data.products.db }} security features and provides links to detailed documentation for each feature where applicable.

<table>
  <tr>
    <th width="120">Security feature</th>
    <th>Serverless</th>
    <th>Dedicated</th>
    <th>Description</th>
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
  <td>Certificate protocol</td>
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
  <td>All data on {{ site.data.products.db }} is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in (i.e., <a href="https://cloud.google.com/compute/docs/disks#pd_encryption">persistent disk encryption</a> for GCP and <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html">EBS encryption-at-rest</a> for AWS). Because we are relying on the cloud provider's encryption implementation, we do not enable CockroachDB's <a href="../{{site.versions["stable"]}}/security-reference/encryption.html#encryption-at-rest-enterprise">internal implementation of encryption-at-rest</a>. This means that encryption will appear to be disabled in the <a href="../{{site.versions["stable"]}}/ui-overview.html">DB Console</a>, since the console is unaware of cloud provider encryption.</td>
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
   <td>&nbsp;</td>
   <td>✓</td>
   <td>IP allowlisting</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>✓</td>
  <td><a href="private-clusters.html">Private Clusters (Preview)</a></a> whose clusters nodes have no public IP addresses </td>
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
