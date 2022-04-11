gcloud privateca certificates create \
  --issuer-pool roach-test-node-ca-pool \
  --generate-key \
  --key-output-file node1/node.key \
  --cert-output-file node1/node.crt \
  --dns-san "$node1name,localhost" \
  --ip-san "$node1addr,$ex_ip" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool roach-test-node-ca-pool \
  --generate-key \
  --key-output-file node2/node.key \
  --cert-output-file node2/node.crt \
  --dns-san "$node2name,localhost" \
  --ip-san "$node2addr,$ex_ip" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool roach-test-node-ca-pool \
  --generate-key \
  --key-output-file node3/node.key \
  --cert-output-file node3/node.crt \
  --dns-san "$node3name,localhost" \
  --ip-san "$node3addr,$ex_ip" \
  --subject "CN=node"