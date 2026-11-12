# Lorcana Lore Counter — Overlay para Live Stream

Contador de Lore para Lorcana com atualização em tempo real para transmissões ao vivo no **CameraFi Live**, OBS, ou Streamlabs.

## Como funciona

```
[Celular com Controller] → [Firebase] → [Overlay no CameraFi Live]
```

1. Você abre o **controller** no celular (a URL `/`)
2. Clica em **+1, +2, ou +3** quando ganhar lore
3. O **overlay** (URL `/overlay`) atualiza instantaneamente na transmissão

---

## Configuração (passo a passo)

### 1. Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"** e crie um projeto (ex: `lorcana-lore`)
3. No painel, clique em **"Realtime Database"** no menu lateral
4. Clique em **"Criar banco de dados"** → selecione o servidor mais próximo → **Modo de teste** (por enquanto)
5. Vá em **Configurações do projeto** (ícone de engrenagem) → **Seus aplicativos** → clique no ícone `</>`
6. Registre o app com qualquer nome (ex: `lorcana-web`)
7. Copie as credenciais que aparecem (`apiKey`, `authDomain`, etc.)

### 2. Configurar as variáveis de ambiente

```bash
# Na raiz do projeto, copie o arquivo de exemplo:
cp .env.example .env
```

Abra o `.env` e preencha com as credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Instalar e rodar localmente

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`

- Controller: `http://localhost:5173/`
- Overlay: `http://localhost:5173/overlay`

### 4. Deploy no Vercel (gratuito)

```bash
# Instale a CLI do Vercel (só na primeira vez)
npm install -g vercel

# Faça o deploy
vercel

# Siga as instruções. Depois adicione as variáveis de ambiente:
# vercel.com → seu projeto → Settings → Environment Variables
```

Cole todas as variáveis do seu `.env` lá.

Depois do deploy, seu app ficará disponível em `https://seu-app.vercel.app`

### 5. Configurar no CameraFi Live

1. Abra o **CameraFi Live** no celular
2. Na cena, toque em **"+"** para adicionar uma fonte
3. Selecione **"Página Web"** (ou "Web Page")
4. Cole a URL do overlay: `https://seu-app.vercel.app/overlay`
5. Ajuste o tamanho e posição na tela

### 6. Usar durante a live

- Abra `https://seu-app.vercel.app` no navegador do celular (pode salvar como atalho na tela inicial)
- Toque nos botões **+1, +2, +3** conforme ganhar lore
- O overlay atualiza em **menos de 100ms** na transmissão

---

## Estrutura do projeto

```
src/
  firebase.js           # Configuração do Firebase
  main.jsx              # Roteamento
  index.css             # Estilos globais
  hooks/
    useGameState.js     # Hook de sincronização com Firebase
  pages/
    Controller.jsx      # Interface do controller (celular)
    Controller.module.css
    Overlay.jsx         # Overlay da transmissão
    Overlay.module.css
```

## Tecnologias

| Tecnologia | Por quê |
|---|---|
| **React + Vite** | Simples, rápido, funciona no celular pelo navegador |
| **Firebase Realtime Database** | Gratuito, sincroniza em tempo real entre dispositivos |
| **React Router** | Roteamento entre `/controller` e `/overlay` |
| **Vercel** | Deploy gratuito com HTTPS |

## Licença

MIT — use à vontade!
