const { idParamSchema, idDeleteSchema } = require('./common.schema')

const createUserSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name:     { type: 'string', minLength: 2, maxLength: 255 },
        email:    { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        role_id:  { type: 'integer' },
      },
      additionalProperties: false,
      errorMessage: {
        required: {
          name:     'Le nom est obligatoire',
          email:    "L'email est obligatoire",
          password: 'Le mot de passe est obligatoire',
        },
        properties: {
          name:     'Le nom doit contenir entre 2 et 255 caracteres',
          email:    "L'adresse email n'est pas valide",
          password: 'Le mot de passe doit contenir au moins 6 caracteres',
          role_id:  "L'identifiant du role doit etre un nombre entier",
        },
        additionalProperties: 'Des champs non autorises ont ete envoyes',
      },
    },
  },
}

const updateUserSchema = {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'integer' },
      },
      errorMessage: {
        required: { id: "L'identifiant est obligatoire" },
        properties: { id: "L'identifiant doit etre un nombre entier" },
      },
    },
    body: {
      type: 'object',
      properties: {
        name:    { type: 'string', minLength: 2, maxLength: 255 },
        email:   { type: 'string', format: 'email' },
        status:  { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
        role_id: { type: 'integer' },
      },
      minProperties: 1,
      additionalProperties: false,
      errorMessage: {
        properties: {
          name:    'Le nom doit contenir entre 2 et 255 caracteres',
          email:   "L'adresse email n'est pas valide",
          status:  'Le statut doit etre ACTIVE, SUSPENDED ou BANNED',
          role_id: "L'identifiant du role doit etre un nombre entier",
        },
        minProperties: 'Au moins un champ doit etre fourni',
        additionalProperties: 'Des champs non autorises ont ete envoyes',
      },
    },
  },
}

const getUserSchema = idParamSchema
const deleteUserSchema = idDeleteSchema

module.exports = { createUserSchema, updateUserSchema, getUserSchema, deleteUserSchema }
