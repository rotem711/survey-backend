/**
 * question router
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/questions/new",
      handler: "question.saveAnswerAndGenerateNewQuestion",
    },
  ],
};
