# RDO Inteligente — Método Larissa

Aplicativo web para elaboração, consulta e geração de **Relatórios Diários de Obra (RDO)** em conformidade com as diretrizes da **Oficina Prática: IA na Engenharia Civil** (CONFEA / CREA-SP / Mútua).

Desenvolvido para engenheiros civis e equipes de canteiro, com interface responsiva otimizada para celular, persistência de dados, geração de PDF oficial com assinaturas e estruturação automatizada de relatos de campo por voz ou texto utilizando **Google Gemini AI**.

---

## 🚀 Como Publicar no GitHub e no Netlify

### Passo 1: Publicar no GitHub

1. Abra o terminal na pasta do projeto e inicialize o repositório Git:
   ```bash
   git init
   git add .
   git commit -m "feat: RDO Inteligente - Método Larissa completo"
   ```

2. Crie um novo repositório no seu [GitHub](https://github.com/new) (ex: `rdo-inteligente`).

3. Conecte o repositório local ao GitHub e envie os arquivos:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/rdo-inteligente.git
   git push -u origin main
   ```

---

### Passo 2: Publicar no Netlify

O projeto já inclui o arquivo de configuração `netlify.toml` e as **Netlify Functions** (`netlify/functions/`) prontas para rodar o backend do Gemini sem expor sua chave de API no navegador.

1. Acesse [Netlify](https://app.netlify.com/) e faça login (pode usar sua conta do GitHub).
2. Clique em **"Add new site"** > **"Import an existing project"**.
3. Selecione **GitHub** e escolha o repositório `rdo-inteligente`.
4. As configurações de build serão preenchidas automaticamente pelo `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. **Configurar a Chave da IA (Importante!)**:
   - Antes ou após clicar em Deploy, vá em **Site configuration** > **Environment variables**.
   - Clique em **"Add a variable"**.
   - Nome da variável: `GEMINI_API_KEY`
   - Valor: sua chave da API do Google Gemini ([obtenha gratuitamente no Google AI Studio](https://aistudio.google.com/)).
6. Clique em **"Deploy site"**. Em cerca de 1 minuto, seu app estará no ar com link público HTTPS!

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, jsPDF.
- **Backend / Serverless**: Express no ambiente de desenvolvimento (`server.ts`) e **Netlify Functions** (`netlify/functions/`) em produção.
- **Inteligência Artificial**: SDK oficial `@google/genai` utilizando o modelo `gemini-3.8-flash`.
- **Armazenamento**: LocalStorage com sincronização estruturada por coleções (100% pronta para conexão com Firebase Firestore / Auth).

---

## 📋 Regras de Engenharia do Método Larissa

1. **Acesso Direto**: Abertura direta na tela de autenticação, sem landing pages intermediárias.
2. **Três Abas**: Organização estruturada em *Dados*, *Registro do Dia* e *Fotos e Revisão*.
3. **Precisão Técnica**: A IA só preenche informações estritamente fornecidas, mantendo campos ausentes em branco.
4. **Alerta de Incerteza**: Dúvidas são sinalizadas com `"Requer confirmação: [motivo]"`.
5. **Percentuais Diários**: Percentuais de avanço referem-se à atividade daquele dia, nunca ao avanço total acumulado da obra.
6. **PDF Oficial**: Inclui cabeçalho técnico, tabela de atividades, contagem de efetivo, fotos com legenda e campos formais de assinatura do Responsável Técnico (CREA/CAU) e da Fiscalização/Contratante.

---

## 💻 Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 3000)
npm run dev

# Gerar build de produção
npm run build
```
