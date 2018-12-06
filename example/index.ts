import {KatoClient} from "../src";

(async () => {
  const katoClient = new KatoClient("http://localhost:3000/api");
  await katoClient.init();
  console.log(katoClient)
})().catch(err => console.error(err));
