#!/bin/bash
for n in $(cat ../common.auto.tfvars ../deployment.auto.tfvars)
do
  export $n
done
#echo "Creating deployment dir..."
#./scripts/prepare-deployment-dir.sh

export DEPLOYMENT_DIR=../modules/$type

cd $DEPLOYMENT_DIR || exit 1

if [ -f ./init.sh ] ; then
	echo "Executing init.sh..."
	./init.sh
fi

if [ -f ./pre-deploy.sh ] ; then
	echo "Executing pre-deploy.sh..."
	./pre-deploy.sh
fi

#terraform plan -out=autocloud.tfplan -var-file="../../deployment.auto.tfvars" -var-file="../../common.auto.tfvars"
terraform plan -out=autocloud.tfplan
echo "#######################################################"
##terragrunt plan-all --terragrunt-non-interactive
###terragrunt apply-all --terragrunt-non-interactive
#terraform apply --auto-approve autocloud.tfplan -var-file="../../deployment.auto.tfvars" -var-file="../../common.auto.tfvars"
terraform apply --auto-approve autocloud.tfplan 
export TF_OUTPUTS=$(terraform output -json)
echo ${TF_OUTPUTS} > ui_output.json

if [ -f ./post-deploy.sh ] ; then
	echo "Executing post-deploy.sh..."
	./post-deploy.sh
fi
