# Sistema de Reservas - Clube Ecoville II

Um sistema moderno e intuitivo para o gerenciamento de reservas das áreas de lazer (quadras de tênis e futebol) do condomínio. Desenvolvido com **React**, **TypeScript** e **Vite**, integrado ao **Supabase** para o banco de dados e autenticação.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Vite
- **Estilização:** CSS puro, com tema escuro (Dark Mode) moderno
- **Ícones:** Lucide React
- **Backend/Banco de Dados:** Supabase (PostgreSQL)

---

## 📋 Funcionalidades Principais

1. **Seleção de Espaço:**
   - Escolha entre Quadra de Tênis 1 (Azul), Quadra de Tênis 2 (Vermelha) e Campo de Futebol Society.

2. **Agendamento Inteligente:**
   - Visualização dos horários disponíveis e ocupados em tempo real na data escolhida.
   - Bloqueios de regras de negócio: Permitido apenas 1 reserva antecipada por dia por casa/apartamento e reservas subsequentes no mesmo dia só podem ser feitas com 1 hora de antecedência.

3. **Gerenciamento (Minhas Reservas):**
   - Os moradores podem visualizar seu histórico de reservas ativas e futuras.
   - Opção de cancelamento (exclusão) de uma reserva diretamente pela interface.

4. **Identificação Simples:**
   - Autenticação facilitada utilizando o Nome do morador e os dados de sua unidade (Rua/Bloco e Número).
   - "Lembrar login" automático (persistência via `localStorage`).

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** instalado na máquina.

### Passos

1. Faça o clone do repositório:
```bash
git clone https://github.com/SeuUsuario/aluguelQuadras.git
```

2. Entre na pasta do projeto:
```bash
cd aluguelQuadras
```

3. Instale as dependências:
```bash
npm install
```

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione as chaves de conexão do seu banco Supabase (verifique o arquivo de exemplo ou a documentação do Supabase).

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse o projeto no navegador:
   - Geralmente em `http://localhost:5173`

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

O projeto requer uma tabela `rentals` configurada no Supabase PostgreSQL. Você pode usar o arquivo `supabase.sql` incluído na pasta raiz deste projeto. Basta copiar o conteúdo e executar no editor SQL do painel do seu Supabase para criar a mesma estrutura.

---

Feito com 🎾 e ⚽ para facilitar a diversão no condomínio!
