include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../modules/sample-microservice/db"
}

inputs = {
  instance_count = 10
  instance_type  = "m4.large"
}
