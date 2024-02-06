import axios from "axios";
import { readFile, readFileSync, writeFileSync } from "fs";


try {
  let cookie = readFileSync("./cookie").toString().trim();
  let user = JSON.parse(readFileSync("./me").toString().trim());
  const options = {
    method: 'POST',
    url: 'http://192.168.10.10:4000/chats',
    headers: {
      cookie: cookie,
      'Content-Type': 'application/json'
    },
    data: {
      user1Id: '65a911b822301e329b97ff4b',
      user2Id: user._id,
      type: 'private',
    }
  };
  axios.request(options)
    .then(function (response) {
      try {
        console.log("Your chat id:");
        console.log(response.data?.data._id)
        writeFileSync("./chat", JSON.stringify(response.data?.data ?? ""))
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

