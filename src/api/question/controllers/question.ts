/**
 * question controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::question.question",
  ({ strapi }) => ({
    async saveAnswerAndGenerateNewQuestion(ctx) {
      // query only answer text
      const requestID = ctx.request.headers["x-request-id"];
      let excludeQuestionIDs = [];

      if (requestID) {
        const answerData = ctx.request.body;
        // check if there is answer data for the current visitor
        const res = await strapi.service("api::answer.answer").find({
          user_id: requestID,
          populate: { answer: { fields: "question_id" } },
        });

        if ((res as any).results && (res as any).results.length > 0) {
          // result exists
          const savedAnswerData = (res as any).results[0];
          excludeQuestionIDs = savedAnswerData.answer.map(
            (item) => item.question_id
          );

          if (answerData.id) {
            // update answer
            const newAnswer = {
              question_id: answerData.id,
              options_checked: answerData.answers.map((item) => ({
                option_id: item,
              })),
            };
            savedAnswerData.answer.push(newAnswer);

            const response = await strapi
              .service("api::answer.answer")
              .update(savedAnswerData.id, {
                data: savedAnswerData,
              });

            excludeQuestionIDs.push(answerData.id);
          }
        } else {
          if (answerData.id) {
            const response = await strapi.service("api::answer.answer").create({
              data: {
                user_id: requestID,
                answer: [
                  {
                    question_id: answerData.id,
                    options_checked: answerData.answers.map((item) => ({
                      option_id: item,
                    })),
                  },
                ],
              },
            });
            excludeQuestionIDs.push(answerData.id);
          }
        }
      }

      const { data } = await super.find({
        query: {
          populate: { options: { fields: "text" } },
          filters: {
            id: { $notIn: excludeQuestionIDs },
          },
        },
      });
      const question = data.length > 0 ? data[0] : null;

      return { data: question };
    },
  })
);
