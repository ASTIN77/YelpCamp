module.exports = {
  apps: [{
    name: "yelpcamp",
    cwd: "/var/www/yelpcamp",
    script: "npm",
    args: "start",
    env_file: ".env",
    env: { NODE_ENV: "production", PORT: "3002" }
  }]
}
