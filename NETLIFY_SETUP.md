# 🚀 Configuração do Netlify para IntelliGem

## 📋 Pré-requisitos

1. Conta no [Netlify](https://netlify.com)
2. Conta no [Supabase](https://supabase.com)
3. Node.js 18+ instalado

## 🔧 Configuração do Projeto

### 1. Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Fazer Login no Netlify

```bash
netlify login
```

### 3. Configurar Variáveis de Ambiente

No painel do Netlify, vá em **Site settings > Environment variables** e adicione:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
RESEND_API_KEY=sua_chave_do_resend (opcional)
```

### 4. Deploy Local

```bash
# Desenvolvimento com funções Netlify
npm run netlify:dev

# Build para produção
npm run netlify:build

# Deploy para produção
npm run deploy
```

## 📁 Estrutura de Arquivos

```
netlify/
├── functions/
│   └── blog.js          # API para gerenciar blog
netlify.toml             # Configuração do Netlify
```

## 🔗 Endpoints da API

### Blog
- `GET /.netlify/functions/blog/articles` - Listar artigos
- `GET /.netlify/functions/blog/articles/:id` - Buscar artigo específico
- `POST /.netlify/functions/blog/articles` - Criar artigo
- `PUT /.netlify/functions/blog/articles/:id` - Atualizar artigo
- `DELETE /.netlify/functions/blog/articles/:id` - Deletar artigo

## 🚀 Deploy Automático

O projeto está configurado para deploy automático quando você fizer push para a branch `main` do repositório GitHub.

### Configuração do Deploy

1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

## 🔍 Troubleshooting

### Erro: "Function not found"
- Verifique se o arquivo está em `netlify/functions/`
- Certifique-se de que o Netlify CLI está instalado

### Erro: "SUPABASE_URL não encontrado"
- Verifique as variáveis de ambiente no painel do Netlify
- Para desenvolvimento local, crie um arquivo `.env`

### Erro de CORS
- As funções já estão configuradas com CORS
- Verifique se está usando os endpoints corretos

## 📚 Documentação Adicional

- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Vite Build Tool](https://vitejs.dev/)
