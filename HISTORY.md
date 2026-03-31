# Loumar Hub - Auth Relay History

## 2026-03-13 - SSO v2 Completo

### O que foi feito:
1. Corrigido syntax error no server.js (\! → !)
2. Auth Relay online em PM2 (porta 3004), proxied via Nginx em hub.solutionprime.com.br/relay/
3. Auth-guard v2 injetado em todas as 12 apps - faz token exchange automatico
4. Funcao hub_create_session criada/atualizada em 11 projetos Supabase (trata users existentes)
5. RLS do Hub corrigida com funcao is_admin() SECURITY DEFINER
6. Hub deployed em /var/www/apps/hub/ com React + Vite + Tailwind + Supabase

### Estado atual:
- SSO funcionando em 11/12 apps (loumind pendente - conta pessoal Supabase)
- PM2 salvo com loumar-auth-relay e loumar-sdr
- Cron fix_traefik_cron.py ativo para manter routers
- Nginx config em /var/www/apps/nginx.conf com proxy /relay/ para porta 3004

### Pendencias:
- Criar hub_create_session no Supabase do loumind (dafmslttspnbgrhyqsez) - projeto em conta pessoal
- GitHub repo para loumar-hub (em andamento)

### Arquivos importantes:
- /var/www/loumar-auth-relay/server.js - Auth Relay
- /var/www/loumar-auth-relay/ecosystem.config.js - PM2 config
- /var/www/apps/nginx.conf - Nginx config (13 server blocks + relay proxy)
- /var/www/apps/hub/ - Hub static files
- /opt/fix_traefik_cron.py - Cron para manter Traefik routers

### Credenciais:
- Hub Admin: admin@loumarturismo.com.br / LoumarHub2026!
- Hub Supabase: masvrduahiaiowfoltlu
- Relay Secret: LmHub2026_R3lay_S3cret!
