---
title: Certificate Management with the Kubernetes Operator
summary: How to authenticate a secure CockroachDB cluster deployed with the Kubernetes operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page describes steps for additional procedures related to certificate management.

## Rotate security certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

* The node, client, or CA certificates are expiring soon.
* Your organization's compliance policy requires periodic certificate rotation.
* The key (for a node, client, or CA) is compromised.
* You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

### Example: Rotate certificates signed with `cockroach cert`

If you previously [authenticated with cockroach cert](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster), follow these steps to rotate the certificates using the same CA:

1. Create a new client certificate and key pair for the root user, overwriting the previous certificate and key:

    ```shell
    $ cockroach cert create-client root \
      --certs-dir=certs \
      --ca-key=my-safe-directory/ca.key \
      --overwrite
    ```

2. Upload the new client certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the Operator:

    ```shell
    $ kubectl create secret generic cockroachdb.client.root.2 \
      --from-file=tls.key=certs/client.root.key \
      --from-file=tls.crt=certs/client.root.crt \
      --from-file=ca.crt=certs/ca.crt

    secret/cockroachdb.client.root.2 created
    ```

3. Create a new certificate and key pair for your CockroachDB nodes, overwriting the previous certificate and key. Specify the namespace you used when [deploying the cluster](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster). This example uses the `cockroach-ns` namespace:

    ```shell
    $ cockroach cert create-node localhost \
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
    ```

4. Upload the new node certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the Operator:

    ```shell
    $ kubectl create secret generic cockroachdb.node.2 \
      --from-file=tls.key=certs/node.key \
      --from-file=tls.crt=certs/node.crt \
      --from-file=ca.crt=certs/ca.crt

    secret/cockroachdb.node.2 created
    ```

5. Add `cockroachdb.tls.externalCertificates.certificates.nodeClientSecretName` and `cockroachdb.tls.externalCertificates.certificates.nodeSecretName` to the values file used to [deploy the cluster](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster):

    ```yaml
    cockroachdb:
      tls:
        externalCertificates:
          enabled: true
          certificates:
            nodeClientSecretName: "cockroachdb.client.root.2"
            nodeSecretName: "cockroachdb.node.2"
    ```

6. Check that the secrets were created on the cluster:

    ```shell
    $ kubectl get secrets

    NAME                        TYPE                              DATA   AGE
    cockroachdb.client.root.2   Opaque                               3    4s
    cockroachdb.node.2          Opaque                               3    1s
    default-token-6js7b         kubernetes.io/service-account-token  3    9h
    ```

    {{site.data.alerts.callout_info}}
    Remember that `nodeSecretName` and `nodeClientSecretName` in the Operator must specify these secret names. For details, see the [deployment guide](deploy-cockroachdb-with-kubernetes-operator.html#initialize-the-cluster).
    {{site.data.alerts.end}}

7. Apply the new settings to the cluster:

    ```shell
    $ helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ```

    The pods will terminate and restart one at a time, using the new certificates. You can observe this process:

    ```shell
    $ kubectl get pods

    NAME                                  READY   STATUS        RESTARTS   AGE
    cockroach-operator-655fbf7847-lvz6x   1/1     Running         0      4h29m
    cockroachdb-0                         1/1     Running         0      4h16m
    cockroachdb-1                         1/1     Terminating     0      4h16m
    cockroachdb-2                         1/1     Running         0        43s
    ```

8. Delete the existing client secret that is no longer in use:

    ```shell
    $ kubectl delete secret cockroachdb.client.root

    secret "cockroachdb.client.root" deleted
    ```

9. Delete the existing node secret that is no longer in use:

    ```shell
    $ kubectl delete secret cockroachdb.node

    secret "cockroachdb.node" deleted
    ```

## Secure the webhooks

The Operator ships with both [mutating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook) and [validating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook) webhooks. Communication between the Kubernetes API server and the webhook service must be secured with TLS.

By default, the Operator searches for the TLS secret `cockroach-operator-certs`, which contains a CA certificate. If the secret is not found, the Operator auto-generates `cockroach-operator-certs` with a CA certificate for future runs.

The Operator then generates a one-time server certificate for the webhook server that is signed with `cockroach-operator-certs`. Finally, the CA bundle for both mutating and validating webhook configurations is patched with the CA certificate.

You can also use your own certificate authority rather than `cockroach-operator-certs`. Both the certificate and key files you generate must be PEM-encoded. See the following [example](#example-using-openssl-to-secure-the-webhooks).

### Example: Using OpenSSL to secure the webhooks

These steps demonstrate how to use the [openssl genrsa](https://www.openssl.org/docs/manmaster/man1/genrsa.html) and [openssl req](https://www.openssl.org/docs/manmaster/man1/req.html) subcommands to secure the webhooks on a running Kubernetes cluster:

1. Generate a 4096-bit RSA private key:

    ```shell
    $ openssl genrsa -out tls.key 4096
    ```

2. Generate an X.509 certificate, valid for 10 years. You will be prompted for the certificate field values.

    ```shell
    $ openssl req -x509 -new -nodes -key tls.key -sha256 -days 3650 -out tls.crt
    ```

3. Create the secret, making sure that you are in the correct namespace:

    ```shell
    $ kubectl create secret tls cockroach-operator-certs --cert=tls.crt --key=tls.key

    secret/cockroach-operator-certs created
    ```

4. Remove the certificate and key from your local environment:

    ```shell
    $ rm tls.crt tls.key
    ```

5. Roll the Operator deployment to ensure a new server certificate is generated:

    ```shell
    $ kubectl rollout restart deploy/cockroach-operator-manager

    deployment.apps/cockroach-operator-manager restarted
    ```
