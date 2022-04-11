gcloud privateca subordinates create roach-test-node-ca \
  --pool=roach-test-node-ca-pool \
  --issuer-pool=roach-test-CA-pool \
  --subject="CN=Roach Test Node CA, O=RoachTestMegaCorp"

gcloud privateca subordinates create roach-test-client-ca \
  --pool=roach-test-client-ca-pool \
  --issuer-pool=roach-test-ca-pool \
  --subject="CN=Roach Test Client CA, O=RoachTestMegaCorp"