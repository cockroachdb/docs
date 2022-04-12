gcloud privateca roots create roach-test-ca \
--pool=roach-test-CA3-pool \
--subject="CN=roach-test-ca, O=RoachTestMegaCorp"

gcloud privateca roots create roach-test-client-ca \
--pool=roach-test-client-CA3-pool \
--subject="CN=roach-test-client-ca, O=RoachTestMegaCorp"

gcloud privateca roots describe roach-test-ca --pool roach-test-CA3-pool --format json | jq -r '.pemCaCertificates[]' > certs/ca.crt
gcloud privateca roots describe roach-test-client-ca --pool roach-test-client-CA3-pool --format json | jq -r '.pemCaCertificates[]' > certs/ca-client.crt

gcloud compute scp certs/ca.crt ${node1name}:~/certs
gcloud compute scp certs/ca.crt ${node2name}:~/certs
gcloud compute scp certs/ca.crt ${node3name}:~/certs

gcloud compute scp certs/ca-client.crt ${node1name}:~/certs
gcloud compute scp certs/ca-client.crt ${node2name}:~/certs
gcloud compute scp certs/ca-client.crt ${node3name}:~/certs