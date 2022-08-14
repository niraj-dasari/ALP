#!/bin/bash

#echo "Creating deployment dir..."
#./scripts/prepare-deployment-dir.sh

#export DEPLOYMENT_DIR=<>
#cd $DEPLOYMENT_DIR

#!/bin/bash
for n in $(cat ../common.auto.tfvars ../deployment.auto.tfvars)
do
  export $n
done

if [ -f ./init.sh ] ; then
	echo "Executing init.sh..."
	./init.sh
fi

if [ -f ./pre-destroy.sh ] ; then
	echo "Executing pre-deploy.sh..."
	./pre-destroy.sh
fi

echo "Running Terraform Destroy"
echo "Before : $(pwd)"
cd ../modules/$type || exit 1
echo "During Init : $(pwd)"
ls
#terraform init -backend-config="key=deployments/$type/${deploymentid}.tfstate"
terraform destroy --auto-approve 
#terragrunt destroy-all terragrunt-include-external-dependencies

if [ -f ./post-destroy.sh ] ; then
	echo "Executing post-deploy.sh..."
	./post-destroy.sh
fi
