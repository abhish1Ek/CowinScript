import axios from "axios";
import config from "./config";
const axiosRetry = require("axios-retry");
const arg = require("arg");

const args = arg({
  "--public": Boolean,

  "-p": "--public",
});

const isPublic = !!args["--public"];

axiosRetry(axios, {
  retries: 3,
  // retryCondition: (error) => {
  //   // if retry condition is not specified, by default idempotent requests are retried
  //   return error.response.status === 401;
  // },
  // retryDelay: axiosRetry.exponentialDelay,
});
import { Data, Session } from "./types";

const pincodeList = require("./faridabad.json");
const date = "06-05-2021";
const MIN_AGE = 18;

// Make a GET request

const wait = (num: number) =>
  new Promise((res) => {
    setTimeout(() => {
      res("asd");
    }, num);
  });

const VACCINE_REGEX = /COVAXIN/i;
const urlAuth =
  "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin";
const urlPublic =
  "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin";

const url = isPublic ? urlPublic : urlAuth;

const authorization = config.token;
console.log(pincodeList[0].PINCODE, " ", pincodeList.length);

const isAvailable = (session: Session) =>
  session?.available_capacity > 0 && session?.min_age_limit === MIN_AGE;

const eighteenPlusAndCovaxin = [];
const eigteenPlusAndAvailable = [];
const failedPincodes = [];

const checkVaccine = async () => {
  for (let pinObject of pincodeList) {
    // await wait(500);
    const pincode = (pinObject as any).PINCODE;
    // const pincode = 110007;
    let paramData: any = {
      pincode,
      date,
    };

    const params = new URLSearchParams(paramData).toString();

    const parammedUrl = `${url}?${params}`;

    try {
      const response = await axios({
        url: parammedUrl,
        method: "get",
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-IN,en-GB;q=0.9,en;q=0.8,en-US;q=0.7",
          ...(isPublic ? { authorization: authorization } : null),
          "if-none-match": 'W/"a43-OPT6iwVuLW/diUPboHpsJKN9aqI"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
        },
        withCredentials: true,
      });

      const data: Data = response.data;
      console.log("api success for: ", pincode);
      for (let center of data.centers) {
        if (center && center?.sessions) {
          for (let session of center.sessions) {
            const d = {
              pincode,
              capacity: session?.available_capacity,
              date: session?.date,
              name: center.name,
              vaccine: session?.vaccine,
              feeType: center.fee_type,
            };

            if (
              session?.vaccine &&
              VACCINE_REGEX.test(session.vaccine) &&
              isAvailable(session)
            ) {
              eighteenPlusAndCovaxin.push(d);

              console.log(
                "\n\n TRY: ",
                pincode,
                `for ${center.name} on ${session.date}`,
                "\n\n"
              );
            } else if (isAvailable(session)) {
              eigteenPlusAndAvailable.push(d);
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "api fail for->  ",
        pincode,
        " status",
        error?.response?.status
      );
      failedPincodes.push(pincode);
    }
  }

  console.log("eighteenPlusAndCovaxin: ", "\n");
  console.table(eighteenPlusAndCovaxin);

  console.log("eighteenPlusAnyVaccine: ", "\n");
  console.table(eigteenPlusAndAvailable);
  console.log("\n");
  console.log(
    "failedPincodes: ",
    Array.from(
      new Set<number>([...failedPincodes])
    )
  );
};

checkVaccine();
