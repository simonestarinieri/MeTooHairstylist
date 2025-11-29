require('dotenv').config();
const url = 'https://graph.facebook.com/v22.0/'+process.env.WA_PHONE_NUMBER_ID+'/messages';

export async function sendReminder(list){
  let messages = processMessages(list);
  for(let message of messages){
    const body = prepareBody(message);
    const response = await fetch(url,{
      method:'POST',
      headers:{
        'Authorization': process.env.CLOUD_API_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(body),
    });
    const data = await response.json();
    console.log(data);
  }
}

function prepareBody(message){
const body = {
      "messaging_product":"whatsapp",
      "to":message.recipient,
      "type":"template",
      "template":{
        "name":"appointment_reminder",
        "language":{
          "code":"it_IT"
        },
        "components":[
          {
            "type":"body",
            "parameters":[
              {
                "type":"text",
                "text":message.person
              },
              {
                "type":"text",
                "text":message.date
              },
              {
                "type":"text",
                "text":message.time
              }
            ]
          },
        ]
      }
    }
    return body;
}

function processMessages(list){
  const messages = [];
  try{
    for(let element of list){
      let data = JSON.parse(element.description);
      let date = new Date(element.start.dateTime);
      let time = ''+date.getHours()+':'+date.getMinutes();
      date = ''+date.getDate()+'/'+(date.getMonth()+1)+"/"+date.getFullYear();
      const message = {
        "person":element.summary,
        "date":date,
        "time":time,
        "recipient":data.recipient
      }
      console.log(message,data,element);
    }
  }catch(e){
    console.log(e);
  }
  return messages;
}