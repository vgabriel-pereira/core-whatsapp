# Ferramenta de Disparo Automático de Mensagens no WhatsApp

## Visão Geral
Este projeto é uma ferramenta web para disparo automático de mensagens no WhatsApp, voltada para o **Core-DF**. O usuário pode:
- Fazer login na plataforma.
- Anexar uma planilha do Excel contendo **Nome do Representante** e **Telefone**.
- Opcionalmente, anexar uma **imagem**.
- Escrever o **texto** da mensagem a ser enviada.
- Enviar mensagens automaticamente para os contatos listados.
- Verificar se a mensagem foi entregue e atualizar a planilha com o status.

## Tecnologias Utilizadas
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Nest.js
- **Banco de Dados:** PostgreSQL
- **Envio de Mensagens:** Baileys (WhatsApp Web API)
- **Manipulação de Planilhas:** xlsx

## Estrutura do Projeto
```
whatsapp-message-sender/
│── backend/
│   ├── src/
│   │   ├── auth/ (Módulo de autenticação)
│   │   ├── database/ (Configuração do PostgreSQL com Prisma)
│   │   ├── messages/ (Envio de mensagens via Baileys)
│   │   ├── upload/ (Upload e manipulação de planilhas)
│   │   ├── main.ts (Arquivo principal do backend)
│   ├── prisma/ (Definição do esquema do banco de dados)
│   ├── .env (Variáveis de ambiente)
│   ├── package.json (Dependências do projeto)
│── frontend/
│   ├── index.html (Interface do usuário)
│   ├── styles.css (Estilização da interface)
│   ├── script.js (Lógica do frontend)
│── README.md (Este arquivo)
│── docker-compose.yml (Configuração do Docker para PostgreSQL)
```

## Instalação e Execução

### **1️⃣ Clonar o Repositório**
```bash
git clone https://github.com/seu-repositorio.git
cd whatsapp-message-sender
```

### **2️⃣ Configurar o Backend**
```bash
cd backend
npm install
cp .env.example .env  # Configurar variáveis de ambiente
npx prisma migrate dev  # Criar as tabelas no PostgreSQL
npm run start:dev  # Rodar o backend em modo desenvolvimento
```

### **3️⃣ Configurar o Frontend**
```bash
cd frontend
npx live-server  # Opcional: rodar um servidor local para testar a interface
```

## **Endpoints da API**
### **Autenticação**
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Cadastro de novo usuário

### **Envio de Mensagens**
- `POST /messages/send` - Envia mensagens para os contatos
- `GET /messages/status` - Retorna o status das mensagens enviadas

### **Upload de Planilhas**
- `POST /upload/excel` - Faz upload e processa a planilha de contatos
- `POST /upload/image` - Faz upload da imagem opcional

## **Considerações Finais**
- Esta ferramenta foi desenvolvida para uso interno no **Core-DF**.
- O envio de mensagens é baseado no **Baileys**, que simula o WhatsApp Web. Seu uso deve seguir os termos de serviço do WhatsApp.
- Qualquer dúvida ou sugestão, entre em contato com o desenvolvedor.

---
**Desenvolvido por:** Vitor Gabriel Pereira Trindade

