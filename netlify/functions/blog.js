const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuração do Supabase não encontrada' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { httpMethod, path } = event;
    const pathSegments = path.split('/').filter(Boolean);
    const [, , action, id] = pathSegments;

    switch (httpMethod) {
      case 'GET':
        if (action === 'articles') {
          if (id) {
            // Buscar artigo específico
            const { data, error } = await supabase
              .from('articles')
              .select('*')
              .eq('id', id)
              .single();

            if (error) {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Artigo não encontrado' }),
              };
            }

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(data),
            };
          } else {
            // Listar artigos
            const { data, error } = await supabase
              .from('articles')
              .select('*')
              .order('created_at', { ascending: false });

            if (error) {
              return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Erro ao buscar artigos' }),
              };
            }

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(data),
            };
          }
        }
        break;

      case 'POST':
        if (action === 'articles') {
          const body = JSON.parse(event.body);
          const { data, error } = await supabase
            .from('articles')
            .insert([body])
            .select()
            .single();

          if (error) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Erro ao criar artigo' }),
            };
          }

          return {
            statusCode: 201,
            headers,
            body: JSON.stringify(data),
          };
        }
        break;

      case 'PUT':
        if (action === 'articles' && id) {
          const body = JSON.parse(event.body);
          const { data, error } = await supabase
            .from('articles')
            .update(body)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Erro ao atualizar artigo' }),
            };
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
          };
        }
        break;

      case 'DELETE':
        if (action === 'articles' && id) {
          const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);

          if (error) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Erro ao deletar artigo' }),
            };
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Artigo deletado com sucesso' }),
          };
        }
        break;

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Método não permitido' }),
        };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint não encontrado' }),
    };

  } catch (error) {
    console.error('Erro na função:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
};
