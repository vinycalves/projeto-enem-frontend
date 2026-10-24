# ENEM Aberto — frontend

Interface web gratuita de estudos para o ENEM. Reúne currículo por áreas e disciplinas, explicações de conceitos, questões com tentativa, discussão posterior e calendário oficial. Não inclui redação, recursos de IA ou observabilidade.

O nome de trabalho é **ENEM Aberto**. O projeto é independente e não tem vínculo com o INEP ou o Ministério da Educação.

## Visão geral

- **Angular 22** com componentes standalone, rotas e TypeScript `strict`.
- **Sem SSR**, sem bibliotecas de UI e sem fontes externas.
- **CSS puro** com a direção visual “Atlas / Caderno de Campo”: papel quente, tinta escura, verde-floresta, terracota e dourado, títulos serifados e layout editorial.
- **Sessão por cookie HttpOnly** definido pelo backend. O frontend nunca guarda token em `localStorage`.
- **Pix somente na página Sobre**, carregado do backend apenas quando a pessoa clica em “Apoiar o projeto”. A chave nunca é embutida no bundle.
- **Testes unitários com Vitest**, o runner padrão do Angular 22 (`@angular/build:unit-test`) em jsdom.
- **Docker multi-stage**: build em `node:24-alpine` e runtime em `nginx:1.29-alpine` com proxy `/api` configurável por `BACKEND_URL`.

## Pré-requisitos

- Node.js 24 (recomendado) e npm 11.
- Backend Rust/Axum disponível em `http://localhost:8081` durante o desenvolvimento.

## Desenvolvimento

```bash
cd frontend
npm install
npm start
```

A aplicação fica em `http://localhost:4200`. O `proxy.conf.json` encaminha `/api` para `http://localhost:8081` com `secure: false` e `changeOrigin: true`, e já está configurado em `angular.json` (`serve.options.proxyConfig`). Por isso o cookie de sessão funciona como same-origin também no ambiente local.

Fluxo esperado:

1. `POST /api/v1/auth/register` ou `POST /api/v1/auth/login` cria a sessão via cookie.
2. `GET /api/v1/auth/me` restaura a sessão no carregamento do app e o guard de rota protege as páginas internas.
3. `POST /api/v1/auth/logout` encerra a sessão.
4. Todas as chamadas usam `/api/v1/...`, sem URL absoluta do backend no código.

## Scripts

| Comando                     | Descrição                                            |
| --------------------------- | ---------------------------------------------------- |
| `npm start`                 | Servidor de desenvolvimento com proxy para o backend |
| `npm run build`             | Build de produção em `dist/frontend/browser`         |
| `npm test -- --watch=false` | Testes unitários uma vez, usando Vitest (Angular 22) |
| `npm run watch`             | Build em modo desenvolvimento com watch              |

O runner configurado em `angular.json` é `@angular/build:unit-test` com o runner padrão **Vitest 5**. Os testes usam `describe`/`it`/`expect`/`vi`, `HttpTestingController` para serviços e TestBed para as páginas.

Cobertura atual:

- `AuthService` — login, restauração por `/auth/me`, 401 e logout.
- `CurriculumService` — áreas, conceitos de disciplina e detalhe do conceito.
- `QuestionService` — tentativa, resposta, questões por conceito, comentário e denúncia.
- `CalendarService` e `StatsService`.
- `SupportService` — chave Pix e resposta 404.
- `LoginPage` — validação, login válido e erro 401.
- `QuestionPage` — resposta sem revelar gabarito e revelação sob demanda.
- `App` — shell básico.

## Build de produção

```bash
npm run build
```

Saída: `dist/frontend/browser`. O build usa hashing de assets e orçamentos de bundle do Angular. O CSS de cada componente tem orçamento de 8 kB (aviso) e 12 kB (erro); estilos compartilhados ficam em `src/styles.css`.

## Docker

O `Dockerfile` compila o app e copia apenas o resultado estático para o Nginx. O template em `nginx/default.conf.template` é processado pelo entrypoint oficial do Nginx: as variáveis de ambiente do container substituem `${BACKEND_URL}`, enquanto as variáveis nativas do Nginx (`$uri`, `$host`, etc.) são preservadas.

```bash
docker build -t enem-aberto-frontend .

# O valor padrão da imagem é http://backend:8080.
# Para apontar para um backend no host (Linux):
docker run --rm -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -e BACKEND_URL=http://host.docker.internal:8080 \
  enem-aberto-frontend
```

Em uma rede Docker com o backend no serviço `backend`, basta:

```bash
docker network create enem-net
docker run --rm --name backend --network enem-net seu-backend:latest
docker run --rm --network enem-net -p 8080:80 enem-aberto-frontend
```

### Variáveis

| Variável      | Padrão                | Uso                                                   |
| ------------- | --------------------- | ----------------------------------------------------- |
| `BACKEND_URL` | `http://backend:8080` | Destino do `proxy_pass` de `/api/` no container Nginx |

`BACKEND_URL` deve apontar para a raiz do backend, **sem** `/api` no final: o template encaminha `location /api/` para `${BACKEND_URL}/api/`. Em produção, o ideal é colocar este Nginx atrás de um terminator TLS para que o cookie de sessão possa ser `Secure`.

## Estrutura

```text
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── api-error.ts          # mensagens de erro da API
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.interceptor.ts   # withCredentials para /api (cookie HttpOnly)
│   │   │   ├── auth.service.ts
│   │   │   ├── calendar.service.ts
│   │   │   ├── curriculum.service.ts
│   │   │   ├── dates.ts              # contagem e formatação pt-BR
│   │   │   ├── labels.ts             # dificuldade, tipos de evento, aproveitamento
│   │   │   ├── models.ts
│   │   │   ├── question.service.ts
│   │   │   ├── stats.service.ts
│   │   │   └── support.service.ts    # Pix sob demanda
│   │   ├── features/
│   │   │   ├── about/                # pública, doação Pix opcional
│   │   │   ├── calendar/             # linha do tempo e contagem regressiva
│   │   │   ├── concept/              # explicação, pré-requisitos, questões
│   │   │   ├── home/                 # protegida
│   │   │   ├── login/                # Entrar / Criar conta
│   │   │   ├── question/             # tentativa, discussão e revelação
│   │   │   └── study/                # áreas, disciplinas e conceitos
│   │   ├── shared/
│   │   │   ├── empty-state/
│   │   │   ├── footer/
│   │   │   ├── header/
│   │   │   └── loading/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.ts / app.html / app.css
│   │   └── app.spec.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css                    # tokens e estilos globais
├── nginx/default.conf.template
├── public/favicon.svg
├── angular.json
├── proxy.conf.json
├── Dockerfile
├── .dockerignore
└── README.md
```

## Regras de produto implementadas

- **Login e cadastro** na mesma página, em abas acessíveis, com formulários reativos, validação de e-mail e senha mínima de 8 caracteres. Não há confirmação por e-mail.
- **Home protegida** com saudação, contagem para a primeira prova (08/11/2026), estatísticas, áreas do conhecimento, últimos estudos e CTA para continuar.
- **Estudar**: abas de áreas (com deep link por `?area=`), cards de disciplinas e lista de conceitos com contagem de questões. A seleção usa `?area=&subject=` para permitir voltar/atualizar sem perder contexto.
- **Conceito**: explicação, pré-requisitos quando o backend enviar o campo opcional `prerequisites`, CTA “Praticar” (prioriza a primeira questão não respondida) e lista de questões.
- **Questão**: enunciado, alternativas, tentativa, feedback de acerto/erro sem gabarito, discussão agrupada em comentários gerais e por alternativa, formulário de comentário e denúncia. O botão “Ver resposta e explicação” só fica disponível após a tentativa e busca `GET /questions/{id}/answer`; antes disso, a discussão e a resposta não são pedidas ao backend.
- **Questões oficiais**: quando o backend envia `assets` e `image_url`, o frontend exibe imagens de contexto e de alternativas, além do idioma (Inglês/Espanhol) da questão importada.
- **Provas**: arquivo oficial separado dos conceitos, com 60 provas (4 áreas × 15 anos), cards por área e página de prova com lista de questões.
- **Laboratório de Biologia**: célula 3D procedimental em Three.js (animal e vegetal), seleção de organelas, isolamento, controles de câmera e alternativa textual; mapa de taxonomia com trilha de ranks, três domínios e exemplos.
- **Calendário**: linha do tempo ordenada, datas confirmadas em destaque, itens “A definir” quando não há data, links para a fonte oficial e contagem para a primeira prova.
- **Sobre**: pública, explica o projeto gratuito, de código aberto e sem IA. A chave Pix não é buscada no carregamento e só aparece nessa página depois do clique em “Apoiar o projeto”. Também há botão de copiar.
- **Acessibilidade**: skip link, landmarks, labels, foco visível, contraste, feedback com `aria-live`, estado nunca comunicado apenas por cor, navegação por teclado nas abas e respeito a `prefers-reduced-motion`.
- **Estados**: carregamento, vazio, erro com botão de nova tentativa e mensagens de erro da API (`{ error: { code, message } }`).

## Decisões e observações

- A data da primeira prova (`2026-11-08`) está centralizada em `src/app/core/dates.ts` para home e calendário. O calendário real vem do backend.
- A API de conceito não define pré-requisitos no contrato; o frontend tipa `prerequisites` como opcional e só renderiza a seção quando o campo existe, sem inventar dados.
- A discussão e a resposta dependem de `403` antes da tentativa. O frontend evita a chamada enquanto não houver tentativa e traduz o 403 em uma mensagem clara caso o backend responda assim mesmo.
- O `accuracy` das estatísticas é apresentado como percentual tanto se o backend enviar fração (0–1) quanto percentual (0–100).
- Não há service worker, PWA, SSR, telemetria ou biblioteca de UI.

## Licença

Código aberto sob a licença MIT. Consulte o arquivo `LICENSE`.
