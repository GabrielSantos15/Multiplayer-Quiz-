# 🌍⚡ Atlas Arena

![Status Concluído](https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

> **🕹️ Jogue agora:** [Acesse o Atlas Arena](https://atlas-arena-quiz.vercel.app/)

O **Atlas Arena** é um jogo de quiz multiplayer de geografia em tempo real, inspirado no Kahoot. Vários jogadores entram na mesma sala e competem respondendo perguntas sobre bandeiras, capitais, continentes, população, área territorial, fronteiras e localização no mapa-múndi — tudo sincronizado em tempo real via WebSockets.

Esse projeto foi construído como estudo de caso prático de **Socket.IO e comunicação em tempo real**: salas (rooms), gerenciamento de estado no servidor, sincronização de temporizador entre múltiplos clientes, tratamento de desconexão/reconexão e concorrência entre eventos.

## 🎯 Visão Geral

### Principais funcionalidades

- **Salas multiplayer em tempo real** — criação de sala com código único, entrada de jogadores por nickname, sincronização instantânea de estado entre host e jogadores via Socket.IO.
- **Perguntas geradas a partir de dados reais** — geração procedural de perguntas de geografia (bandeiras, capitais, continentes, população, área, fronteiras, localização no mapa) a partir de um banco de dados de países, com distratores escolhidos de forma consistente com a região do país correto.
- **Temporizador sincronizado no servidor** — cada pergunta avança por tempo limite ou assim que todos os jogadores respondem, o que ocorrer primeiro; o servidor é a fonte da verdade, o cliente nunca decide o resultado.
- **Reconexão de jogador** — jogadores identificados por um ID persistente (não pelo `socket.id`, que muda a cada conexão), permitindo voltar à mesma sala após queda de conexão ou reload de página.
- **Mapa-múndi interativo** — visualização do país em destaque num mapa-múndi em SVG, com zoom dinâmico sob demanda.
- **Pontuação dinâmica** — cálculo de pontos com bônus por ordem de resposta (1º, 2º, 3º lugar), incentivando não só acertar, mas responder rápido.
- **Sistema de áudio global** — efeitos sonoros e feedback de interface gerenciados via Context API do React.
- **UI/UX com micro-interações** — interface responsiva com animações de transição e "game feel" via Framer Motion.
- **Tratamento de desconexão** — identificação visual de jogadores offline no lobby e no pódio final, sem removê-los da partida.

## 🏗️ Arquitetura

O projeto é dividido em dois serviços independentes, com hospedagem separada:

- **Frontend (Vercel):** Next.js 15 (App Router) + React + TypeScript + Tailwind CSS + Framer Motion, responsável pela interface, pelas telas do jogo e pela conexão com o servidor via `socket.io-client`.
- **Backend (Render):** Node.js + Express + TypeScript + Socket.IO, responsável por manter as conexões persistentes e o estado da partida. O estado (salas, jogadores, perguntas, pontuação) é mantido **em memória**, sem banco de dados — decisão consciente para manter o escopo do projeto focado em aprendizado de tempo real, sem a complexidade adicional de persistência.

Frontend e backend são projetos independentes, cada um com suas próprias dependências — os tipos e nomes de eventos do Socket.IO são replicados manualmente nos dois lados por simplicidade.

### Limitações conhecidas (por decisão de escopo)

- O estado da partida vive em memória: um restart do servidor encerra partidas em andamento. Um próximo passo natural seria mover esse estado para Redis, permitindo múltiplas instâncias do backend e persistência entre deploys.
- Sem autenticação: qualquer pessoa com o código da sala pode entrar.
- Tipos e nomes de eventos do Socket.IO são duplicados manualmente entre frontend e backend (sem um pacote `shared`), o que exige atenção ao alterar um evento para manter os dois lados sincronizados.

## 🛠️ Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/GabrielSantos15/Atlas-Arena.git
cd Atlas-Arena
```

### 2. Instale as dependências

Instale as dependências do backend e do frontend separadamente, cada um dentro da sua própria pasta:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` em `frontend/` com a URL do backend:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Crie um arquivo `.env` em `backend/` com a URL do frontend:

```
CLIENT_URL=http://localhost:3000
```

### 4. Inicie o backend

```bash
cd backend
npm run dev
```

O servidor sobe por padrão na porta `3001` (confirme a porta configurada no seu `backend/src/server.ts`).

### 5. Inicie o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do projeto

```
atlas-arena/
├── backend/       # Node.js + Express + Socket.IO
└── frontend/      # Next.js + React + TypeScript
```
