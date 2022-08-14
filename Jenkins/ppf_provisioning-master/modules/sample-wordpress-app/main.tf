terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 2.62.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0.1"
    }
    http = {
      source  = "hashicorp/http"
      version = "~> 2.1.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.7.2"
    }
  }
  backend "azurerm" {
    resource_group_name = "PPFAutoCloudRG"
    storage_account_name = "ppfautocloudstorage"
    container_name = "tfstate"
  }
required_version = ">= 0.13"
}

provider "azurerm" {
  features {
    key_vault {
      recover_soft_deleted_key_vaults = false
      purge_soft_delete_on_destroy    = false
    }
  }
}

# Generate a random string to keep names unique
resource "random_string" "random" {
  length  = 5
  special = false
  lower   = true
  upper   = false
}
resource "time_offset" "expire_date" {
  offset_days = 2
}
locals {
  service_name = random_string.random.result
  primary_region = {
    name   = "North Central US"
    suffix = "us-north-central"
    number = 1
  }
  secondary_region = {
    name   = "South Central US"
    suffix = "us-south-central"
    number = 2
  }
  context = {
    resource_group_name = "PPFAutoCloudRG"
    application_name = var.application_name
    environment_name = var.environment_name
    location         = local.primary_region
    tags = {
      owner       = var.owner
      added_by    = var.requester
      deployment_id = var.deploymentid
      expire_date = formatdate("DD MMM YYYY hh:mm ZZZ", time_offset.expire_date.rfc3339)
    }
  }
}

resource "null_resource" "webapp" {
 connection {
    type = "ssh"
    user = local.administrator_username
    password = local.administrator_password
    host = module.pip.ip_address
    # agent = true
  }

  provisioner "file" {
    source      = "userdata.sh"
    destination = "/tmp/userdata.sh"
  }

  provisioner "remote-exec" {
    inline = [
        "chmod +x /tmp/userdata.sh",
        "/tmp/userdata.sh args",
     
        "echo 'downloading the wp-cli from inline'",
        "wp core install --allow-root --path='/var/www/html/wordpress/' --url='${module.pip.ip_address}/wordpress/' --title='Semicolons_blog' --admin_user='${local.administrator_username}' --admin_password='${local.administrator_password}' --admin_email='dummy@abc.com'",
        
        "sudo systemctl reload apache2",
    ]
  }
}

locals {
  source_image_reference = {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  administrator_username = "psin-admin"
  administrator_password = random_string.password.result
}

# Generate a password for local admin user
resource "random_string" "password" {
  length  = 16
  special = true
  lower   = true
  upper   = true
}

# Network Interface (NIC) is an interconnection between a Virtual Machine and the underlying software network
module "nic" {

  # source = "../../../services/network/nic/base"
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//services/network/nic/base?ref=v2.62.0"

  # context                = module.resource_group.context
  context = local.context
  observability_settings = module.logging.primary

  name      = local.service_name
  subnet_id = module.subnet2.id
  public_ip_address_id = module.pip.id
}

module "vm" {

  # source = "../../../services/compute/vm/linux/base"
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//services/compute/vm/linux/base?ref=v2.62.0"

  # context                = module.resource_group.context
  context = local.context
  observability_settings = module.logging.primary

  name                  = local.service_name
  size                  = "Standard_D2s_v3"
  network_interface_ids = [module.nic.id]

  source_image_reference          = local.source_image_reference
  administrator_username          = local.administrator_username
  administrator_password          = local.administrator_password
  disable_password_authentication = false
}

locals {
  network_block = "10.0"
}

# Virtual Network
module "vnet" {

  # source = "../../../services/network/vnet/base"
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//services/network/vnet/base?ref=v2.62.0"

  # context                = module.resource_group.context
  context = local.context
  observability_settings = module.logging.primary

  name          = local.service_name
  address_space = ["${local.network_block}.0.0/16"]

}


# Subnet for the Azure Bastion Service
module "subnet1" {

  # source = "../../../services/network/subnet/bastion"
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//services/network/subnet/bastion?ref=v2.62.0"

  # context = module.resource_group.context
  context = local.context

  virtual_network_name = module.vnet.name
  address_prefixes     = ["${local.network_block}.1.0/24"]

}

module "subnet2" {

  # source = "../../../services/network/subnet/base"
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//services/network/subnet/base?ref=v2.62.0"

  # context = module.resource_group.context
  context = local.context

  name                 = "vms"
  virtual_network_name = module.vnet.name
  address_prefixes     = ["${local.network_block}.2.0/24"]

}

data "http" "myip" {
  url = "http://ipv4.icanhazip.com"
}

module "subnet2_nsg" {

  # source = "../../../services/network/nsg"
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//services/network/nsg?ref=v2.62.0"

  # context = module.resource_group.context
  context = local.context

  name  = "${local.service_name}-vms"
  rules = [{
      access                     = "Allow"
      destination_address_prefix = "*"
      destination_port_range     = 80
      direction                  = "Inbound"
      name                       = "allow-80"
      priority                   = 100
      protocol                   = "tcp"
      source_address_prefix      = "*"
      source_port_range          = "*"
      source_groups              = null
      destination_groups         = null
},
{
      access                     = "Allow"
      destination_address_prefix = "*"
      destination_port_range     = 22
      direction                  = "Inbound"
      name                       = "allow-22"
      priority                   = 101
      protocol                   = "tcp"
      # source_address_prefix      = "${chomp(data.http.myip.body)}/32"
      source_address_prefix      = "*"
      source_port_range          = "*"
      source_groups              = null
      destination_groups         = null
}
]
}

#  Connect the security group to the network interface
resource "azurerm_subnet_network_security_group_association" "subnet2_nsg" {
  subnet_id                 = module.subnet2.id
  network_security_group_id = module.subnet2_nsg.id
}

module "pip" {
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//services/network/pip/base?ref=v2.62.0"
  context                = local.context
  observability_settings = module.logging.primary
  name                   = "${local.service_name}_Public_IP"
  sku                    = "Standard"
  allocation_method      = "Static"

}

# setup isolated logging
module "logging" {

  # source = "../../shared/logging"
  source = "git::https://persistent-cloud-northamerica@dev.azure.com/persistent-cloud-northamerica/terraform-module-library/_git/azure//samples/shared/logging?ref=v2.62.0"

  application_name = var.application_name
  environment_name = var.environment_name
  service_name     = local.service_name
  primary_region   = local.primary_region
  secondary_region = local.secondary_region

  tags = local.context.tags

}
