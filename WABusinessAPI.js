require('dotenv').config();
const url = 'https://graph.facebook.com/v23.0/'+process.env.WA_PHONE_NUMBER_ID+'/messages';

export async function sendReminder(list){
  console.log(list);
  let messages = processMessages(list);
  console.log(messages);
  for(let message of messages){
     console.log(message);
    const body = await prepareBody(message);
    console.log(body);
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

async function prepareBody(message){
  console.log(message.recipient,message.person,message.date,message.time);
const body = {
      "messaging_product":"whatsapp",
      "to":message.recipient,
      "type":"template",
      "template":{
        "name":"appointment_reminder",
        "language":{
          "code":"it"
        },
        "components":JSON.stringify([
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
        ])
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
      messages.push(message);
    }
  }catch(e){
    console.log(e);
  }
  return messages;
}
