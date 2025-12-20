const id = document.querySelector('#name');
const prev = document.getElementById('previous');
const next = document.getElementById('next');
const today = document.getElementById('today');
const selector = document.querySelector('#person');
const form = document.querySelector('#calendarHeader');
const timeTable = document.getElementById('#calendar');

const formData = new FormData(form);
var date = new Date();
const dateOptions = {
  weekday: "short",
  day: "numeric",
};
selector.addEventListener('change',async (e)=>{
  e.preventDefault();
  await refreshCalendar(date,formData.get('person'))
});
prev.addEventListener('click',async (e) => {
    // prevent the form from submitting
    e.preventDefault();
    prev.disabled=true;
    setTimeout(()=>prev.disabled=false,250)
    date.setDate(date.getDate()-7);
    await refreshCalendar(date,formData.get('person'));
});
next.addEventListener('click',async (e) => {
    // prevent the form from submitting
    e.preventDefault();
    next.disabled=true;
    setTimeout(()=>next.disabled=false,250)
    date.setDate(date.getDate()+7);
    await refreshCalendar(date,formData.get('person'));
});
today.addEventListener('click',async (e) => {
    // prevent the form from submitting
    e.preventDefault();
    today.disabled=true;
    setTimeout(()=>today.disabled=false,250)
    date = new Date();
    await refreshCalendar(date,formData.get('person'));
});

const func = async () => {
  const response = await window.data.ping()
  console.log(response) // prints out 'pong'
}

const createCalendar = async (startDate,id='primary')=>{
  let events = await window.calendar.getEvents({'day':startDate,'id':id});
  console.log(startDate,events)
  let start = getMonday(startDate);
  for(let i = 0;i<8;i++){
    if(i==0){
      let timesHeader = document.createElement('div');
      timesHeader.id='times';
      let blankSquare = document.createElement('div');
      blankSquare.id='blank';
      blankSquare.className='hourHeader';
      timesHeader.appendChild(blankSquare);
      document.getElementById('calendarBody').appendChild(timesHeader);
    }else{
      var node = document.createElement('div');
      node.id=start.toDateString();
      node.className="day";
      let nodeHeader = document.createElement('div');
      nodeHeader.className='dayHeader';
      nodeHeader.innerHTML=start.toLocaleDateString('it-IT',dateOptions);
      node.appendChild(nodeHeader)
      document.getElementById('calendarBody').appendChild(node)
    }
    for(let j = 0;j<17;j++){
      if(i==0){
        let times=document.createElement('div');
        times.className='hourHeader '+j;
        times.innerHTML=j+6+':30';
        document.getElementById('times').appendChild(times);
      }else{
        start.setHours(j+7,30,0,0);
        let timeNode = document.createElement('div');
        timeNode.id=start.toISOString();
        timeNode.className="hour "+j;
        timeNode.onclick=async function(start){await createAppointment(start)}
        node.appendChild(timeNode);
      }
    }
    start.setDate(start.getDate()+1);
  }
  for(let event of events){
    let id = new Date(event.start.dateTime).toISOString();
    const appointment=document.createElement('button');
    appointment.innerHTML=event.summary;
    appointment.id=event.id;
    appointment.onclick = async function(){await showAppointment(event.id)};
    document.getElementById(id).appendChild(appointment);
  }
}
const createAppointment = async (start)=>{
  window.calendar.create(start);
}
const refreshCalendar = async (d,id) =>{
  document.getElementById('calendarBody').innerHTML='';
  let day = new Date(d);
  await createCalendar(day,id)
}
const showAppointment=async (id)=>{
  console.log(id);
}
function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    var res = new Date(d.setDate(diff));
    res.setHours(5,0,0,0);
    return res;
}

const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${data.chrome()}), Node.js (v${data.node()}), and Electron (v${data.electron()})`
func()
createCalendar(date)