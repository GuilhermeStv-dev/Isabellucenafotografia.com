-- Tabela de posts do blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  imagem_capa TEXT NOT NULL,
  autor TEXT DEFAULT 'Isabel Lucena Fotografia',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_ativo ON blog_posts(ativo);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de posts ativos
CREATE POLICY "Posts ativos são públicos"
  ON blog_posts
  FOR SELECT
  USING (ativo = true);

-- Permitir todas as operações para usuários autenticados
CREATE POLICY "Usuários autenticados podem gerenciar posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comentários na tabela
COMMENT ON TABLE blog_posts IS 'Armazena os posts do blog';
COMMENT ON COLUMN blog_posts.slug IS 'URL amigável única para o post';
COMMENT ON COLUMN blog_posts.excerpt IS 'Resumo do post (150-200 caracteres)';
COMMENT ON COLUMN blog_posts.conteudo IS 'Conteúdo completo do post em HTML';
COMMENT ON COLUMN blog_posts.imagem_capa IS 'URL da imagem de capa do post';
