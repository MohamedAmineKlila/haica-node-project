const { idParamSchema, idDeleteSchema } = require('./common.schema')

const createPermissionSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name:        { type: 'string', minLength: 2, maxLength: 100 },
        description: { type: 'string', maxLength: 500 },
      },
      additionalProperties: false,
      errorMessage: {
        required: { name: 'Le nom de la permission est obligatoire' },
        properties: {
          name:        'Le nom doit contenir entre 2 et 100 caracteres',
          description: 'La description ne peut pas depasser 500 caracteres',
        },
        additionalProperties: 'Des champs non autorises ont ete envoyes',
      },
    },
  },
}

const updatePermissionSchema = {
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
        name:        { type: 'string', minLength: 2, maxLength: 100 },
        description: { type: 'string', maxLength: 500 },
      },
      minProperties: 1,
      additionalProperties: false,
      errorMessage: {
        properties: {
          name:        'Le nom doit contenir entre 2 et 100 caracteres',
          description: 'La description ne peut pas depasser 500 caracteres',
        },
        minProperties: 'Au moins un champ doit etre fourni',
        additionalProperties: 'Des champs non autorises ont ete envoyes',
      },
    },
  },
}

const getPermissionSchema = idParamSchema
const deletePermissionSchema = idDeleteSchema

module.exports = {
  createPermissionSchema,
  updatePermissionSchema,
  getPermissionSchema,
  deletePermissionSchema,
}
