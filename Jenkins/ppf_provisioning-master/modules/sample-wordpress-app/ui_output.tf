data "template_file" "ui_output" {
  template = file("${path.module}/ui_output.json")
  vars     = {
    host = "${module.pip.ip_address}"
    username = "${local.administrator_username}"
    password = "${local.administrator_password}"
    
  }
}

output "ui_output" {
  value = data.template_file.ui_output.rendered
}