export const fastHook = (fastify: any) => {
  fastify.addHook('onError', async (request, reply, error) => {
    console.log(request, reply, error);
  });
};
