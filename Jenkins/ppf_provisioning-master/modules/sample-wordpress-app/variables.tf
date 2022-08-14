variable "application_name" {
  type    = string
  default = "psl"
  description = "Indicates the logical group of the resources deployed together as the 'Application' name. This is the top-level name of the resources deployed together that share a common lifecycle."
}
variable "environment_name" {
  type    = string
  default = "dev"
  description = "Indicates the lifecycle group of resources deployed for an Application. An 'Application' can have multiple instances deployed, each within a different position within the release 'lifecycle' (e.g. DEV, TEST, QA, STAGE, PROD)"
}
variable "requester" {
  type        = string
  default = "semi"
  description = "Name of the user who provisioned the resources, should be provided at the deployment"
}
variable "owner" {
  type    = string
  default = "psl_user"
  description = "Owner of the deployment"
}
variable "firewall_on" {
  type    = bool
  default = false
}
variable "deploymentid" {
  type    = string
  default = "1"
  description = "Deployment ID"
}
