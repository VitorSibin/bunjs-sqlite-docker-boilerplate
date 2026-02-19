console.log("server running on port 3002");

export default {
  port: 3002,
  fetch() {
    return new Response("ok");
  },
};