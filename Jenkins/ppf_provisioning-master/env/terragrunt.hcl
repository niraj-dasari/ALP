locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  # Extract the variables we need for easy access
  account_name = local.account_vars.locals.account_name
  account_id   = local.account_vars.locals.aws_account_id
  aws_region   = local.region_vars.locals.aws_region
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"
  allowed_account_ids = ["${local.account_id}"]
}
EOF
}

remote_state {
  backend = "s3"
  
  # Terragrunt built-in function: 
  # generates the Terraform code for configuring the backend
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  
  # Terragrunt built-in function: 
  # sets key relative to the modules
  config = {
    bucket         = "ppf-terraform-state-bucket-${local.account_name}-${local.aws_region}"
    key            = "$path_relative_to_include()/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "ppf-tfstate-lock"
  }
}

terraform {
  extra_arguments "common_vars" {
    commands = get_terraform_commands_that_need_vars()

    arguments = [
      "-var-file=../common.tfvars",
    ]
  }
}

inputs = merge(
  local.account_vars.locals,
  local.region_vars.locals,
)
