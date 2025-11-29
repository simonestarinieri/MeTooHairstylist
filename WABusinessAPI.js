require('dotenv').config();
const url = 'https://graph.facebook.com/v22.0/'+process.env.WA_PHONE_NUMBER_ID+'/messages';
async function sendReminder(recipient){
    console.log(process.env.WA_PHONE_NUMBER_ID)
  const response = await fetch(url,{
    method:'POST',
    headers:{
      'Authorization': process.env.CLOUD_API_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    body:'{ \"messaging_product\": \"whatsapp\", \"to\": \"'+recipient+'\", \"type\": \"template\", \"template\": { \"name\": \"appointment_reminder\", \"language\": { \"code\": \"it_IT\" } } }'
  });
  const data = await response.json();
  console.log(data);
}
sendReminder();