# Sistema de Reservas - Clube Ecoville II

Aplicacao para reserva de quadras do condominio, desenvolvida com **React**, **TypeScript** e **Vite**, usando **Supabase Auth** para autenticacao e **Supabase Postgres** para persistencia e regras de negocio.

## Tecnologias

- Frontend: React 19, TypeScript, Vite
- Estilizacao: CSS puro
- Icones: Lucide React
- Backend: Supabase Auth + PostgreSQL

## O que o projeto faz hoje

- Cadastro e login por e-mail com vinculo da conta ao morador e a unidade
- Consulta de horarios ocupados por quadra e por data
- Reserva com validacao no banco:
  - 1 hora por reserva
  - horarios entre 06:00 e 23:00
  - ate 7 dias de antecedencia
  - apenas 1 reserva antecipada por dia para a mesma unidade
  - novas reservas no mesmo dia so com ate 1 hora de antecedencia
- Cancelamento apenas pelo dono da reserva e com no minimo 2 horas de antecedencia
- Visualizacao das reservas da conta autenticada

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env.local` na raiz com base em `.env.example`.

3. Configure o Supabase:
   - crie um projeto
   - habilite `Email` em `Authentication > Providers`
   - ajuste `URL Configuration` se quiser confirmacao por e-mail

4. Execute o SQL de configuracao em `supabase.sql`.

Importante: o script atual recria a tabela `rentals`, entao ele remove reservas antigas.

5. Inicie o projeto:

```bash
npm run dev
```

## Variaveis de ambiente

Use estas variaveis no `.env.local`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

O app nao usa mais fallback embutido para URL e chave do Supabase.

## Regras garantidas no banco

As principais regras do sistema agora sao validadas no PostgreSQL antes de inserir ou cancelar reservas. Isso evita que alguem burle as restricoes alterando apenas o frontend.

## Observacoes

- O arquivo `supabase.sql` foi pensado como setup limpo do ambiente.
- Contas antigas baseadas em `localStorage` nao sao mais usadas.
- Para producao, vale configurar confirmacao de e-mail e revisar os redirects do Supabase Auth.
