import axios from "axios";
import { readFile, readFileSync, writeFileSync } from "fs";


try {
  let cookie = readFileSync("./cookie").toString().trim();
  let user = JSON.parse(readFileSync("./me").toString().trim());
  let chat = JSON.parse(readFileSync("./chat").toString().trim());
  const options = {
    method: 'POST',
    url: 'http://192.168.10.10:4000/messages',
    headers: {
      cookie: cookie,
      'Content-Type': 'application/json'
    },
    data: {
      msg: 'hello world',
      chatId: chat._id,
      senderId: user._id,
    }
  };
  axios.request(options)
    .then(function (response) {
      try {
        console.log("new message sent:");
        console.log(response.data?.data._id, ":", response.data?.data.msg)
      } catch (error) {
        console.error(error);
      }
    })
    .catch(function (error) {
      console.error(error);
    });

} catch (error) {
  console.error("Error", error);
}

