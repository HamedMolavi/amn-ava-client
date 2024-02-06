import axios from "axios";
import { writeFileSync } from "fs";

const options = {
  method: 'POST',
  url: 'http://192.168.10.10:4000/auth/register',
  headers: {
    // cookie: 'Bearer=s%253AfNymtBvatHffa_VGLtGEGpEZY-hOEs90.J%252FdQ%252BrinvoC21hk6V46pvHyzdAsiSlhFt9aPKbd4EIY',
    'Content-Type': 'application/json'
  },
  data: {
    username: 'ali',
    password: '@Li1234',
    email: 'ali@gmail.com',
    firstName: 'ali',
    lastName: 'ali'
  }
};

axios.request(options)
  .then(function (response) {
    let cookie = response?.headers?.["set-cookie"]?.find((el) => el.startsWith("Bearer"))?.split(";")[0];
    console.log("Your cookie:");
    console.log(cookie);
    console.log("Your id:");
    console.log(response.data?.data?._id);
    try {
      writeFileSync("./cookie", cookie ?? "");
      writeFileSync("./me", JSON.stringify(response.data?.data) ?? "");
    } catch (error) {
      console.log("Error in writing file", error);
    }
  })
  .catch(function (error) {
    console.error(error);
  });