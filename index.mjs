import crypto from 'crypto'
import https from 'https'
import { Vonage } from '@vonage/server-sdk'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
})

const from = "13212516911"
const to = "15408343982"
const text = 'A hotel is available!' +
"https://registration.experientevent.com/ShowMFS241/Flow/GUEST#!/registrant//RoomSearch/"

const allowLegacyRenegotiationforNodeJsOptions = {
  httpsAgent: new https.Agent({
    // for self signed you could also add
    // rejectUnauthorized: false,
    // allow legacy server
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  }),
};

async function sendSMS() {
  await vonage.sms.send({to, from, text})
      .then(resp => { console.log('Message sent successfully'); console.log(resp); })
      .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

const url = "https://registration.experientevent.com/ShowMFS241/api/RoomSearch";

async function makeRequest(url) {
  return axios({
    ...allowLegacyRenegotiationforNodeJsOptions,
    url,
    headers: {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-exl-flow-code": "GUEST",
      "x-exl-flow-type": "STANDARD",
      "x-exl-task-name": "RoomSearch",
      "Referer": "https://registration.experientevent.com/ShowMFS241/Flow/GUEST",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    method: "Post",
    data: {
      "includeSoldOut": false,
      "arrivalDate": "2024-01-17T00:00:00.000Z",
      "departureDate": "2024-01-21T00:00:00.000Z",
      "numberOfRooms": 1,
      "numberOfGuests": 1,
      "hotelName": "",
      "numberOfRoomsList": [],
      "datesChanged": false,
      "isGradualEngagementAllowed": false
    }
  })
}

const response = await makeRequest(url)
const hotels = response.data.data
const availableHotels = hotels.filter((hotel) => hotel.isSoldOut === 0) 
if(availableHotels.length > 0) {
  sendSMS()
} else {
  console.log("No hotels... sad...")
}

