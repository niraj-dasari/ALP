include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../modules/sample-microservice/javaapp"
}

inputs = {
  instance_count = 2
  instance_type  = "t3.large"
}