# Cuidar+ Prontuário Médico 100% Digital

## Execução local

1. Inicie o servidor:
```bash
node server.js
```

2. Abra no navegador:
- Web: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- App web: [http://localhost:3000/app-mobile.html](http://localhost:3000/app-mobile.html)

## Validação digital (QR + código)

- Ao gerar/copiar/imprimir/exportar documento, o frontend tenta emitir registro no backend.
- O backend gera:
  - código único de verificação
  - hash de integridade do documento
  - URL de validação
- O QR Code no documento aponta para a validação.
- Se o backend não estiver disponível, o QR aponta para `verify.html` com fallback informativo (não vira busca do Google).

Página de validação:
- [http://localhost:3000/verify.html](http://localhost:3000/verify.html)

## Arquivos de backend

- Servidor/API: `/server.js`
- Banco local (JSON): `/data/verification-db.json`

---

## Firebase (produção)

### 1) Preparar projeto

1. Crie o projeto no Firebase Console.
2. Troque o project id em `.firebaserc`.
3. Instale dependências das functions:
```bash
cd functions
npm install
cd ..
```

### 2) Login e deploy

```bash
firebase login
firebase deploy
```

Isso publica:
- frontend (Hosting)
- API `/api/**` via Cloud Functions (`functions/index.js`)
- regras do Realtime Database (`database.rules.json`)

### Sem Firebase Hosting (ex.: Netlify)

Pode usar normalmente. Nesse caso:

1. Publique **apenas functions + database rules**:
```bash
firebase deploy --only functions,database
```

2. O frontend usa a API externa configurada em `/config.js`:
```js
window.CUIDAR_API_BASE = "https://southamerica-east1-cuidarmais-7d01d.cloudfunctions.net/api";
```

3. Publique os arquivos estáticos normalmente no Netlify.

### 3) Endpoints de validação (Firebase)

- `POST /api/documents`
- `GET /api/verify/:code`
- `GET /api/audit/:code`

O frontend já está preparado para esses endpoints e o QR passa a validar com backend real.
