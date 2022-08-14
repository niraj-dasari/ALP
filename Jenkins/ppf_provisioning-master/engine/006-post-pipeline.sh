for n in $(cat ../common.auto.tfvars ../deployment.auto.tfvars)
do
  export $n
done
. ../pipeline.env
cat ../pipeline.env
cd ../modules/$type
cat ui_output.json
echo "=== folder contents ==="
ls -l

if [ "$FAILED_STAGE" = "None" ]; then
    status=complete
    outputjson=$(cat ui_output.json)
else
    status=failed
    outputjson=""
fi
curl -X PUT \
      http://${apiserver}:3000/api/v1/deployments/${deploymentId}/runs/${runId} \
      -H 'Content-Type: application/json' \
      -H 'cache-control: no-cache' \
      -d "{ \"status\": \"${status}\", \"output\": ${outputjson}}"
