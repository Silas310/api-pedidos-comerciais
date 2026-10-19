# API de Pedidos Comerciais — Plano de Projeto e Trilha de Estudos

Plano de projeto, trilha de estudos e guia de evolução técnica para construir, do zero, uma API de pedidos comerciais (estabelecimentos pedindo produtos a um distribuidor) como projeto de portfólio para vagas backend júnior.

## 1. Visão geral

### Como o projeto começa

Começamos com um monólito modular: uma única aplicação Express organizada em módulos por domínio (produtos, estabelecimentos, pedidos, autenticação), cada um com suas próprias camadas de rota, controller, service e acesso a dados. Não há filas, eventos ou serviços separados no início — essas peças só entram quando resolverem um problema real que o sistema síncrono não resolve bem.

Cada milestone deixa o sistema funcionando de ponta a ponta, mesmo que de forma simples, e adiciona uma camada de robustez ou um novo conceito por vez. Nunca fica "metade de uma feature" — cada etapa é testável e demonstrável.

### Como evolui

A ordem segue dependências reais, não "o que parece mais impressionante":

1. Dados corretos e CRUD validado (produtos, estabelecimentos).
2. A regra de negócio central (pedidos, cálculo, estoque, status).
3. Consolidação: testes e organização em camadas.
4. Integridade sob operações compostas (transações) e sob concorrência.
5. Proteção contra repetição de requisições (idempotência) — só faz sentido depois que transações e concorrência já existem, porque idempotência é sobre "o que acontece se a mesma operação correta for enviada duas vezes", e só dá pra raciocinar sobre isso quando a operação em si já é segura.
6. Segurança de acesso (quem pode fazer o quê).
7. Observabilidade — só é útil quando já existe algo real rodando para observar.
8. Docker e CI/CD — dependem de já existir uma suíte de testes para automatizar.
9. Extensões assíncronas (filas, eventos) e discussão de arquitetura distribuída — só fazem sentido quando o sistema síncrono já é sólido.

### Decisões de design resolvidas para o MVP

O enunciado original deixa algumas regras em aberto de propósito. Estas são as decisões adotadas — simples, coerentes e documentáveis no README:

- **Quando o estoque é descontado:** no momento da criação do pedido, sem etapa separada de "reserva". Um distribuidor B2B não tem "carrinho abandonado" como um e-commerce de consumidor, então um fluxo de duas fases (reservar → confirmar) adicionaria complexidade sem motivo de negócio claro agora. *(Extensão Pleno: separar reserva e confirmação, liberando estoque reservado automaticamente após um tempo.)*
- **Quais estados permitem cancelamento:** apenas `criado` e `confirmado`. Depois de `em_rota`, cancelar exigiria um processo de devolução logística, fora do escopo do MVP.
- **Transições permitidas:** `criado → confirmado → em_rota → entregue`, com `cancelado` acessível a partir de `criado` ou `confirmado`. Qualquer outra transição é rejeitada com 409.
- **Produto desativado:** não pode ser adicionado a *novos* pedidos, mas pedidos existentes continuam válidos — o preço e a descrição são copiados ("congelados") para o item do pedido no momento da criação, então o pedido não depende do estado atual do produto.
- **Restauração de estoque:** só ocorre ao cancelar a partir de `criado` ou `confirmado`. Pedidos `entregues` nunca restauram estoque.

Essas regras vão para o README (seção "Decisões técnicas") para você conseguir explicá-las em entrevista sem hesitar.

## 2. Stack recomendada

**Linguagem — JavaScript (Node.js).** Você está no módulo 6 do curso e ainda não viu TypeScript (vem na parte 9). Introduzir TS agora significaria aprender duas coisas novas ao mesmo tempo, dificultando saber de onde vêm os erros. *Alternativa:* migrar este mesmo projeto para TS depois do MVP, como milestone de refatoração — é bem avaliado no mercado e ter o protótipo pronto facilita o aprendizado incremental.

**Framework HTTP — Express.** É o que o curso já usa, então você reaproveita o que já sabe (roteamento, middleware, req/res) em vez de aprender um framework novo junto com os conceitos de backend. *Alternativa:* Fastify — mais rápido e com validação de schema embutida, mas isso é uma sintaxe nova para aprender; melhor como "segunda stack" depois.

**Banco de dados — PostgreSQL.** O domínio (produtos, estabelecimentos, pedidos, itens, estoque) é fundamentalmente relacional: há chaves estrangeiras, integridade referencial importa, e a vaga de referência pede SQL explicitamente. *Alternativa:* MongoDB — você já usou no curso, mas modelar pedidos com itens e estoque consistente em um banco de documentos exige reinventar, na aplicação, garantias que o Postgres já dá de graça.

**Acesso ao banco — Sequelize (ORM).** É exatamente o que a parte 13 do Full Stack Open ensina — quando você chegar lá, vai reconhecer os conceitos em vez de aprendê-los do zero. Tem migrations, transações e associações que mapeiam direto nas suas tabelas. *Alternativa:* Prisma — DX mais moderna e muito usado no mercado; ótimo próximo passo depois que você entender bem SQL e migrations manualmente, para apreciar o que o Prisma automatiza.

**Validação de entrada — Joi.** Validação declarativa de schema, isolando "isso tem o formato certo?" da regra de negócio (que fica no service). *Alternativa:* Zod — melhor quando migrar para TypeScript, porque infere tipos a partir do schema.

**Autenticação — JWT + bcrypt.** Você já implementou isso na parte 4 do curso, então é reaproveitar conhecimento. Autorização (quem pode fazer o quê) é tratada separadamente, como problema distinto.

**Testes — Jest + Supertest.** Jest para unitários (funções isoladas de regra de negócio) e Supertest para integração (requisições HTTP reais contra as rotas) — combinação já familiar do curso. *Alternativa:* `node:test` nativo, mais leve — considerar depois de já saber escrever bons testes.

**Documentação da API — Swagger/OpenAPI** (`swagger-jsdoc` + `swagger-ui-express`), introduzida como milestone próprio depois que as rotas já estiverem estáveis. Antes disso, uma coleção Postman/Insomnia versionada no repositório já serve como documentação funcional.

**Docker — Docker + docker-compose**, para reproduzir Postgres + aplicação sem "na minha máquina funciona". Entra no milestone de Docker/CI, não desde o início.

**CI/CD — GitHub Actions**, rodando os testes a cada push; só faz sentido depois que já existe uma suíte de testes para rodar.

## 3. Mapa de dependências entre conceitos

&#91;embedded content: mapa de dependências · núcleo + 3 ramos + 2 trilhas paralelas\]

Cada camada só entra depois que a anterior já funciona; autenticação/autorização e observabilidade correm em paralelo, bastando que o núcleo de produtos e pedidos já exista.

Autenticação/autorização e observabilidade são "ramos paralelos": não bloqueiam nem são bloqueados pelas regras de negócio centrais, mas fazem mais sentido depois que o core (produtos/pedidos) já funciona — testar autorização exige ter rotas protegidas reais para proteger.

## 4. Escopo: MVP × extensões futuras

**MVP (milestones M0–M4):**

- CRUD de produtos (nome, descrição opcional, preço, ativo/inativo, estoque)
- CRUD de estabelecimentos
- Criação de pedidos com múltiplos itens, cálculo de total no servidor, verificação e desconto de estoque
- Máquina de estados do pedido com histórico de transições
- Cancelamento com restauração de estoque conforme as regras
- Listagem com filtro por status/estabelecimento e paginação
- Testes cobrindo as regras de negócio principais
- Refatoração para camadas (controller/service/repository) e testes de integração completos

**Extensões (milestones M5 em diante — algumas podem ficar só como experimento isolado):**

- Transações atômicas e constraints de integridade
- Proteção de concorrência no estoque (lock ou update condicional)
- Idempotência na criação de pedidos
- Autenticação e autorização por papel
- Observabilidade (logs estruturados, request-id, `/health`, métricas básicas)
- Docker + CI/CD
- Fila e processamento assíncrono
- Eventos e padrão outbox para integrações
- Discussão/experimento de particionamento em serviços

## 5. Estrutura inicial de diretórios

```
pedidos-api/
├── src/
│   ├── app.js                 → monta o Express, registra middlewares e rotas (sem iniciar o servidor)
│   ├── server.js               → só chama app.listen(); separado para permitir testar a app sem abrir porta
│   ├── config/
│   │   ├── env.js              → lê e valida variáveis de ambiente, nunca lidas direto do process.env espalhado
│   │   └── database.js         → configuração da conexão Sequelize
│   ├── modules/
│   │   ├── products/
│   │   │   ├── product.model.js        → definição da tabela/entidade
│   │   │   ├── product.routes.js       → endpoints e qual controller cada um chama
│   │   │   ├── product.controller.js   → traduz request/response HTTP; sem regra de negócio
│   │   │   ├── product.service.js      → regra de negócio
│   │   │   └── product.validation.js   → schemas Joi do que a rota aceita
│   │   ├── establishments/     → mesma organização
│   │   ├── orders/
│   │   │   ├── order.model.js
│   │   │   ├── orderItem.model.js
│   │   │   ├── order.routes.js
│   │   │   ├── order.controller.js
│   │   │   ├── order.service.js        → cálculo de total, verificação de estoque, orquestra a transação
│   │   │   ├── order.statusMachine.js  → transições permitidas, isolada para ser testável sozinha
│   │   │   └── order.validation.js
│   │   └── auth/                → login, geração de JWT, hash de senha
│   ├── middleware/
│   │   ├── authenticate.js      → valida o JWT e popula req.user
│   │   ├── authorize.js         → verifica papel/permissão
│   │   └── errorHandler.js      → converte erros em respostas HTTP consistentes
│   └── utils/                   → helpers puros, sem dependência de Express
├── tests/
│   ├── unit/                    → funções isoladas (ex.: order.statusMachine)
│   └── integration/              → rotas reais com Supertest, contra um banco de teste
├── migrations/                  → histórico de mudanças no schema (Sequelize CLI)
├── docs/
│   └── openapi.yaml              → especificação OpenAPI
├── docker-compose.yml           → Postgres + app para ambiente local
├── .env.example
└── README.md
```

Separar `rotas → controller → service → model` dá uma responsabilidade por camada: a rota decide "qual URL chama o quê", o controller traduz HTTP, o service decide "isso é permitido pelas regras de negócio?", e o model é só a forma dos dados. Isso facilita testar a regra de negócio sem simular uma requisição HTTP inteira.
