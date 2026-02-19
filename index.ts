console.log("server running on port 3002");

export default {
  port: 3000,
  fetch() {
    return new Response("ok");
  },
};