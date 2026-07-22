const { idParamSchema, idDeleteSchema } = require('./common.schema')

const createRoleSchema = {
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
        required: { name: 'Le nom du role est obligatoire' },
        properties: {
          name:        'Le nom doit contenir entre 2 et 100 caracteres',
          description: 'La description ne peut pas depasser 500 caracteres',
        },
        additionalProperties: 'Des champs non autorises ont ete envoyes',
      },
    },
  },
}

const updateRoleSchema = {
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

const getRoleSchema = idParamSchema
const deleteRoleSchema = idDeleteSchema

const syncPermissionsSchema = {
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
      required: ['permissionIds'],
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'integer' },
          minItems: 0,
        },
      },
      additionalProperties: false,
      errorMessage: {
        required: { permissionIds: 'La liste des permissions est obligatoire' },
        properties: {
          permissionIds: 'Les identifiants doivent etre des nombres entiers',
        },
      },
    },
  },
}

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  getRoleSchema,
  deleteRoleSchema,
  syncPermissionsSchema,
}
