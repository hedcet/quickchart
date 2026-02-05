import { Ajv } from "ajv";

const schema = {
  additionalProperties: false,
  properties: {
    charts: {
      items: {
        additionalProperties: true,
        properties: {
          data: {
            additionalProperties: true,
            properties: {
              datasets: {
                items: {
                  additionalProperties: true,
                  properties: {
                    data: {
                      items: {
                        type: "number",
                      },
                      minItems: 1,
                      type: "array",
                    },
                    label: {
                      type: "string",
                    },
                  },
                  required: ["data"],
                  type: "object",
                },
                minItems: 1,
                type: "array",
              },
              labels: {
                items: {
                  type: ["number", "string"],
                },
                minItems: 1,
                type: "array",
              },
            },
            required: ["datasets", "labels"],
            type: "object",
          },
          options: {
            additionalProperties: true,
            type: "object",
          },
          type: {
            enum: ["bar", "doughnut", "line", "pie", "polarArea", "radar"],
            type: "string",
          },
        },
        required: ["data", "type"],
        type: "object",
      },
      minItems: 1,
      type: "array",
    },
    mods: {
      items: { type: "string" },
      minItems: 1,
      type: "array",
    },
    refs: { additionalProperties: { type: "string" }, type: "object" },
  },
  required: ["mods", "charts"],
  type: "object",
};

const ajv = new Ajv({ allErrors: true });
export const validate = ajv.compile(schema);
