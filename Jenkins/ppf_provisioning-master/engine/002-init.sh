#!/bin/bash

#source ../config.vars
#if [ $ENGINE = jenkins ]; then
#	cat export ENGINE_PIPELINE_ID=${BUILD_ID} >> ../config.vars
#fi

#if [ $ENGINE = gitlab ]; then
#	cat export ENGINE_PIPELINE_ID=${CI_PIPELINE_ID} >> ../config.vars
#fi

#if [ $ENGINE = github ]; then
#	cat export ENGINE_PIPELINE_ID=${CI_PIPELINE_ID} >> ../config.vars
#fi

#echo "Creating deployment dir..."
#./scripts/prepare-deployment-dir.sh

#echo "Create common tags..."
#./scripts/create-tags.sh
pwd
ls ../
for n in $(cat ../common.auto.tfvars ../deployment.auto.tfvars)
do
  export $n
done
echo ${PPF_BUILD_ID}
cd ../modules/$type || exit 1
terraform init -backend-config="key=deployments/$type/${deploymentid}.tfstate"
