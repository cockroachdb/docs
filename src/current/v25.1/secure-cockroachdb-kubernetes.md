---
title: Certificate Management
summary: How to authenticate a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB securely on a single Kubernetes cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}) using the Operator or Helm. However, it's possible to configure these settings before starting CockroachDB on Kubernetes.
{{site.data.alerts.end}}

By default, self-signed certificates are used when using the Operator or Helm to securely [deploy CockroachDB on Kubernetes]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}). However, the recommended approach is to use `cert-manager` for certificate management. For details, refer to [Deploy cert-manager for mTLS](?filters=helm#deploy-cert-manager-for-mtls).

This page explains how to:

- Authenticate an Operator or Helm deployment using a [custom CA](#use-a-custom-ca)
- [Rotate security certificates](#rotate-security-certificates)
- [Secure the webhooks](#secure-the-webhooks) (Operator)

{{site.data.alerts.callout_danger}}
If you are running a secure Helm deployment on Kubernetes 1.22 and later, you must migrate away from using the Kubernetes CA for cluster authentication. The recommended approach is to use `cert-manager` for certificate management. For details, refer to [Deploy cert-manager for mTLS](?filters=helm#deploy-cert-manager-for-mtls).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="operator">Operator</button>
  <button class="filter-button" data-scope="helm">Helm</button>
</div>

{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}

## Use a custom CA

<section class="filter-content" markdown="1" data-scope="operator">
By default, the Operator will generate and sign 1 client and 1 node certificate to secure the cluster.

To use your own certificate authority instead, add the following to the Operator's custom resource **before** [initializing the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#initialize-the-cluster):

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  nodeTLSSecret: {node_secret_name}
  clientTLSSecret: {client_secret_name}
~~~

Replace:

- `{node_secret_name}`: The name of the Kubernetes secret that contains the generated node certificate and key.
- `{client_secret_name}`: The name of the Kubernetes secret that contains the generated client certificate and key.

{{site.data.alerts.callout_info}}
Currently, the Operator requires that the client and node secrets each contain the filenames `tls.crt` and `tls.key`.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/apply-custom-resource.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
By default on secure deployments, the Helm chart will generate and sign one client certificate and one node certificate to secure the cluster.

To use your own certificate authority instead, specify the following in the custom values file you created when [deploying the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}?filters=helm#step-2-start-cockroachdb):

{% include_cached copy-clipboard.html %}
~~~ yaml
tls:
  enabled: true
  certs:
  provided: true
  nodeSecret: {node_secret_name}
  clientRootSecret: {client_secret_name}
~~~

Replace:

- `{node_secret_name}`: The name of the Kubernetes secret that contains the generated node certificate and key.
- `{client_secret_name}`: The name of the Kubernetes secret that contains the generated client certificate and key.

{% include {{ page.version.version }}/orchestration/apply-helm-values.md %}
</section>

### Example: Authenticate with `cockroach cert`

{{site.data.alerts.callout_info}}
This example uses [`cockroach cert` commands]({% link {{ page.version.version }}/cockroach-cert.md %}) to generate and sign the CockroachDB node and client certificates. To learn more about the supported methods of signing certificates, refer to [Authentication]({% link {{ page.version.version }}/authentication.md %}#using-digital-certificates-with-cockroachdb).
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
{{site.data.alerts.callout_info}}
Complete the following steps **before** [initializing the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#initialize-the-cluster).
{{site.data.alerts.end}}

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-ca \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-client root \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.client.root \
      --from-file=tls.key=certs/client.root.key \
      --from-file=tls.crt=certs/client.root.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes, specifying the namespace you used when [deploying the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#initialize-the-cluster). This example uses the Operator's default namespace (`cockroach-operator-system`):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node localhost \
      127.0.0.1 \
      cockroachdb-public \
      cockroachdb-public.cockroach-operator-system \
      cockroachdb-public.cockroach-operator-system.svc.cluster.local \
      *.cockroachdb \
      *.cockroachdb.cockroach-operator-system \
      *.cockroachdb.cockroach-operator-system.svc.cluster.local \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.node \
      --from-file=tls.key=certs/node.key \
      --from-file=tls.crt=certs/node.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                   DATA   AGE
    cockroachdb.client.root   Opaque                                   3    13s
    cockroachdb.node          Opaque                                   3     3s
    default-token-6js7b       kubernetes.io/service-account-token      3     9h
    ~~~

1. Add `nodeTLSSecret` and `clientTLSSecret` to the Operator's [custom resource]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#initialize-the-cluster), specifying the generated secret names:

    ~~~ yaml
    spec:
      clientTLSSecret: cockroachdb.client.root
      nodeTLSSecret: cockroachdb.node
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-ca \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-client root \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.client.root --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node localhost \
      127.0.0.1 \
      my-release-cockroachdb-public \
      my-release-cockroachdb-public.default \
      my-release-cockroachdb-public.default.svc.cluster.local \
      *.my-release-cockroachdb \
      *.my-release-cockroachdb.default \
      *.my-release-cockroachdb.default.svc.cluster.local \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

    {{site.data.alerts.callout_info}}
    This example assumes that you followed our [deployment example]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}?filters=helm), which uses `my-release` as the release name. If you used a different value, be sure to adjust the release name in this command.
    {{site.data.alerts.end}}

1. Upload the node certificate and key to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.node --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                               DATA   AGE
    cockroachdb.client.root   Opaque                                3   41m
    cockroachdb.node          Opaque                                5   14s
    default-token-6qjdb       kubernetes.io/service-account-token   3    4m
    ~~~

1. Specify the following in the custom values file you created when [deploying the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}?filters=helm#step-2-start-cockroachdb), using the generated secret names:

    {% include_cached copy-clipboard.html %}
    ~~~
    tls:
      enabled: true
      certs:
      provided: true
      clientRootSecret: cockroachdb.client.root
      nodeSecret: cockroachdb.node
    ~~~

1. Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

	{% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
    ~~~
</section>

## Rotate security certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon.
- Your organization's compliance policy requires periodic certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

### Example: Rotate certificates signed with `cockroach cert`

<section class="filter-content" markdown="1" data-scope="operator">
If you previously [authenticated with `cockroach cert`](#example-authenticate-with-cockroach-cert), follow these steps to rotate the certificates using the same CA:

1. Create a new client certificate and key pair for the root user, overwriting the previous certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-client root \
        --certs-dir=certs \
        --ca-key=my-safe-directory/ca.key \
        --overwrite
    ~~~

1. Upload the new client certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.client.root.2 \
      --from-file=tls.key=certs/client.root.key \
      --from-file=tls.crt=certs/client.root.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root.2 created
    ~~~

1. Create a new certificate and key pair for your CockroachDB nodes, overwriting the previous certificate and key. Specify the namespace you used when [deploying the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#initialize-the-cluster). This example uses the Operator's default namespace (`cockroach-operator-system`):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node localhost \
      127.0.0.1 \
      cockroachdb-public \
      cockroachdb-public.cockroach-operator-system \
      cockroachdb-public.cockroach-operator-system.svc.cluster.local \
      *.cockroachdb \
      *.cockroachdb.cockroach-operator-system \
      *.cockroachdb.cockroach-operator-system.svc.cluster.local \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key \
      --overwrite
    ~~~

1. Upload the new node certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.node.2 \
      --from-file=tls.key=certs/node.key \
      --from-file=tls.crt=certs/node.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node.2 created
    ~~~

1. Add `nodeTLSSecret` and `clientTLSSecret` to the Operator's [custom resource]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#initialize-the-cluster), specifying the new secret names:

    ~~~ yaml
    spec:
      clientTLSSecret: cockroachdb.client.root.2
      nodeTLSSecret: cockroachdb.node.2
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get secrets
    ~~~

    ~~~
    NAME                        TYPE                              DATA   AGE
    cockroachdb.client.root.2   Opaque                               3    4s
    cockroachdb.node.2          Opaque                               3    1s
    default-token-6js7b         kubernetes.io/service-account-token  3    9h
    ~~~

    {{site.data.alerts.callout_info}}
    Remember that `nodeTLSSecret` and `clientTLSSecret` in the Operator's [custom resource]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#initialize-the-cluster) must specify these secret names. For details, see [Use a custom CA](#use-a-custom-ca).
    {{site.data.alerts.end}}

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f example.yaml
    ~~~

    The pods will terminate and restart one at a time, using the new certificates.

1. You can observe this process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS        RESTARTS   AGE
    cockroach-operator-655fbf7847-lvz6x   1/1     Running         0      4h29m
    cockroachdb-0                         1/1     Running         0      4h16m
    cockroachdb-1                         1/1     Terminating     0      4h16m
    cockroachdb-2                         1/1     Running         0        43s
    ~~~

1. Delete the existing client secret that is no longer in use:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete secret cockroachdb.client.root
    ~~~

    ~~~
    secret "cockroachdb.client.root" deleted
    ~~~

1. Delete the existing node secret that is no longer in use:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete secret cockroachdb.node
    ~~~

    ~~~
    secret "cockroachdb.node" deleted
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
The Helm chart includes [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml) to configure a Kubernetes [cron job](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/) that regularly rotates certificates before they expire.

If you previously [authenticated with `cockroach cert`](#example-authenticate-with-cockroach-cert), follow these steps to ensure the certificates are rotated:

1. Upload the CA certificate that you previously created to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.ca \
      --from-file=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.ca created
    ~~~

1. Specify the following in the custom values file you created when [deploying the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}?filters=helm#step-2-start-cockroachdb), using the generated secret name:

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    selfSigner:
      enabled: true
      caProvided: true
      caSecret: cockroachdb.ca
      rotateCerts: true
    ~~~

    {{site.data.alerts.callout_info}}
    `selfSigner.enabled` and `selfSigner.rotateCerts` are `true` by default in the Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml).
    {{site.data.alerts.end}}

1. Customize the following `selfSigner` fields to set the frequency of certificate rotation. These should correspond to the durations of the CA, client, and node certificates.

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    selfSigner:
    minimumCertDuration: 624h
    caCertDuration: 43800h
    caCertExpiryWindow: 648h
    clientCertDuration: 672h
    clientCertExpiryWindow: 48h
    nodeCertDuration: 8760h
    nodeCertExpiryWindow: 168h
    ~~~

    <ul>
      <li><code>caCertDuration</code>, <code>clientCertDuration</code>, and <code>nodeCertDuration</code> specify the duration in hours of the CA, client, and node certificates, respectively.</li>
      <li><code>caCertExpiryWindow</code>, <code>clientCertExpiryWindow</code>, and <code>nodeCertExpiryWindow</code> specify the timeframe in hours during which the CA, client, and node certificates, respectively, should be rotated before they expire.</li>
      <li><code>minimumCertDuration</code> specifies the minimum duration in hours for all certificates. This is to ensure that the client and node certificates are rotated within the duration of the CA certificate. This value must be less than:
      <ul><li><code>cacertExpiryWindow</code></li><li>The difference of <code>clientCertDuration</code> and <code>clientExpiryWindow</code></li><li>The difference of <code>nodeCertDuration</code> and <code>nodeCertExpiryWindow</code></li></ul></li>
    </ul>

    Certificate duration is configured when running [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %}#general). You can check the expiration dates of the `cockroach cert` certificates by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert list --certs-dir=certs
    ~~~

    For each certificate, the output includes its certificate file and expiration, the key file for node and client certificates, a **Notes** column with additional details, and an **Errors** column that is empty unless there is an error.

1. Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
    ~~~

    The certificates will be rotated during the specified expiry windows.

## Deploy `cert-manager` for mTLS

Cockroach Labs recommends using `cert-manager` to sign certificates for cluster authentication. `cert-manager` manages certificates and certificate issuers as resource types in Kubernetes clusters, to simplify the process of obtaining, renewing and using those certificates.

{{site.data.alerts.callout_info}}
Previously, the Helm chart used a self-signer for cluster authentication. This approach is no longer recommended.
{{site.data.alerts.end}}

1. Install a [supported version of `cert-manger`](https://cert-manager.io/docs/releases/). For a new cluster, Cockroach Labs recommends using the latest supported version. Refer to installed you will find it [`cert-manager` Installation](https://cert-manager.io/docs/installation/) in the `cert-manager` project's documentation.

1. Create a file named `issuer.yaml` that configures an `Issuer`, which represents a certificate authority that can sign certificates. This example creates an issuer that can sign self-signed CA certificates. To customize your issuer, refer to [Issuer Configuration](https://cert-manager.io/docs/configuration/) in the `cert-manager` project's documentation.

    {% include_cached copy-clipboard.html %}
    ~~~yaml
    apiVersion: cert-manager.io/v1
    kind: Issuer
    metadata:
    name: cockroachdb
    spec:
    selfSigned: {% raw %}{}{% endraw %}
    ~~~

1. Use `kubectl apply` to create the issuer from the YAML file:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    kubectl apply -f issuer.yaml
    ~~~

1. Enable and configure `cert-manager` in the Helm chart's `values.yaml` file. The following options are required. For more options, refer to [`cert-manager`](https://github.com/cockroachdb/helm-charts/tree/master/cockroachdb#cert-manager) in the CockroachDB Helm chart documentation.

    {% include_cached copy-clipboard.html %}
    ~~~yaml
    tls.certs.selfSigner.enabled: false
    tls.certs.certManager: true
    tls.certs.certManagerIssuer.kind: Issuer
    tls.certs.certManagerIssuer.name: cockroachdb
    ~~~

    <ul><li>To disable signing self-signed certificates, set <code>tls.certs.selfSigner.enabled</code> to <code>false</code>.</li><li>Set <code>tls.certs.certManagerIssuer.kind</code> to either <code>Issuer</code> or <code>ClusterIssuer</code>. To get started, <code>Issuer</code> is recommended. <code>ClusterIssuer</code> is cluster-scoped; when referencing a secret via the <code>secretName</code> field, only secrets in the <code>cluster-resource</code> namespace (<code>cert-manager</code> by default) are searched. To learn more, refer to <a href="https://cert-manager.io/v1.6-docs/faq/cluster-resource/">Cluster Resource Namespace</a> in the <code>cert-manager</code> project's documentation.</li><li>Set <code>certManagerIssuer.name</code> to the name of the issuer you created in the previous step.</li></ul>

1. Apply the updated Helm chart:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    helm install my-release --values values.yaml cockroachdb/cockroachdb
    ~~~

    Replace `values.yaml` with the name of your Helm chart's values file.

</section>

<section class="filter-content" markdown="1" data-scope="operator">

##  Secure the webhooks

The Operator ships with both [mutating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook) and [validating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook) webhooks. Communication between the Kubernetes API server and the webhook service must be secured with TLS.

By default, the Operator searches for the TLS secret `cockroach-operator-webhook-ca`, which contains a CA certificate. If the secret is not found, the Operator auto-generates `cockroach-operator-webhook-ca` with a CA certificate for future runs.

The Operator then generates a one-time server certificate for the webhook server that is signed with `cockroach-operator-webhook-ca`. Finally, the CA bundle for both mutating and validating webhook configurations is patched with the CA certificate.

You can also use your own certificate authority rather than `cockroach-operator-webhook-ca`. Both the certificate and key files you generate must be PEM-encoded. See the following [example](#example-using-openssl-to-secure-the-webhooks).

### Example: Using OpenSSL to secure the webhooks

These steps demonstrate how to use the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) and [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) subcommands to secure the webhooks on a running Kubernetes cluster:

1. Generate a 4096-bit RSA private key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    openssl genrsa -out tls.key 4096
    ~~~

1. Generate an X.509 certificate, valid for 10 years. You will be prompted for the certificate field values.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    openssl req -x509 -new -nodes -key tls.key -sha256 -days 3650 -out tls.crt
    ~~~

1. Create the secret, making sure that [you are in the correct namespace]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#install-the-operator):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret tls cockroach-operator-webhook-ca --cert=tls.crt --key=tls.key
    ~~~

    ~~~
    secret/cockroach-operator-webhook-ca created
    ~~~

1. Remove the certificate and key from your local environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    rm tls.crt tls.key
    ~~~

1. Roll the Operator deployment to ensure a new server certificate is generated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl rollout restart deploy/cockroach-operator-manager
    ~~~

    ~~~
    deployment.apps/cockroach-operator-manager restarted
    ~~~
</section>
