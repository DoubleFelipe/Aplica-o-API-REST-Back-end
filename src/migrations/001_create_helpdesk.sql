CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'tecnico')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chamados (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em Atendimento', 'Concluído')),
  prioridade VARCHAR(10) NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta')),
  solicitante_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  tecnico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS chamados_solicitante_idx ON chamados(solicitante_id);
CREATE INDEX IF NOT EXISTS chamados_status_idx ON chamados(status);

CREATE TABLE IF NOT EXISTS comentarios_chamado (
  id SERIAL PRIMARY KEY,
  chamado_id INTEGER NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comentarios_chamado_idx ON comentarios_chamado(chamado_id);
