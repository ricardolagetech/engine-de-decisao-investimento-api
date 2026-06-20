# Engine de Decisão de Investimento API

API REST para simular, comparar e salvar investimentos de renda fixa, com foco em CDB, LCI e LCA.

O projeto foi desenvolvido como parte de uma mentoria de testes de software, usando um domínio realista de comparação de investimentos para apoiar a evolução da estratégia de testes automatizados.

## Objetivo

Permitir que o usuário:

- cadastre e autentique uma conta
- configure sua própria taxa CDI
- simule investimentos individuais em CDB, LCI e LCA
- compare dois ou mais investimentos com critério anualizado
- salve comparações no histórico autenticado
- consulte e exclua simulações salvas

## Stack

- Node.js 22
- Express 5
- Prisma 5
- SQLite
- JWT para autenticação
- bcryptjs para hash de senha
- Swagger UI para documentação da API

## Regras de negócio principais

### Tipos de investimento

- `CDB`: possui incidência de IR regressivo sobre o rendimento
- `LCI`: isento de IR
- `LCA`: isento de IR

### Tipos de remuneração

- `POS_FIXADO`: usa percentual do CDI, como `110% do CDI`
- `PREFIXADO`: usa taxa anual fixa, como `12.5% a.a.`

### Cálculo de prazo

O prazo é calculado em dias corridos reais entre a data atual e a `dataVencimento`.

### Cálculo do rendimento bruto

```text
POS_FIXADO: taxaEfetiva = (CDI * percentualCDI / 100) / 100
PREFIXADO:  taxaEfetiva = taxaAnual / 100

resultadoBruto = valorInicial * (1 + taxaEfetiva) ^ (dias / 365)
```

### Tabela de IR do CDB

| Prazo em dias | Alíquota |
| --- | --- |
| até 180 | 22,5% |
| 181 a 360 | 20% |
| 361 a 720 | 17,5% |
| acima de 720 | 15% |

O imposto incide apenas sobre o rendimento:

```text
rendimento = resultadoBruto - valorInicial
ir = rendimento * alíquota
resultadoLiquido = resultadoBruto - ir
```

### Critério de ranking

As comparações usam `percentualGanhoLiquidoAnual`, e não o valor líquido final. Isso permite comparar investimentos com prazos diferentes de forma mais justa.

```text
percentualGanhoLiquidoAnual = ((resultadoLiquido / valorInicial) ^ (365 / prazoEmDias) - 1) * 100
```

## Estrutura do projeto

```text
src/
  app.js
  server.js
  config/
  controllers/
  lib/
  middlewares/
  routes/
  services/
prisma/
  schema.prisma
  migrations/
```

## Endpoints

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/register` | Não | Cadastra usuário |
| POST | `/auth/login` | Não | Autentica e retorna JWT |
| POST | `/auth/logout` | Sim | Invalida o token atual em blacklist em memória |
| POST | `/cdi` | Sim | Salva uma nova taxa CDI para o usuário |
| GET | `/cdi` | Opcional | Retorna a taxa CDI mais recente do usuário |
| POST | `/simulacoes/cdb` | Não | Simula um investimento em CDB |
| POST | `/simulacoes/lci-lca` | Não | Simula um investimento em LCI ou LCA |
| POST | `/simulacoes/comparar` | Sim | Compara investimentos, gera ranking e salva histórico |
| GET | `/simulacoes/historico` | Sim | Lista simulações e comparações salvas |
| DELETE | `/simulacoes/:id` | Sim | Exclui uma simulação salva do próprio usuário |

## Como executar localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` com pelo menos:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="defina_um_segredo_aqui"
```

### 3. Aplique as migrations

```bash
npx prisma migrate dev
```

### 4. Inicie a aplicação

```bash
npm start
```

Modo de desenvolvimento:

```bash
npm run dev
```

Aplicação disponível em:

```text
http://localhost:3000
```

Swagger UI:

```text
http://localhost:3000/api-docs
```

## Exemplo de comparação

```json
{
  "nome": "Comparação Julho 2025",
  "investimentos": [
    {
      "tipo": "CDB",
      "valorInicial": 10000,
      "dataVencimento": "2027-09-30",
      "tipoRemuneracao": "POS_FIXADO",
      "percentualCDI": 110
    },
    {
      "tipo": "LCI",
      "valorInicial": 10000,
      "dataVencimento": "2027-03-30",
      "tipoRemuneracao": "PREFIXADO",
      "taxaAnual": 12.5
    }
  ]
}
```

## Persistência e observações

- O banco local usado no desenvolvimento é SQLite.
- A blacklist de logout fica em memória e é perdida quando o servidor reinicia.
- O CDI é histórico: cada `POST /cdi` cria um novo registro, e a API usa o mais recente.
- `dataVencimento` é salvo em horário local para evitar desvio indevido de fuso.

## Próxima etapa

A implementação funcional da API está concluída. A próxima fase do projeto é estruturar a estratégia de testes automatizados, com foco em:

- testes unitários do motor de simulação
- testes de integração dos endpoints
- testes de performance
