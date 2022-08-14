include {
  path = find_in_parent_folders()
}

terraform {
  source = "github.com:foo/infrastructure-modules.git/env-2?ref=v0.0.1"
}
