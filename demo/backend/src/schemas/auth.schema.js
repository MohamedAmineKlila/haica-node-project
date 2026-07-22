const loginSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email:    { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
      },
      additionalProperties: false,
      errorMessage: {
        required: {
          email:    'L\'email est obligatoire',
          password: 'Le mot de passe est obligatoire',
        },
        properties: {
          email:    'L\'adresse email n\'est pas valide',
          password: 'Le mot de passe doit contenir au moins 6 caracteres',
        },
        additionalProperties: 'Des champs non autorises ont ete envoyes',
      },
    },
  },
}

module.exports = { loginSchema }
