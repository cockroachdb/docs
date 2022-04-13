gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${node1name}/node.key" \
  --cert-output-file "${node1name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node1name},localhost" \
  --ip-san "${node1addr},${ex_ip}" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${node2name}/node.key" \
  --cert-output-file "${node2name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node2name},localhost" \
  --ip-san "${node2addr},${ex_ip}" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${node3name}/node.key" \
  --cert-output-file "${node3name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node3name},localhost" \
  --ip-san "${node3addr},${ex_ip}" \
  --subject "CN=node"