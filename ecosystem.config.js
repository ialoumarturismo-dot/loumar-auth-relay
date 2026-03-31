module.exports = {
  apps: [{
    name: "loumar-auth-relay",
    script: "server.js",
    cwd: "/opt/loumar-auth-relay",
    instances: 1,
    autorestart: true,
    max_memory_restart: "200M",
  }]
};
