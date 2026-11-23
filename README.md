# TopCar frontend

Aplicação Vue 3 + Vite + TypeScript + Quasar para o catálogo público e o painel da equipe. A arquitetura usa `boot/axios.ts` para o cliente HTTP, `services` para chamadas à API, `stores` para a sessão, `composables` para acesso reutilizável e `router/routes.ts` para a navegação. A API valida autenticação e permissões; o guard do router serve à experiência de navegação.

## Rotas

- `/`: início com busca e veículos em destaque.
- `/estoque`: catálogo público com filtros de marca, modelo, ano e intervalo de valor, ordenação e paginação.
- `/contato`: endereço, horários e WhatsApp comercial.
- `/vehicles/:slug`: detalhe público com contato pelo WhatsApp.
- `/administracao/entrar`: login da equipe com JWT Bearer.
- `/administracao`: painel inicial de administradores e vendedores.
- `/administracao/veiculos`: lista com Código, Marca, Modelo, filtros por nome ou código, marca e status, menu de ações e acesso à edição. Troca e baixa não aparecem nessa lista; o estoque conserva os registros.
- `/administracao/veiculos/novo` e `/administracao/veiculos/:id`: cadastro e edição de dados, preços, características e fotos. Apenas administradores criam ou alteram a publicação.
- `/administracao/estoque`: consulta com filtros por nome, marca, ano e situação.
- `/administracao/estoque/saida`: seleção de até 100 veículos disponíveis para registrar uma saída em lote; apenas administradores podem acessar.
- `/administracao/usuarios`: gestão de acessos, disponível apenas para administradores.
- Outras URLs: página 404.

## Desenvolvimento

1. `npm ci`
2. Configure `VITE_API_BASE_URL` se a API não estiver em `http://localhost:5231`. Veja `.env.example`.
3. `npm run dev`
4. `npm run build` para conferir tipos e bundle de produção.

O backend deve permitir a origem do Vite em `Cors:Origins` e estar preparado com SQL Server, migrations e `Jwt__Secret`. O login envia `email` e `senha`, guarda o token em `localStorage` e o Axios envia `Authorization: Bearer <token>`. `/me` sincroniza o usuário ao abrir o app. Sair chama `POST /api/autenticacao/sair`, que invalida os tokens atuais do usuário, e remove a sessão local. Não há refresh token.

Em desenvolvimento, o backend usa o banco isolado `(localdb)\MSSQLLocalDB` / `TopCarDemo`. O seed em `../Topcar_backEnd/tools/TopCar.DemoSeed` cria cinco veículos ilustrativos, marcados como demonstração e sem botão de interesse por veículo. Os filtros de marca, modelo e ano são derivados apenas dos veículos publicados e disponíveis. Para atualizar a senha do administrador local solicitado, execute o seed com `TOPCAR_DEMO_ADMIN_PASSWORD` definido no ambiente; a senha não fica no código.

O site público usa a identidade TopCar e uma estrutura de concessionária com as seções Início, Estoque e Contato. Não há financiamento nem checkout.

## Marcas e detalhes dos veículos

`GET /api/marcas` reúne as marcas públicas da Asetrix com 54 nomes locais de reserva. A lista alimenta o cadastro administrativo; a home cruza os logos com `/api/veiculos/filtros`, mostrando somente marcas com veículos publicados e disponíveis. A home exibe logo apenas quando a Asetrix informa `hasLogo=true` e a imagem carrega; caso contrário, mostra somente o nome. Não há arquivos locais de logos de marcas. A tabela `MarcasVeiculos` é removida pela migration `RemoverTabelaMarcas`; o catálogo de nomes de reserva permanece em `../Topcar_backEnd/src/TopCar.Infra.Data/Marcas/brand-catalog.json`.

O formulário de veículos oferece características agrupadas e uma descrição livre opcional. `src/config/vehicleFeatures.ts` contém os rótulos em português e aliases para traduzir termos comuns recebidos em inglês. A Webmotors usa campos separados para itens/opcionais e observações, mas não foi encontrado um vocabulário público obrigatório; por isso, esta lista é própria da TopCar.
