# Marka & Kanda - Sistema Unificado de Agendamentos e Loja (SaaS)

Este é um sistema **SaaS Multi-Tenant** (Multi-inquilino) que une o **Marka** (plataforma de agendamentos) e o **Kanda** (loja online) num único ecossistema. O sistema serve múltiplos negócios (salões de beleza, restaurantes, clínicas) a partir de uma única base de código, garantindo isolamento total de dados.

## 🚀 Funcionalidades Principais

- **Multi-Tenant (Isolamento de Dados):** Cada negócio tem o seu próprio "slug" (ex: `/sara`), cores, logo e produtos/serviços. Um cliente nunca vê os dados de outro.
- **Agendamentos (Marka):** Sistema de reservas com escolha de serviço, data, hora e gestão de horários de funcionamento.
- **Loja Online (Kanda):** Catálogo de produtos com carrinho de compras, controlo de stock e checkout.
- **Painel de Administração:** Área restrita para cada dono de negócio gerir reservas, serviços, produtos e personalizar o perfil do negócio.
- **Upload de Imagens:** Upload direto de fotos para os produtos.
- **Segurança:** Autenticação via JWT (JSON Web Tokens) e proteção de rotas por negócio.

## 🛠️ Tecnologias Utilizadas

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS
- React Router DOM

**Backend:**
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (Autenticação)
- Multer (Upload de ficheiros)

**Infraestrutura:**
- Monorepo gerido com **pnpm Workspaces**
- Base de Dados: **Supabase** (PostgreSQL na nuvem)
- Deploy Frontend: **Vercel**
- Deploy Backend: **Render**
- Docker (para ambiente de desenvolvimento local)

## 📂 Estrutura do Projeto (Monorepo)

```text
marka/
├── apps/
│   ├── api/          # Backend (Node.js + Express + Prisma)
│   └── web/          # Frontend (React + Vite)
├── packages/         # Código partilhado (se aplicável)
├── docker-compose.yml# Configuração do PostgreSQL local
└── package.json      # Configuração do workspace
