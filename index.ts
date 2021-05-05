import axios from "axios";
const axiosRetry = require("axios-retry");
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
const date = "05-05-2021";
const MIN_AGE = 18;

// Make a GET request

const wait = (num: number) =>
  new Promise((res) => {
    setTimeout(() => {
      res("asd");
    }, num);
  });

const VACCINE_REGEX = /COVAXIN/i;

const url =
  "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin";

// const authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiI2MWQ4ZWUyOS0xMGNlLTRjYTMtOTA3NS1jYWE0ZGNlMTQ3NTciLCJ1c2VyX2lkIjoiNjFkOGVlMjktMTBjZS00Y2EzLTkwNzUtY2FhNGRjZTE0NzU3IiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo5NzE2NjU4MDM0LCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjUzNDAyOTExNTU0NjkwLCJ1YSI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDExXzJfMykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg4LjAuNDMyNC4xODIgU2FmYXJpLzUzNy4zNiBFZGcvODguMC43MDUuNzQiLCJkYXRlX21vZGlmaWVkIjoiMjAyMS0wNS0wNVQwNjo1MjoxMy40MThaIiwiaWF0IjoxNjIwMTk3NTMzLCJleHAiOjE2MjAxOTg0MzN9.7ZZ7A3EpRlpwyIrisDAGjhhdpBauyRngwhtQqpmeqU4`;
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
          // authorization: authorization,
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
        },
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
