import axios from "axios";
import { writeFileSync } from "fs";

const options = {
  method: 'POST',
  url: 'http://192.168.10.10:4000/auth/login',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    username: 'ali',
    password: '@Li1234',
    is_remember: true
  }
};

axios.request(options)
  .then(function (response) {
    console.log("Your cookie:");
    let cookie = response?.headers?.["set-cookie"]?.find((el) => el.startsWith("Bearer"))?.split(";")[0];
    console.log(cookie);
    try {
      writeFileSync("./cookie", cookie ?? "")
      writeFileSync("./me", JSON.stringify(response.data?.data) ?? "");
    } catch (error) {
      console.log("Error in writing cookie", error);
    }
  })
  .catch(function (error) {
    console.error(error);
  });