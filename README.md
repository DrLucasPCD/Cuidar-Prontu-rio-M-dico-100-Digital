# Cuidar+ Guia Educativo de Prevenção

## Execução local

1. Inicie o servidor:
```bash
node server.js
```

2. Abra no navegador:
- Web: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- App web: [http://localhost:3000/app-mobile.html](http://localhost:3000/app-mobile.html)

## Escopo da ferramenta

- A aplicação funciona como guia educativo de prevenção em saúde.
- Não solicita dados identificáveis de pessoas ou profissionais.
- Campos de identificação pessoal/profissional foram removidos.
- Não há salvamento de rascunho de atendimento.
- Não há persistência de dados de atendimento em banco.
- Geração de documento é local (visualização/cópia/impressão/PDF).

## Privacidade e LGPD

- O documento final reforça que o uso é educativo e sem coleta de identificadores.
- O único armazenamento local mantido é o dicionário de classificação CID/APS (`classificationCatalogV1`), sem vínculo com indivíduos.
- A rota de validação ([http://localhost:3000/verify.html](http://localhost:3000/verify.html)) permanece apenas informativa no modo sem persistência.

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

No modo educativo, os endpoints de documentos/validação/auditoria retornam indisponível para evitar persistência.

### Sem Firebase Hosting (ex.: Netlify)

Pode usar normalmente. Nesse caso:

1. Publique **apenas functions** (se quiser manter respostas de API indisponível):
```bash
firebase deploy --only functions
```

2. O frontend usa a API externa configurada em `/config.js`:
```js
window.CUIDAR_API_BASE = "https://southamerica-east1-cuidarmais-7d01d.cloudfunctions.net/api";
```

3. Publique os arquivos estáticos normalmente no Netlify.
