---
title: Certificate Management with the CockroachDB Operator
summary: How to authenticate a secure CockroachDB cluster deployed with the CockroachDB operator.
toc: true
toc_not_nested: false
secure: true
docs_area: deploy
---

This page describes how to manage TLS certificates in a {{ site.data.products.cockroachdb-operator }} deployment. 

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

## TLS configuration options

You can either allow the operator to generate self-signed certificates, provide a custom CA certificate and generate all other certificates, or use your own certificates.

### All self-signed certificates

By default, the certificates are created automatically by a self-signer utility, which requires no configuration beyond setting a custom certificate duration if desired. This utility uses `cockroach cert` to automatically generate self-signed certificates for the nodes and root client which are stored in a secret. You can see these certificates by running `kubectl get secrets`:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl get secrets
~~~
~~~
crdb-cockroachdb-ca-secret                 Opaque                                2      23s
crdb-cockroachdb-client-secret             kubernetes.io/tls                     3      22s
crdb-cockroachdb-node-secret               kubernetes.io/tls                     3      23s
~~~

{{site.data.alerts.callout_info}}
If you are deploying on OpenShift you must also set `cockroachdb.tls.selfSigner.securityContext.enabled` to `false` to mitigate stricter security policies.
{{site.data.alerts.end}}

### Custom CA certificate 

If you wish to supply your own CA certificates to the deployed nodes but allow automatic generation of client certificates, create a Kubernetes secret with the custom CA certificate. To perform these steps using the `cockroach cert` command:

{% include_cached copy-clipboard.html %}
~~~ shell
mkdir certs
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
mkdir my-safe-directory
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

Set `cockroachdb.tls.selfSigner.caProvided` to `true` and specify the secret where the certificate is stored:

~~~ yaml
cockroachdb:
  tls:
    enabled: true
    selfSigner:
      enabled: true
      caProvided: true
      caSecret: {ca-secret-name}
~~~

{{site.data.alerts.callout_info}}
If you are deploying on OpenShift you must also set `cockroachdb.tls.selfSigner.securityContext.enabled` to `false` to mitigate stricter security policies.
{{site.data.alerts.end}}

### All custom certificates

Set up your certificates and load them into your Kubernetes cluster as secrets using the following commands:

{% include_cached copy-clipboard.html %}
~~~ shell
mkdir certs
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
mkdir my-safe-directory
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-client root --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
kubectl create secret generic cockroachdb-root --from-file=certs
~~~
~~~ shell
secret/cockroachdb-root created
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-node --certs-dir=certs --ca-key=my-safe-directory/ca.key localhost 127.0.0.1 my-release-cockroachdb-public my-release-cockroachdb-public.cockroach-ns my-release-cockroachdb-public.cockroach-ns.svc.cluster.local *.my-release-cockroachdb *.my-release-cockroachdb.cockroach-ns *.my-release-cockroachdb.cockroach-ns.svc.cluster.local
kubectl create secret generic cockroachdb-node --from-file=certs
~~~
~~~ shell
secret/cockroachdb-node created
~~~

{{site.data.alerts.callout_info}}
The subject alternative names are based on a release called `my-release` in the `cockroach-ns` namespace. Make sure they match the services created with the release during Helm install.
{{site.data.alerts.end}}

To optionally supply certificates with [cert-manager](https://cert-manager.io/), set `cockroachdb.tls.certManager.enabled` to `true`, and `cockroachdb.tls.certManager.issuer` to an IssuerRef (as they appear in certificate resources) pointing to a clusterIssuer or issuer that you have set up in the cluster:

~~~ yaml
cockroachdb:
  tls:
    enabled: true
    certManager:
      enabled: true
      caConfigMap: cockroachdb-ca
      nodeSecret: cockroachdb-node
      clientRootSecret: cockroachdb-root
      issuer:
        group: cert-manager.io
        kind: Issuer
        name: cockroachdb-cert-issuer
        clientCertDuration: 672h
        clientCertExpiryWindow: 48h
        nodeCertDuration: 8760h
        nodeCertExpiryWindow: 168h
~~~

The following Kubernetes application describes an example issuer, including the [trust manager](https://cert-manager.io/docs/trust/trust-manager/) to automatically copy the CA certificate from a secret to a ConfigMap:

~~~ yaml
apiVersion: v1
kind: Secret
metadata:
  name: cockroachdb-ca
  namespace: cockroach-ns
data:
  tls.crt: [BASE64 Encoded ca.crt]
  tls.key: [BASE64 Encoded ca.key]
type: kubernetes.io/tls
---
apiVersion: cert-manager.io/v1alpha3
kind: Issuer
metadata:
  name: cockroachdb-cert-issuer
  namespace: cockroach-ns
spec:
  ca:
    secretName: cockroachdb-ca
---
apiVersion: trust.cert-manager.io/v1alpha1
kind: Bundle
metadata:
  name: cockroachdb-ca
spec:
  sources:
    - secret:
        name: cockroachdb-ca
        key: tls.crt
  target:
    configMap:
      key: ca.crt
    namespaceSelector:
      matchLabels:
       kubernetes.io/metadata.name: cockroachdb
~~~

If your certificates are stored in TLS secrets, such as secrets generated by `cert-manager`, the secret will contain files named: `ca.crt`, `tls.crt`, and `tls.key`. For CockroachDB, rename these files as applicable to match the following naming scheme: `ca.crt`, `node.crt`, `node.key`, `client.root.crt`, and `client.root.key`.

Add the following to the values file:

~~~ yaml
cockroachdb:
  tls:
    enabled: true
    externalCertificates:
      enabled: true
      certificates:
        nodeSecretName: {node_secret_name}
        nodeClientSecretName: {client_secret_name}
~~~

Replace the following placeholder values:
- `{node_secret_name}`: The name of the Kubernetes secret that contains the generated client certificate and key.
- `{client_secret_name}`: The name of the Kubernetes secret that contains the generated node certificate and key.

#### Example: Generate and sign custom certificates using `cockroach cert`

The following example uses [cockroach cert commands]({% link {{ page.version.version }}/cockroach-cert.md %}) to generate and sign the CockroachDB node and client certificates. To learn more about the supported methods of signing certificates, refer to [Authentication]({% link {{ page.version.version }}/authentication.md %}#using-digital-certificates-with-cockroachdb).

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir certs my-safe-directory
    ~~~

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

1. Upload the client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the {{ site.data.products.cockroachdb-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.client.root \
      --from-file=tls.key=certs/client.root.key \
      --from-file=tls.crt=certs/client.root.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~
    ~~~ shell
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes, specifying the namespace you used when deploying the cluster. This example uses the `cockroach-ns` namespace:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node localhost \
      127.0.0.1 \
      cockroachdb-public \
      cockroachdb-public.cockroach-ns \
      cockroachdb-public.cockroach-ns.svc.cluster.local \
      *.cockroachdb \
      *.cockroachdb.cockroach-ns \
      *.cockroachdb.cockroach-ns.svc.cluster.local \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the {{ site.data.products.cockroachdb-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.node \
      --from-file=tls.key=certs/node.key \
      --from-file=tls.crt=certs/node.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~
    ~~~ shell
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get secrets
    ~~~
    ~~~ shell
    NAME                      TYPE                                   DATA   AGE
    cockroachdb.client.root   Opaque                                   3    13s
    cockroachdb.node          Opaque                                   3     3s
    default-token-6js7b       kubernetes.io/service-account-token      3     9h
    ~~~

1. Add `cockroachdb.tls.externalCertificates.certificates.nodeSecretName` and `cockroachdb.tls.externalCertificates.certificates.nodeClientSecretName` to the values file used to deploy the cluster:

    ~~~ yaml
    cockroachdb:
    tls:
      enabled: true
      externalCertificates:
        enabled: true
        certificates:
          nodeSecretName: cockroachdb.node
          nodeClientSecretName: cockroachdb.client.root
    ~~~

## Rotate security certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon.
- Your organization's compliance policy requires periodic certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

Certificates generated by the [self-signer utility](#all-self-signed-certificates) are re-generated by the utility when the expiry time is near. Certificates managed with [cert-manager](https://cert-manager.io/) are also automatically renewed. Whether the new certificates are generated automatically or manually, the CockroachDB pods must be restarted in order to pick up the new certificates.

### Example: Manually rotate certificates signed with `cockroach cert`

If you previously created and signed certificates with `cockroach cert`, follow these steps to manually rotate the certificates using the same CA:

1. Create a new client certificate and key pair for the root user, overwriting the previous certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-client root \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key \
      --overwrite
    ~~~

1. Upload the new client certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the {{ site.data.products.cockroachdb-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.client.root.2 \
      --from-file=tls.key=certs/client.root.key \
      --from-file=tls.crt=certs/client.root.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~
    ~~~ shell
    secret/cockroachdb.client.root.2 created
    ~~~

1. Create a new certificate and key pair for your CockroachDB nodes, overwriting the previous certificate and key. Specify the namespace you used when [deploying the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster). This example uses the `cockroach-ns` namespace:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node localhost \
      127.0.0.1 \
      cockroachdb-public \
      cockroachdb-public.cockroach-ns \
      cockroachdb-public.cockroach-ns.svc.cluster.local \
      *.cockroachdb \
      *.cockroachdb.cockroach-ns \
      *.cockroachdb.cockroach-ns.svc.cluster.local \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key \
      --overwrite
    ~~~

1. Upload the new node certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the {{ site.data.products.cockroachdb-operator }}:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic cockroachdb.node.2 \
      --from-file=tls.key=certs/node.key \
      --from-file=tls.crt=certs/node.crt \
      --from-file=ca.crt=certs/ca.crt
    ~~~
    ~~~ shell
    secret/cockroachdb.node.2 created
    ~~~

1. Add `cockroachdb.tls.externalCertificates.certificates.nodeClientSecretName` and `cockroachdb.tls.externalCertificates.certificates.nodeSecretName` to the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster):

    ~~~ yaml
    cockroachdb:
      tls:
        externalCertificates:
          enabled: true
          certificates:
            nodeClientSecretName: "cockroachdb.client.root.2"
            nodeSecretName: "cockroachdb.node.2"
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get secrets
    ~~~
    ~~~ shell
    NAME                        TYPE                              DATA   AGE
    cockroachdb.client.root.2   Opaque                               3    4s
    cockroachdb.node.2          Opaque                               3    1s
    default-token-6js7b         kubernetes.io/service-account-token  3    9h
    ~~~

    {{site.data.alerts.callout_info}}
    Remember that `nodeSecretName` and `nodeClientSecretName` in the operator configuration must specify these secret names. For details, see the [deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster).
    {{site.data.alerts.end}}

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ~~~

    The pods will terminate and restart one at a time, using the new certificates. You can observe this process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~
    ~~~ shell
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
    ~~~ shell
    secret "cockroachdb.client.root" deleted
    ~~~

1. Delete the existing node secret that is no longer in use:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete secret cockroachdb.node
    ~~~
    ~~~ shell
    secret "cockroachdb.node" deleted
    ~~~

## Secure the webhooks

The operator ships with both [mutating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook) and [validating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook) webhooks. Communication between the Kubernetes API server and the webhook service must be secured with TLS.

By default, the {{ site.data.products.cockroachdb-operator }} searches for the TLS secret `cockroach-operator-certs`, which contains a CA certificate. If the secret is not found, the operator auto-generates `cockroach-operator-certs` with a CA certificate for future runs.

The operator then generates a one-time server certificate for the webhook server that is signed with `cockroach-operator-certs`. Finally, the CA bundle for both mutating and validating webhook configurations is patched with the CA certificate.

You can also use your own certificate authority rather than `cockroach-operator-certs`. Both the certificate and key files you generate must be PEM-encoded. See the following [example](#example-using-openssl-to-secure-the-webhooks).

### Example: Using OpenSSL to secure the webhooks

These steps demonstrate how to use the [openssl genrsa](https://www.openssl.org/docs/manmaster/man1/genrsa.html) and [openssl req](https://www.openssl.org/docs/manmaster/man1/req.html) subcommands to secure the webhooks on a running Kubernetes cluster:

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

1. Create the secret, making sure that you are in the correct namespace:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret tls cockroach-operator-certs --cert=tls.crt --key=tls.key
    ~~~
    ~~~ shell
    secret/cockroach-operator-certs created
    ~~~

1. Remove the certificate and key from your local environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    rm tls.crt tls.key
    ~~~

1. Roll the operator deployment to ensure a new server certificate is generated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl rollout restart deploy/cockroach-operator-manager
    ~~~
    ~~~ shell
    deployment.apps/cockroach-operator-manager restarted
    ~~~
