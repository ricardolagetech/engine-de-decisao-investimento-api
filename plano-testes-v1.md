# Plano e Estratégia de Testes
**Baseado na ISO 29119-3**

| Campo | Valor |
|-------|-------|
| Versão | 1.0 — Back-end |
| Projeto | engine-de-decisao-investimento-api |
| Responsável | Ricardo Lage |
| Data | 22/05/2026 |
| Escopo | API REST back-end (10 endpoints, 12 User Stories) |
| Observação | Front-end será coberto no Plano v2, após implementação |

---

## 1. Épico e Estimativa Geral de Esforço em Testes

**Épico:** RFDOI-1 — Engine de Decisão de Investimento em Renda Fixa

**Descrição do sistema sob teste:**
Sistema de comparação e simulação de investimentos em renda fixa (CDB, LCI, LCA), com autenticação de usuários via JWT, configuração personalizada de taxa CDI, motor de cálculo financeiro com IR regressivo por prazo, ranking por retorno líquido anualizado (CAGR) e histórico de simulações salvas. API REST desenvolvida em Node.js v22 / Express 5 com banco de dados SQLite gerenciado pelo Prisma 5.

**Estratégia geral de testes:**

| Camada | Ferramenta | Foco |
|--------|-----------|------|
| Unitário (U) | Jest | Motor de cálculo financeiro em `simulation.service.js`: fórmulas, bordas de IR, CAGR, empates |
| Integração (I) | Supertest + banco SQLite de teste isolado | Todos os endpoints: autenticação, CDI, simulações, histórico, exclusão |
| Exploratório (E) | Manual (charters) | Fluxos críticos de negócio, segurança, comportamentos limítrofes |
| Performance (P) | k6 | Carga nos endpoints mais pesados: /comparar, /historico, /login |

**Estimativa total de esforço: 110 horas**

| Componente | Esforço |
|-----------|---------|
| 12 User Stories (design + implementação + execução dos testes automatizados) | 84h |
| Testes de performance com k6 | 8h |
| Execução das missões de teste exploratório | 8h |
| Setup do ambiente de testes (jest.config, banco isolado, factories) | 6h |
| Mapeamento e criação de dados de teste (fixtures) | 4h |
| **Total** | **110h** |

---

## 2. User Stories e Estimativa de Esforço em Testes

O esforço por US inclui: design das condições de teste, implementação dos testes automatizados (Jest + Supertest) e execução/validação dos resultados.

| Código | Descrição | Esforço |
|--------|-----------|---------|
| RFDOI-2 | US-01: Cadastro de Usuário | 6h |
| RFDOI-3 | US-02: Login de Usuário | 6h |
| RFDOI-4 | US-03: Logout de Usuário | 4h |
| RFDOI-5 | US-04: Configurar Taxa CDI | 6h |
| RFDOI-6 | US-05: Simular Investimento em CDB | 12h |
| RFDOI-7 | US-06: Simular Investimento em LCI | 8h |
| RFDOI-8 | US-07: Simular Investimento em LCA | 8h |
| RFDOI-9 | US-08: Comparar Múltiplos Investimentos | 12h |
| RFDOI-10 | US-09: Identificar Melhor Investimento | 6h |
| RFDOI-11 | US-10: Salvar Simulação | 4h |
| RFDOI-12 | US-11: Consultar Histórico de Simulações | 8h |
| RFDOI-13 | US-12: Excluir Simulação Salva | 4h |
| — | Performance (k6) | 8h |
| — | Exploratório (missões) | 8h |
| — | Setup de ambiente e dados de teste | 10h |
| **TOTAL** | | **110h** |

---

## 3. Condições de Teste e Camadas

**Legenda de camadas:**
- **U** = Unitário (Jest — testa funções/serviços isoladamente)
- **I** = Integração (Supertest — testa o endpoint com banco SQLite de teste)
- **E** = Exploratório (manual, guiado por charter)
- **P** = Performance (k6)

---

### RFDOI-2: US-01 — Cadastro de Usuário

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-01-001 | Registrar com nome, email válido e senha de exatamente 8 caracteres | 201 Created + body com id, nome, email; campo senha ausente na resposta | I |
| TC-01-002 | Registrar com senha com mais de 8 caracteres | 201 Created | I |
| TC-01-003 | Registrar com senha de 7 caracteres (abaixo do mínimo) | 400 Bad Request com mensagem sobre tamanho mínimo da senha | U, I |
| TC-01-004 | Registrar com email já cadastrado em outro usuário | 409 Conflict | I |
| TC-01-005 | Registrar sem o campo nome no body | 400 Bad Request | I |
| TC-01-006 | Registrar sem o campo email no body | 400 Bad Request | I |
| TC-01-007 | Registrar sem o campo senha no body | 400 Bad Request | I |
| TC-01-008 | Registrar com body completamente vazio | 400 Bad Request | I |
| TC-01-009 | Verificar que a senha é armazenada como hash bcrypt (não em texto claro) | Campo senha no banco é hash bcrypt com 60 caracteres e prefixo $2b$ | U |

---

### RFDOI-3: US-02 — Login de Usuário

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-02-001 | Login com email e senha corretos de usuário existente | 200 OK + campo token com JWT válido na resposta | I |
| TC-02-002 | Login com email não cadastrado no sistema | 401 Unauthorized | I |
| TC-02-003 | Login com email correto, mas senha incorreta | 401 Unauthorized | I |
| TC-02-004 | Login sem campo email no body | 400 Bad Request | I |
| TC-02-005 | Login sem campo senha no body | 400 Bad Request | I |
| TC-02-006 | Token JWT retornado tem expiração de 8 horas | Payload JWT decodificado: exp = iat + 28800 segundos | U |
| TC-02-007 | Token JWT retornado contém userId e email no payload | Payload decodificado contém id e email do usuário autenticado | U |

---

### RFDOI-4: US-03 — Logout de Usuário

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-03-001 | Logout com token JWT válido no header Authorization | 200 OK; token adicionado à blacklist em memória | I |
| TC-03-002 | Usar o mesmo token em requisição autenticada após logout bem-sucedido | 401 Unauthorized (token na blacklist) | I |
| TC-03-003 | Logout sem header Authorization | 401 Unauthorized | I |
| TC-03-004 | Logout com token JWT sintaticamente malformado | 401 Unauthorized | I |
| TC-03-005 | Logout com token JWT com assinatura expirada | 401 Unauthorized | I |

---

### RFDOI-5: US-04 — Configurar Taxa CDI

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-04-001 | POST /cdi com valor 10.75 e token JWT válido | 201 Created + registro de TaxaCDI salvo no banco vinculado ao userId | I |
| TC-04-002 | POST /cdi sem token de autenticação | 401 Unauthorized | I |
| TC-04-003 | GET /cdi com CDI previamente configurado para o usuário | 200 OK + valor mais recente do CDI do usuário | I |
| TC-04-004 | GET /cdi com token válido, mas sem CDI cadastrado para o usuário | 404 Not Found | I |
| TC-04-005 | GET /cdi sem token (optionalAuth) — sem CDI global configurado | 404 Not Found (sem userId, sem CDI) | I |
| TC-04-006 | POST /cdi múltiplas vezes com valores diferentes pelo mesmo usuário | GET /cdi retorna o valor da entrada mais recente (maior dataVigencia) | I |
| TC-04-007 | Dois usuários com CDI configurados com valores diferentes — cada um consulta o seu | Usuário A obtém CDI de A; Usuário B obtém CDI de B (isolamento correto) | I |

---

### RFDOI-6: US-05 — Simular Investimento em CDB

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-05-001 | CDB POS_FIXADO: percentualCDI=110, cdi=10.75 no body, prazo > 180 dias | 200 OK + resultadoBruto, ir, resultadoLiquido, aliquotaIR, percentualGanhoLiquidoAnual | I |
| TC-05-002 | CDB PREFIXADO: taxaAnual=12.5 (campo cdi não necessário) | 200 OK; cálculo com taxa fixa; ir e aliquotaIR presentes e corretos | I |
| TC-05-003 | CDB POS_FIXADO sem campo cdi no body | 400 Bad Request | I |
| TC-05-004 | CDB PREFIXADO sem campo taxaAnual no body | 400 Bad Request | I |
| TC-05-005 | CDB POS_FIXADO sem campo percentualCDI no body | 400 Bad Request | I |
| TC-05-006 | Prazo de exatamente 180 dias → faixa de IR 22,5% | aliquotaIR = 22.5 | U |
| TC-05-007 | Prazo de exatamente 181 dias → faixa de IR 20% (borda inferior) | aliquotaIR = 20.0 | U |
| TC-05-008 | Prazo de exatamente 360 dias → faixa de IR 20% (borda superior) | aliquotaIR = 20.0 | U |
| TC-05-009 | Prazo de exatamente 361 dias → faixa de IR 17,5% (borda inferior) | aliquotaIR = 17.5 | U |
| TC-05-010 | Prazo de exatamente 720 dias → faixa de IR 17,5% (borda superior) | aliquotaIR = 17.5 | U |
| TC-05-011 | Prazo de exatamente 721 dias → faixa de IR 15% (borda inferior) | aliquotaIR = 15.0 | U |
| TC-05-012 | Fórmula de capitalização: resultadoBruto = valorInicial × (1 + taxaEfetiva)^(dias/365) | Valor calculado coincide com fórmula de referência (tolerância: ± R$ 0,01) | U |
| TC-05-013 | Cálculo de IR: rendimento = resultadoBruto − valorInicial; ir = rendimento × alíquota; resultadoLiquido = resultadoBruto − ir | Todos os campos calculados corretamente | U |
| TC-05-014 | valorInicial negativo ou zero | 400 Bad Request | I |
| TC-05-015 | dataVencimento no passado (prazo negativo) | 400 Bad Request | I |
| TC-05-016 | Resposta contém todos os campos obrigatórios | prazoEmDias, resultadoBruto, ir, resultadoLiquido, aliquotaIR, percentualGanhoLiquido, percentualGanhoLiquidoAnual presentes | I |

---

### RFDOI-7: US-06 — Simular Investimento em LCI

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-06-001 | LCI POS_FIXADO: tipo="LCI", percentualCDI=105, cdi=10.75 no body | 200 OK + ir = 0, aliquotaIR = 0 | I |
| TC-06-002 | LCI PREFIXADO: tipo="LCI", taxaAnual=12.5 | 200 OK + ir = 0, aliquotaIR = 0 | I |
| TC-06-003 | LCI POS_FIXADO sem campo cdi no body | 400 Bad Request | I |
| TC-06-004 | resultadoLiquido deve ser igual a resultadoBruto (isenção total de IR) | resultadoLiquido == resultadoBruto para qualquer prazo | U |
| TC-06-005 | percentualGanhoLiquidoAnual (CAGR): ((resultadoLiquido / valorInicial)^(365/prazoEmDias) − 1) × 100 | Valor calculado correto | U |
| TC-06-006 | Requisição sem campo tipo no body | 400 Bad Request | I |

---

### RFDOI-8: US-07 — Simular Investimento em LCA

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-07-001 | LCA POS_FIXADO: tipo="LCA", percentualCDI=105, cdi=10.75 no body | 200 OK + ir = 0, aliquotaIR = 0 | I |
| TC-07-002 | LCA PREFIXADO: tipo="LCA", taxaAnual=11.0 | 200 OK + ir = 0, aliquotaIR = 0 | I |
| TC-07-003 | LCA POS_FIXADO sem campo cdi no body | 400 Bad Request | I |
| TC-07-004 | resultadoLiquido deve ser igual a resultadoBruto para LCA | resultadoLiquido == resultadoBruto | U |
| TC-07-005 | LCA e LCI com exatamente os mesmos parâmetros produzem resultados idênticos | resultadoBruto, ir, resultadoLiquido, aliquotaIR iguais em ambos | U |

---

### RFDOI-9: US-08 — Comparar Múltiplos Investimentos

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-08-001 | Comparar 2 investimentos com CDI configurado no banco e token válido | 200 OK + grupoComparacaoId (UUID v4) + ranking com 2 itens | I |
| TC-08-002 | Comparar 3 investimentos (CDB POS_FIXADO, LCI PREFIXADO, LCA POS_FIXADO) | 200 OK + ranking com 3 itens, ordenado por CAGR decrescente | I |
| TC-08-003 | Enviar lista de investimentos com apenas 1 item | 400 ou 422 com mensagem de erro | I |
| TC-08-004 | Enviar lista de investimentos vazia | 400 ou 422 com mensagem de erro | I |
| TC-08-005 | Requisição sem token de autenticação | 401 Unauthorized | I |
| TC-08-006 | Token válido, mas sem CDI configurado no banco para o usuário | 422 Unprocessable Entity com mensagem orientando a configurar via POST /cdi | I |
| TC-08-007 | Body com campo cdi (que não deve ser usado neste endpoint) | CDI do banco é usado corretamente; campo cdi no body não causa erro nem interfere | I |
| TC-08-008 | Ranking ordenado decrescente por percentualGanhoLiquidoAnual | posicao 1 tem maior CAGR; posicao N tem menor CAGR | U |
| TC-08-009 | Dois investimentos com CAGR idêntico (empate) | empatado: true em ambos os itens; campo diferencialReais ausente no posicao 1 | U |
| TC-08-010 | Vencedor claro (sem empate no primeiro lugar) | diferencialReais e diferencialPercentualAnual presentes apenas no item com posicao 1 | U |
| TC-08-011 | nomeComparacao informado no body | nomeComparacao aparece corretamente no histórico do grupo | I |
| TC-08-012 | grupoComparacaoId gerado é único por chamada | Duas chamadas consecutivas produzem UUIDs distintos | I |

---

### RFDOI-10: US-09 — Identificar Melhor Investimento

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-09-001 | LCI 12,5% a.a. PREFIXADO vs CDB 110% CDI POS_FIXADO (CDI=10.75%) com mesmo prazo | LCI ocupa posicao 1 por isenção de IR (maior CAGR líquido) | U |
| TC-09-002 | CDB com prazo de 180 dias vs LCI com prazo de 720 dias — critério é CAGR, não valor absoluto | Ranking reflete CAGR anualizado; comparação justa independente do prazo | U |
| TC-09-003 | diferencialReais = resultadoLiquido do posicao 1 − resultadoLiquido do posicao 2 | Valor correto em R$, com precisão de 2 casas decimais | U |
| TC-09-004 | diferencialPercentualAnual = CAGR do posicao 1 − CAGR do posicao 2 | Diferença percentual anual correta | U |
| TC-09-005 | Empate no primeiro lugar: empatado: true em todos os primeiros colocados; diferencialReais ausente | Estrutura de resposta correta para cenário de empate | U |

---

### RFDOI-11: US-10 — Salvar Simulação

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-10-001 | POST /comparar com JWT válido e CDI configurado | Todos os investimentos do grupo salvos automaticamente como SimulacaoSalva no banco | I |
| TC-10-002 | Cada simulação do grupo tem o mesmo grupoComparacaoId | IDs iguais no grupo; UUID diferente para cada comparação distinta | I |
| TC-10-003 | nomeComparacao salvo em todos os registros do mesmo grupo | Campo nomeComparacao presente e igual em todos os registros do grupo | I |
| TC-10-004 | cdiValor salvo corretamente em cada registro | cdiValor = valor do CDI configurado pelo usuário no momento da comparação | I |
| TC-10-005 | POST /simulacoes/cdb ou /lci-lca (endpoints públicos) não salva no banco | Nenhum registro SimulacaoSalva criado após chamadas públicas sem JWT | I |

---

### RFDOI-12: US-11 — Consultar Histórico de Simulações

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-11-001 | GET /historico com JWT válido e simulações existentes | 200 OK + campos melhorGeral e historico com registros | I |
| TC-11-002 | GET /historico sem token de autenticação | 401 Unauthorized | I |
| TC-11-003 | melhorGeral aponta para a simulação com maior percentualGanhoLiquidoAnual do histórico | Campo melhorGeral correto e verificável | I |
| TC-11-004 | Simulações de mesmo grupoComparacaoId aparecem agrupadas com melhorDoGrupo e investimentos[] | Estrutura de grupo correta na resposta | I |
| TC-11-005 | nomeComparacao e cdiValor aparecem no grupo do histórico | Campos presentes e com valores corretos | I |
| TC-11-006 | prazoEmDias no histórico calculado de createdAt até dataVencimento (fixo, não de hoje) | Valor não muda a cada consulta (calculado da data de criação, não do dia atual) | U |
| TC-11-007 | Usuário sem nenhuma simulação salva | 200 OK + historico: [] + melhorGeral: null | I |
| TC-11-008 | Usuário A não visualiza simulações do Usuário B | Isolamento correto; historico retorna apenas dados do userId do token | I |
| TC-11-009 | melhorDoGrupo dentro de cada grupo aponta para o investimento com maior CAGR do grupo | Campo correto dentro de cada grupo | I |

---

### RFDOI-13: US-12 — Excluir Simulação Salva

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| TC-12-001 | DELETE /simulacoes/:id com JWT do proprietário da simulação | 200 OK ou 204 No Content; registro removido do banco | I |
| TC-12-002 | DELETE /simulacoes/:id com JWT de um usuário diferente do proprietário | 403 Forbidden | I |
| TC-12-003 | DELETE /simulacoes/:id com ID inexistente no banco | 404 Not Found | I |
| TC-12-004 | DELETE /simulacoes/:id sem token de autenticação | 401 Unauthorized | I |
| TC-12-005 | Excluir uma simulação pertencente a um grupo não exclui as demais do mesmo grupo | Apenas a simulação com o ID informado é removida; demais do grupo permanecem | I |

---

## 4. Missões de Teste Exploratório

As missões seguem o formato: **Explorar [área] usando [recursos] para descobrir [objetivo/risco].**

- **Missão 1 — Motor de Cálculo Financeiro**
  Explorar os cálculos de resultadoBruto, IR e CAGR para CDB, LCI e LCA usando valores de referência reais do mercado (CDI 10.75%, percentuais de 80% a 130% do CDI, prazos de 30 a 1.800 dias, taxas prefixadas de 8% a 15% a.a.) para descobrir inconsistências nos valores de IR, erros de arredondamento em casas decimais e comportamentos inesperados nos limites exatos das faixas de IR (180, 181, 360, 361, 720, 721 dias).

- **Missão 2 — Segurança e Autenticação**
  Explorar os fluxos de autenticação usando sequências de login/logout/relogin com o mesmo token, tokens com payload manipulado manualmente (alteração de userId ou exp), tokens de outros usuários e requisições sem header Authorization para descobrir falhas na blacklist em memória, validação insuficiente de JWT e possíveis acessos indevidos a dados de outros usuários.

- **Missão 3 — Ranking e Empates no Comparador**
  Explorar o endpoint POST /simulacoes/comparar usando combinações extremas de investimentos (valorInicial muito alto, prazos de 1 dia e 3.000 dias, CAGR propositalmente idêntico entre dois itens, ordem variada dos investimentos no body) para descobrir erros no critério de ordenação, falhas na detecção de empate e comportamento incorreto dos campos diferencialReais e diferencialPercentualAnual.

- **Missão 4 — Fonte do CDI e Isolamento entre Usuários**
  Explorar a configuração e o consumo do CDI usando dois usuários simultâneos com taxas CDI distintas, múltiplas atualizações de CDI pelo mesmo usuário e ausência de CDI para um dos usuários para descobrir inconsistências na fonte do CDI por endpoint, vazamento de CDI entre usuários e comportamento do GET /cdi com optionalAuthMiddleware.

- **Missão 5 — Histórico e Agrupamento**
  Explorar o endpoint GET /simulacoes/historico usando um usuário com múltiplas comparações (vários grupos), simulações de grupos com apenas 1 item remanescente após exclusão e datas de vencimento variadas para descobrir falhas na estrutura de agrupamento, cálculo incorreto de prazoEmDias no histórico e identificação incorreta do melhorGeral.

- **Missão 6 — Ownership e Autorização entre Usuários**
  Explorar as operações de consulta e exclusão usando dois usuários com simulações distintas e IDs conhecidos, tentando ler o histórico e excluir registros do outro usuário para descobrir falhas de autorização no DELETE /simulacoes/:id e vazamento de dados no GET /simulacoes/historico.

---

## 5. Testes Não-Funcionais

| Tipo | Teste | Resultado Esperado |
|------|-------|-------------------|
| Performance | POST /simulacoes/comparar com 50 usuários virtuais simultâneos por 60 segundos (k6) | p95 < 500ms; taxa de erro = 0% |
| Performance | POST /auth/login com rampa de 0 a 100 req/s em 30 segundos (k6) | p95 < 200ms; taxa de sucesso > 99% |
| Performance | GET /simulacoes/historico com usuário com 100+ simulações salvas (k6, 30 VUs) | p95 < 300ms |
| Performance | POST /simulacoes/cdb e /lci-lca com 30 usuários simultâneos (k6) | p95 < 300ms; 0% de erros |
| Segurança | Requisição autenticada com payload do JWT alterado manualmente (userId trocado) | 401 Unauthorized (assinatura inválida detectada pelo middleware) |
| Segurança | Tentativa de SQL Injection nos campos de entrada: nome, email, valorInicial, taxaAnual | 400 Bad Request ou resposta normal sem execução de SQL injetado (Prisma usa queries parametrizadas) |
| Segurança | Verificar que senha não é armazenada em texto claro no banco | Campo senha no banco tem 60 caracteres com prefixo $2b$ (hash bcrypt) |
| Segurança | Token do Usuário A usado para acessar GET /simulacoes/historico | Retorna apenas dados do Usuário A; nenhum dado do Usuário B exposto |
| Confiabilidade | Reinício do servidor após logout — token previamente invalidado volta a ser aceito | Comportamento esperado e documentado (limitação da blacklist em memória); tokens expiram em 8h como mitigação |
| Confiabilidade | POST /simulacoes/comparar com CDI não configurado no banco | 422 com mensagem clara orientando o usuário a configurar o CDI via POST /cdi |

---

## 6. Automação de Testes

**Ferramentas:**
- Camada U: **Jest** — testes unitários das funções de `simulation.service.js` e `auth.service.js`
- Camada I: **Supertest** — testes de integração com banco SQLite de teste isolado (variável `DATABASE_URL` apontando para `test.db` ou banco in-memory)

**Requisito crítico de determinismo:** condições que dependem de `Date.now()` (prazoEmDias) devem usar `jest.useFakeTimers()` ou injeção de data para produzir resultados reproduzíveis.

| ID | Condição | Resultado Esperado | Camada |
|----|----------|-------------------|--------|
| AT-U-001 | calcularAliquotaIR(180) | 22.5 | U |
| AT-U-002 | calcularAliquotaIR(181) | 20.0 | U |
| AT-U-003 | calcularAliquotaIR(360) | 20.0 | U |
| AT-U-004 | calcularAliquotaIR(361) | 17.5 | U |
| AT-U-005 | calcularAliquotaIR(720) | 17.5 | U |
| AT-U-006 | calcularAliquotaIR(721) | 15.0 | U |
| AT-U-007 | calcularCDB PREFIXADO: valorInicial=10000, taxaAnual=12.5, prazo=365 dias | resultadoBruto = 11250.00; ir = 218.75 (aliq 17.5%); resultadoLiquido = 11031.25 | U |
| AT-U-008 | calcularCDB POS_FIXADO: taxaEfetiva = (CDI × percentualCDI/100) / 100 | taxaEfetiva = (10.75 × 110/100) / 100 = 0.11825 | U |
| AT-U-009 | calcularLCI/LCA: qualquer prazo e taxa | ir = 0; aliquotaIR = 0; resultadoLiquido = resultadoBruto | U |
| AT-U-010 | percentualGanhoLiquidoAnual (CAGR): fórmula ((liq/val)^(365/dias)−1)×100 | Valor correto com precisão de 2 casas decimais | U |
| AT-U-011 | comparar([itemA, itemB]): ranking por CAGR decrescente | item com maior CAGR ocupa posicao 1 | U |
| AT-U-012 | comparar([itemA, itemB]) com CAGR idêntico (empate) | empatado: true em ambos; diferencialReais ausente | U |
| AT-U-013 | comparar([itemA, itemB]) com vencedor claro | diferencialReais e diferencialPercentualAnual presentes no posicao 1 | U |
| AT-U-014 | Expiração do token JWT gerado em auth.service: exp − iat = 28800 | Verdadeiro | U |
| AT-U-015 | auth.service.register com senha de 7 caracteres | Lança erro de validação | U |
| AT-I-001 | POST /auth/register — dados válidos | 201 Created + id, nome, email na resposta; campo senha ausente | I |
| AT-I-002 | POST /auth/register — email duplicado | 409 Conflict | I |
| AT-I-003 | POST /auth/register — senha com 7 caracteres | 400 Bad Request | I |
| AT-I-004 | POST /auth/login — credenciais corretas | 200 OK + campo token com JWT | I |
| AT-I-005 | POST /auth/login — senha incorreta | 401 Unauthorized | I |
| AT-I-006 | POST /auth/logout — token válido | 200 OK; token adicionado à blacklist | I |
| AT-I-007 | Endpoint protegido usando token após logout | 401 Unauthorized | I |
| AT-I-008 | POST /cdi — valor válido com JWT | 201 Created | I |
| AT-I-009 | GET /cdi — sem CDI cadastrado | 404 Not Found | I |
| AT-I-010 | GET /cdi — com múltiplos registros de CDI | Retorna o mais recente (maior dataVigencia) | I |
| AT-I-011 | POST /simulacoes/cdb — POS_FIXADO com cdi | 200 OK + cálculo completo com aliquotaIR > 0 | I |
| AT-I-012 | POST /simulacoes/cdb — POS_FIXADO sem cdi no body | 400 Bad Request | I |
| AT-I-013 | POST /simulacoes/lci-lca tipo=LCI — POS_FIXADO | 200 OK + ir = 0 + aliquotaIR = 0 | I |
| AT-I-014 | POST /simulacoes/lci-lca tipo=LCA — PREFIXADO | 200 OK + ir = 0 + aliquotaIR = 0 | I |
| AT-I-015 | POST /simulacoes/comparar — 2 investimentos com CDI no banco | 200 OK + grupoComparacaoId UUID + ranking | I |
| AT-I-016 | POST /simulacoes/comparar — sem CDI no banco do usuário | 422 Unprocessable Entity | I |
| AT-I-017 | POST /simulacoes/comparar — lista com 1 investimento | 400 ou 422 | I |
| AT-I-018 | POST /simulacoes/comparar — sem autenticação | 401 Unauthorized | I |
| AT-I-019 | GET /simulacoes/historico — com simulações salvas | 200 OK + melhorGeral não nulo + historico com registros | I |
| AT-I-020 | GET /simulacoes/historico — usuário sem simulações | 200 OK + historico: [] + melhorGeral: null | I |
| AT-I-021 | GET /simulacoes/historico — isolamento entre usuários | Usuário A não vê dados do Usuário B | I |
| AT-I-022 | DELETE /simulacoes/:id — dono da simulação | 200/204 OK; registro removido do banco | I |
| AT-I-023 | DELETE /simulacoes/:id — outro usuário (não dono) | 403 Forbidden | I |
| AT-I-024 | DELETE /simulacoes/:id — ID inexistente | 404 Not Found | I |

---

## 7. Mapeamento dos Dados de Teste

| Dado | Tipo | Responsável | Status |
|------|------|-------------|--------|
| Usuário principal: { nome: "Test User", email: "test@rfdoi.com", senha: "Senha@123" } | Fixture / Factory | Ricardo Lage | A criar |
| Usuário secundário: { email: "user2@rfdoi.com", senha: "Senha@456" } — para testes de isolamento e ownership | Fixture | Ricardo Lage | A criar |
| Email duplicado (usuário já registrado para teste de conflito) | Estado pré-condicionado via beforeEach | Ricardo Lage | A criar |
| Taxa CDI usuário principal: 10.75% a.a. | Fixture | Ricardo Lage | A criar |
| Taxa CDI usuário secundário: 12.00% a.a. | Fixture | Ricardo Lage | A criar |
| CDB POS_FIXADO — prazo ≤ 180 dias: dataVencimento calculada dinamicamente (hoje + 90 dias) | Fixture com data calculada | Ricardo Lage | A criar |
| CDB POS_FIXADO — prazo 181–360 dias: dataVencimento = hoje + 270 dias | Fixture com data calculada | Ricardo Lage | A criar |
| CDB POS_FIXADO — prazo 361–720 dias: dataVencimento = hoje + 540 dias | Fixture com data calculada | Ricardo Lage | A criar |
| CDB POS_FIXADO — prazo > 720 dias: dataVencimento = hoje + 900 dias | Fixture com data calculada | Ricardo Lage | A criar |
| CDB PREFIXADO: valorInicial=10000, taxaAnual=12.5, prazo=365 dias | Fixture | Ricardo Lage | A criar |
| LCI PREFIXADO: valorInicial=10000, taxaAnual=12.5 | Fixture | Ricardo Lage | A criar |
| LCA POS_FIXADO: valorInicial=10000, percentualCDI=105 | Fixture | Ricardo Lage | A criar |
| Payload de comparação padrão: 2 investimentos (CDB POS_FIXADO vs LCI PREFIXADO) | Fixture | Ricardo Lage | A criar |
| Payload de comparação completo: 3 investimentos (CDB, LCI, LCA) com nome "Comparação Teste" | Fixture | Ricardo Lage | A criar |
| Payload de comparação com empate: 2 investimentos com CAGR propositalmente idêntico | Fixture calculado | Ricardo Lage | A criar |
| Token JWT válido | Gerado dinamicamente via POST /auth/login no beforeAll/beforeEach | Ricardo Lage | A criar |
| Token JWT expirado | Token criado com exp retroativo via mock ou secret conhecido | Ricardo Lage | A criar |
| Token JWT malformado | String hardcoded: "Bearer token.invalido.aqui" | Ricardo Lage | A criar |
| Banco SQLite de teste isolado | DATABASE_URL=file:./test.db no arquivo .env.test; limpo via prisma migrate reset antes dos testes | Ricardo Lage | A criar |

---

## 8. Defeitos Conhecidos

Nenhum defeito funcional identificado até o momento. O sistema concluiu o desenvolvimento das 12 User Stories com validação manual pelo time.

As limitações abaixo são **comportamentos esperados, documentados e aceitos** para o contexto atual do projeto:

| ID | Limitação | Camada |
|----|-----------|--------|
| LIM-001 | Blacklist de tokens JWT é mantida em memória (Set JavaScript). Ao reiniciar o servidor, tokens invalidados via POST /auth/logout voltam a ser aceitos. Mitigação atual: tokens expiram em 8 horas. Solução definitiva (fora do escopo do MVP): persistir blacklist em Redis ou banco de dados. | I |
| LIM-002 | prazoEmDias é calculado usando a data atual no momento da chamada. Testes automatizados que dependem de prazo fixo devem usar jest.useFakeTimers() ou injeção de data para garantir resultados determinísticos e reproduzíveis. | U |
| LIM-003 | GET /cdi sem token de autenticação retorna 404 quando não há CDI configurado por nenhum usuário. Comportamento correto pelo design (CDI é por usuário), mas pode causar confusão em uso anônimo. Documentar no Swagger como comportamento esperado. | I |
