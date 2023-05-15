/**
 * question controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::question.question",
  ({ strapi }) => ({
    async checkAnswer(ctx) {
      try {
        ctx.body = "ok";
      } catch (err) {
        ctx.body = err;
      }
    },

    async find(ctx) {
      // query only answer text
      ctx.query = { ...ctx.query, populate: { options: { fields: "text" } } };

      const { data, meta } = await super.find(ctx);

      meta.date = Date.now();

      return { data, meta };
    },
  })
);
