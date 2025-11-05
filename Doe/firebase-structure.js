/* 
ESTRUTURA RECOMENDADA PARA O FIREBASE REALTIME DATABASE

{
  "usuarios": {
    "userId1": {
      "cadastro": {
        "tipo": "PessoaJuridica", // ou "PessoaFisica"
        "PessoaJuridica": {
          "instituicao": "Instituto Caramelo",
          "responsavel": "João Silva",
          "telefone": "(11) 99999-9999",
          "email": "contato@institutocaramelo.org",
          "cnpj": "12.345.678/0001-90",
          "aceitaDoacoes": "Sim", // "Sim" ou "Não"
          "fotoUrl": "https://exemplo.com/foto.jpg",
          "modalidadesDoacao": ["pix", "cartao", "boleto", "itens"],
          "causasAtendidas": ["cao", "gato"] // cao, gato, silvestre
        }
      },
      "localizacao": {
        "cidade": "São Paulo",
        "estado": "SP",
        "cep": "01234-567",
        "endereco": "Rua das Flores, 123",
        "distanciaBase": 15 // km do centro da cidade
      },
      "profile": {
        "createdAt": "2025-11-04T10:00:00Z",
        "lastLogin": "2025-11-04T15:30:00Z",
        "active": true
      }
    }
  },
  "doacoes": {
    "doacaoId1": {
      "doador": "userId2",
      "instituicao": "userId1",
      "valor": 50.00,
      "modalidade": "pix", // pix, cartao, boleto, itens
      "status": "pendente", // pendente, confirmada, cancelada
      "data": "2025-11-04T16:00:00Z",
      "mensagem": "Doação para ração"
    }
  },
  "animais": {
    "animalId1": {
      "nome": "Rex",
      "especie": "cao", // cao, gato, silvestre
      "raca": "Labrador",
      "idade": "2 anos",
      "porte": "grande", // pequeno, medio, grande
      "instituicao": "userId1",
      "disponivel": true,
      "fotos": ["url1", "url2"],
      "descricao": "Cão muito dócil..."
    }
  }
}
*/