const idParamSchema = {
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
  },
}

const idDeleteSchema = {
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
  },
}

module.exports = { idParamSchema, idDeleteSchema }
