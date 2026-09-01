const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: { title: 'HelpDesk API', version: '1.0.0', description: 'API REST de gestão de chamados e suporte técnico.' },
    servers: [{ url: '/api/v1', description: 'Servidor atual' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        AuthInput: { type: 'object', required: ['email', 'senha'], properties: { email: { type: 'string', format: 'email' }, senha: { type: 'string', format: 'password', minLength: 8 } } },
        RegisterInput: { allOf: [{ $ref: '#/components/schemas/AuthInput' }, { type: 'object', required: ['nome'], properties: { nome: { type: 'string' } } }] },
        ChamadoInput: { type: 'object', required: ['titulo', 'descricao'], properties: { titulo: { type: 'string' }, descricao: { type: 'string' }, prioridade: { type: 'string', enum: ['Baixa', 'Média', 'Alta'] } } },
        Chamado: { type: 'object', properties: { id: { type: 'integer' }, titulo: { type: 'string' }, descricao: { type: 'string' }, status: { type: 'string', enum: ['Aberto', 'Em Atendimento', 'Concluído'] }, prioridade: { type: 'string' }, solicitante_id: { type: 'integer' }, tecnico_id: { type: 'integer', nullable: true } } },
        Error: { type: 'object', properties: { message: { type: 'string' } } }
      }
    },
    paths: {
      '/auth/register': { post: { tags: ['Autenticação'], summary: 'Cadastra um usuário', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } }, responses: { 201: { description: 'Usuário criado' }, 409: { description: 'E-mail já cadastrado' } } } },
      '/auth/login': { post: { tags: ['Autenticação'], summary: 'Gera token JWT', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthInput' } } } }, responses: { 200: { description: 'Token gerado' }, 401: { description: 'Credenciais inválidas' } } } },
      '/auth/me': { get: { tags: ['Autenticação'], summary: 'Perfil autenticado', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Perfil' } } } },
      '/chamados': {
        get: { tags: ['Chamados'], summary: 'Lista chamados visíveis ao usuário', security: [{ bearerAuth: [] }], parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['Aberto', 'Em Atendimento', 'Concluído'] } }], responses: { 200: { description: 'Lista de chamados' } } },
        post: { tags: ['Chamados'], summary: 'Abre chamado', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChamadoInput' } } } }, responses: { 201: { description: 'Chamado aberto', content: { 'application/json': { schema: { $ref: '#/components/schemas/Chamado' } } } } } }
      },
      '/chamados/{id}': {
        get: { tags: ['Chamados'], summary: 'Obtém chamado e comentários', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Chamado' }, 404: { description: 'Não encontrado' } } },
        patch: { tags: ['Chamados'], summary: 'Atualiza status (técnico)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['Aberto', 'Em Atendimento', 'Concluído'] } } } } } }, responses: { 200: { description: 'Chamado atualizado' }, 403: { description: 'Apenas técnico' } } }
      },
      '/chamados/{id}/comentarios': { post: { tags: ['Comentários'], summary: 'Adiciona comentário ao chamado', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['mensagem'], properties: { mensagem: { type: 'string' } } } } } }, responses: { 201: { description: 'Comentário criado' } } } }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
