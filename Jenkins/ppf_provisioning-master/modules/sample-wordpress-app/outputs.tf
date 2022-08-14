output "local_admin_username" {
  value = local.administrator_username
}

output "local_admin_password" {
  value = local.administrator_password
}

output "url" {
 value = "http://${module.pip.ip_address}/wordpress/wp-admin/"
}
