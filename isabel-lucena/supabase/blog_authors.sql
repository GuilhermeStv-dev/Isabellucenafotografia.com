-- Tabela de autores do blog
CREATE TABLE IF NOT EXISTS blog_authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  profissao TEXT,
  bio TEXT,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_blog_authors_ativo ON blog_authors(ativo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_blog_authors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_authors_updated_at
  BEFORE UPDATE ON blog_authors
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_authors_updated_at();

-- Políticas RLS
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de autores ativos
CREATE POLICY "Autores ativos são públicos"
  ON blog_authors
  FOR SELECT
  USING (ativo = true);

-- Permitir gerenciamento por usuários autenticados
CREATE POLICY "Usuários autenticados podem gerenciar autores"
  ON blog_authors
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Adicionar coluna de autor na tabela de posts (chave estrangeira)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS autor_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL,
DROP COLUMN IF EXISTS autor;

COMMENT ON TABLE blog_authors IS 'Armazena os autores do blog';
COMMENT ON COLUMN blog_authors.Nome IS 'Nome completo do autor';
COMMENT ON COLUMN blog_authors.profissao IS 'Profissão/cargo do autor';
COMMENT ON COLUMN blog_authors.bio IS 'Biografia ou descrição curta';
COMMENT ON COLUMN blog_authors.foto_url IS 'URL da foto de perfil do autor';
