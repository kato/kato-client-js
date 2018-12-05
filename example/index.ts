import {KatoClient} from "../src";

(async () => {
  const katoClient = new KatoClient("http://localhost:3000/api");
  const api = await katoClient.init();
  console.log(api)
})().catch(err => console.error(err));
