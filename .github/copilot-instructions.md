# Copilot Instructions for AI Agents

## Visão Geral do Projeto
Este repositório é um site estático simples, composto principalmente por um arquivo `index.html`, um arquivo de estilos `style.css` e uma pasta `images/` com recursos visuais. Não há frameworks, dependências externas ou scripts de build/teste automatizados.

## Estrutura de Diretórios
- `index.html`: Página principal do site. Contém toda a estrutura HTML.
- `style.css`: Folha de estilos global para o site.
- `images/`: Contém imagens usadas no site. Use nomes de arquivos descritivos e mantenha o padrão existente.

## Convenções e Padrões
- Mantenha o HTML e CSS limpos, sem frameworks ou preprocessadores.
- Utilize caminhos relativos para imagens e recursos.
- Prefira classes CSS descritivas e evite IDs para estilização.
- Não adicione JavaScript a menos que explicitamente solicitado.
- Siga a estrutura visual e semântica já presente no `index.html`.

## Fluxos de Trabalho
- Não há comandos de build, testes ou automações. Basta editar os arquivos e visualizar no navegador.
- Para adicionar imagens, coloque-as em `images/` e use `<img src="images/nome-da-imagem.ext">` no HTML.
- Para novos estilos, adicione ao final de `style.css` e referencie por classes no HTML.

## Exemplos de Padrão
- Inclusão de imagem:
  ```html
  <img src="images/Logo.jpeg" alt="Logo do Covil">
  ```
- Inclusão de estilo:
  ```css
  .destaque {
    color: #ff0000;
    font-weight: bold;
  }
  ```

## Observações
- Não crie subdiretórios adicionais sem necessidade.
- Documente mudanças estruturais diretamente neste arquivo.
- Consulte sempre o `index.html` para entender a hierarquia e semântica do conteúdo.

---

Se adicionar novos padrões ou fluxos, atualize este arquivo para manter a orientação dos agentes.
