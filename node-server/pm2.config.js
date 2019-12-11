module.exports = {
  apps : [{
    name      : 'CICD Demo',
    script    : './bin/www',
    node_args : '-r dotenv/config',
  }],
}