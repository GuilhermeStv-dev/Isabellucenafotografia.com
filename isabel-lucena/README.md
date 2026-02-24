# 📸 Isabel Lucena Fotografia — Site Completo

Stack: **React 18 + Tailwind CSS 3 + Framer Motion + React Router + Vite**

---

## 🚀 Rodando o projeto pela primeira vez

```bash
# 1. Entre na pasta do projeto
cd isabel-lucena

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra no navegador: http://localhost:5173
```

---

## 📁 Estrutura de pastas

```
src/
├── components/
│   ├── Header.jsx          # Header flutuante, sticky ao scroll
│   ├── Footer.jsx          # Footer com back-to-top
│   ├── WhatsAppButton.jsx  # Botão flutuante do WhatsApp
│   ├── GalleryGrid.jsx     # Grid 2 colunas com lightbox + paginação
│   ├── PhotoCard.jsx       # Card de foto com hover overlay
│   └── useReveal.js        # Hook de animação scroll-reveal
├── context/
│   └── GalleryContext.jsx  # Gerenciamento de fotos/categorias (localStorage)
├── pages/
│   ├── Home.jsx            # Página inicial completa
│   ├── Trabalhos.jsx       # Galeria com filtros por categoria
│   ├── GalleryPage.jsx     # Página individual de cada categoria
│   └── Dashboard.jsx       # Dashboard da cliente (protegido por senha)
├── App.jsx                 # Rotas
├── main.jsx                # Entry point
└── index.css               # Estilos globais, botões, animações
```

---

## 🎨 Design system

| Item | Valor |
|---|---|
| Cor principal | `#0D0D0D` (fundo) |
| Cor de destaque | `#C9A96E` (dourado) |
| Fonte display | Cormorant Garamond (itálico) |
| Fonte corpo | DM Sans |

### Classes de botão prontas:
- `.btn-gold` — botão dourado com animação hover + pressed + seta diagonal
- `.btn-outline` — botão outline com mesmo hover

### Animações incluídas:
- **Header**: desliza de cima ao carregar
- **WhatsApp**: sobe de baixo (delay 1.2s)
- **Hero arrow**: bounce loop infinito
- **Seções**: fade-up ao entrar na viewport
- **Fotos**: stagger suave ao aparecer
- **Hover botões**: dourado + sombra + seta 45°
- **Click botões**: escala (pressed effect)

---

## 📂 Adicionando fotos reais

### Opção 1 — Via Dashboard (recomendado para a cliente)
1. Acesse `/dashboard` no navegador
2. Senha: **`isabel2025`** (altere em `Dashboard.jsx`, linha ~80)
3. Selecione a categoria no painel lateral
4. Clique em **"Adicionar fotos"** e suba as imagens do computador
5. Para definir a foto de capa, clique na ⭐ da foto
6. As fotos ficam salvas no **localStorage** do navegador

> ⚠️ **Atenção:** localStorage guarda as fotos no navegador local. Para um site em produção com múltiplos dispositivos, recomendo integrar com **Supabase Storage** (gratuito) ou **Cloudinary** (tier free generoso). Veja abaixo como fazer.

### Opção 2 — Hard-coded no código (para fotos fixas)
Edite `src/context/GalleryContext.jsx` → `DEFAULT_PHOTOS` e substitua as URLs do Unsplash pelas URLs reais das suas fotos.

---

## ☁️ Upgrade para storage real (Supabase — gratuito)

```bash
npm install @supabase/supabase-js
```

1. Crie conta em [supabase.com](https://supabase.com) (100% grátis)
2. Crie um projeto → Storage bucket público chamado `fotos`
3. Copie a URL e a anon key
4. Crie `.env`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_KEY=sua_anon_key
   ```
5. No `Dashboard.jsx`, troque `readFileAsDataURL` pelo upload direto ao Supabase Storage

---

## 🌐 Deploy na Vercel (gratuito)

```bash
# 1. Suba o projeto para o GitHub
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/seu-usuario/isabel-lucena.git
git push -u origin main

# 2. Acesse vercel.com → "Add New Project"
# 3. Importe o repositório do GitHub
# 4. Clique em Deploy ✅
```

O arquivo `vercel.json` já está configurado para o React Router funcionar corretamente.

Todo `git push` na branch `main` faz **deploy automático**.

---

## 🔐 Dashboard

- URL: `seusite.com/dashboard`
- Senha padrão: `isabel2025`
- **Troque a senha** em `src/pages/Dashboard.jsx` → procure por `'isabel2025'`
- Para mais segurança em produção, use variável de ambiente:
  ```
  VITE_DASH_PASSWORD=senha_secreta
  ```
  E no código: `if (pw === import.meta.env.VITE_DASH_PASSWORD)`

---

## 📱 Páginas do site

| Rota | Página |
|---|---|
| `/` | Home |
| `/trabalhos` | Meus Trabalhos (filtros) |
| `/galeria/casamentos` | Galeria Casamentos |
| `/galeria/ensaios-estudio` | Galeria Ensaios Estúdio |
| `/galeria/ensaios-externo` | Galeria Ensaios Externo |
| `/galeria/infantil` | Galeria Crianças |
| `/galeria/aniversarios` | Galeria Aniversários |
| `/galeria/batizados` | Galeria Batizados |
| `/galeria/gravidas` | Galeria Grávidas |
| `/dashboard` | Dashboard (protegido) |

---

## 💡 Dicas de personalização com IA gratuita

Use **v0.dev** ou **Claude.ai** com esse prompt:
```
Tenho este componente React com Tailwind: [cole o código]
Adapte para ficar igual a esta imagem: [cole o print do Figma]
Mantenha as classes btn-gold, as cores #0D0D0D e #C9A96E, 
e a fonte Cormorant Garamond.
```

---

## 📦 Dependências

| Pacote | Uso |
|---|---|
| `react-router-dom` | Navegação entre páginas |
| `framer-motion` | Animações (entrada, hover, etc) |
| `yet-another-react-lightbox` | Lightbox ao clicar nas fotos |
| `lucide-react` | Ícones |
| `web-vitals` | Coleta de LCP, CLS, INP, FCP e TTFB |

---

## 📈 Web Vitals

As métricas já são coletadas no cliente e exibidas no console em ambiente de desenvolvimento.

Por padrão, o frontend envia para `POST /api/web-vitals` (Vercel Function já incluída no projeto).

### Persistência em Supabase (recomendado)

1. Execute o SQL em `supabase/web_vitals.sql` no SQL Editor do seu projeto Supabase.
2. No painel da Vercel, adicione as variáveis de ambiente:

```
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
WEB_VITALS_TABLE=web_vitals
```

3. Faça novo deploy.

Com isso, a Function grava os eventos de vitals direto na tabela `web_vitals`.

Para montar dashboards rapidamente (resumo diário, p75 por rota, regressão semanal e top rotas críticas), use as queries em:

`supabase/web_vitals_queries.sql`

Se quiser deixar painéis prontos para consumo direto (views), execute também:

`supabase/web_vitals_views.sql`

Views criadas:
- `public.vw_web_vitals_daily_route_metric`
- `public.vw_web_vitals_core_route_p75_7d`
- `public.vw_web_vitals_weekly_regression`

> Observação: no endpoint atual, os dados também são anexados em `/tmp/web-vitals.csv` para inspeção rápida em runtime (armazenamento efêmero do serverless).

Se as variáveis do Supabase não estiverem configuradas, o endpoint continua funcionando com fallback em `/tmp/web-vitals.csv`.

Para enviar para um endpoint (analytics próprio), configure no `.env`:

```
VITE_WEB_VITALS_ENDPOINT=https://seu-endpoint.com/web-vitals
```

O envio usa `navigator.sendBeacon` quando disponível.
