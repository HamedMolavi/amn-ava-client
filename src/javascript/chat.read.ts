import axios from "axios";
import { readFile, readFileSync, writeFileSync } from "fs";


try {
  let cookie = readFileSync("./cookie").toString().trim();
  let user = JSON.parse(readFileSync("./me").toString().trim());
  const options = {
    method: 'GET',
    url: 'http://192.168.10.10:4000/chats',
    headers: {
      cookie: cookie,
      'Content-Type': 'application/json'
    },
  };
  axios.request(options)
    .then(function (response) {
      try {
        console.log(response.data?.data);
        // writeFileSync("./chat", JSON.stringify(response.data?.data ?? ""))
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

