# Loumar Auth Relay - SSO para Ecossistema Loumar

## Descrição

Serviço de Single Sign-On (SSO) que permite aos usuários do Loumar Hub acessarem qualquer app do ecossistema com um único login. Quando um usuário autenticado no Hub clica para abrir uma app (BI, Loumind, LouFlow, etc.), o Auth Relay:

1. Valida o token JWT do Hub
2. Verifica se o usuário tem permissão para acessar aquela app
3. Cria/provisiona o usuário no Supabase da app destino (via RPC)
4. Retorna um token de sessão da app para o frontend

## Arquitetura

```
Loumar Hub (frontend)
    |
    | POST /auth/session { hub_token, app_id }
    v
Auth Relay (porta 3004) ← Este serviço
    |
    ├─ 1. Valida hub_token no Supabase Hub (masvrduahiaiowfoltlu)
    ├─ 2. Busca profile e permissões (user_platform_access)
    ├─ 3. Chama RPC hub_create_session na app destino
    └─ 4. Faz signInWithPassword na app destino
    |
    v
Retorna { access_token, refresh_token, user, app_ref }
    |
    v
Frontend redireciona com token → App destino autenticada
```

## Stack

- **Runtime**: Node.js + Express
- **Dependências**: express, cors, @supabase/supabase-js, crypto
- **Porta**: 3004
- **PM2**: Processo `loumar-auth-relay` (cluster mode)

## Apps conectadas (12 plataformas)

| App ID     | Supabase Ref            | Descrição                    |
|------------|-------------------------|------------------------------|
| loumind    | dafmslttspnbgrhyqsez    | IA/Chat Analytics            |
| louflow    | zmmcvvtwspptcocttxso     | Automação de Workflows       |
| loutv      | uegbnizlqxsquacarfgb    | TV Corporativa               |
| bi         | tovhpfkfofzrrjxrjuwq    | Business Intelligence        |
| pmo        | fyncuyebwnsefjqiifpj    | Project Management           |
| rh         | dvcmakuzchhmwcuyhqsr    | Recursos Humanos             |
| meet       | esqdjfkvihaplhvdnjuo    | Videoconferência             |
| orcamento  | vdylkdyxuzkkiujuyeyi    | Orçamentos                   |
| docs       | igdalbefrhqxruulwtsb    | Documentação                 |
| dbstudio   | qopjikfnvusaidpjzlsg    | Database Studio              |
| historico  | whhnsahboqluhuwxwsbq    | Histórico de Atendimentos    |
| loudata    | civfillqwqhtrhxzcgwi    | Data Platform                |

## Hub Central

- **URL**: https://hub.solutionprime.com.br
- **Supabase Hub**: masvrduahiaiowfoltlu.supabase.co

## Endpoints

### POST /auth/session
Cria sessão SSO em uma app.

**Request:**
```json
{
  hub_token: eyJhbG...,
  app_id: bi
}
```

**Response (200):**
```json
{
  access_token: eyJhbG...,
  refresh_token: abc123,
  expires_at: 1712345678,
  user: { id: uuid, email: user@email.com },
  app_ref: tovhpfkfofzrrjxrjuwq
}
```

**Erros:**
- 400: Missing hub_token/app_id ou app desconhecida
- 401: Token Hub inválido
- 403: Usuário sem permissão para a app
- 500: Erro no provisionamento ou sign-in

### GET /health
```json
{ status: ok, apps: 12 }
```

## Fluxo de autenticação

1. Usuário faz login no Hub (Supabase Auth)
2. Hub frontend mostra grid de apps disponíveis
3. Usuário clica numa app (ex: BI)
4. Frontend chama `POST hub.solutionprime.com.br/relay/auth/session`
5. Auth Relay valida token, verifica permissões, provisiona user na app
6. Frontend recebe token da app e redireciona

## Provisonamento de usuário

Cada app Supabase precisa ter uma RPC `hub_create_session` que:
- Cria o usuário se não existir (email + senha derivada)
- Atualiza o full_name se necessário
- Senha é derivada via SHA-256: `hash(email + _loumar_hub_2026_relay)`

## Segurança

- CORS restrito a `*.solutionprime.com.br` (não aceita `*`)
- Tokens Hub são validados contra o Supabase antes de qualquer ação
- Permissões verificadas via tabela `user_platform_access`
- Admins (`role=admin`) têm acesso a todas as apps
- Senha das apps é derivada (SHA-256), nunca armazenada em texto plano
- RELAY_SECRET usado apenas internamente

## Deploy

```bash
# Servidor: root@72.60.5.161
# Diretório: /opt/loumar-auth-relay/
pm2 restart loumar-auth-relay
```

## Criticidade

**CRÍTICA** — Se este serviço cair, NENHUM usuário consegue acessar NENHUMA app do ecossistema Loumar via SSO. Cada app fica isolada.

## Nginx (Hub)

```nginx
location /relay/ {
    proxy_pass http://172.17.0.1:3004/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```
