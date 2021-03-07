const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://www.iban.com/exchange-rates";


fetchData(url).then( (res) => {
    const html = res.data;
    const $ = cheerio.load(html);
    const statsTable = $('.table.table-bordered.table-hover.downloads > tbody > tr');
    statsTable.each(function() {
        let title = $(this).find('td').text();
        console.log(title);
    });
})

async function fetchData(url){
    console.log("Crawling data...")
    // make http call to url
    let response = await axios(url).catch((err) => console.log(err));

    if(response.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }
    return response;
}

//------------------
let workDir = __dirname+"/dbWorker.js";

const mainFunc = async () => {
  const url = "https://www.iban.com/exchange-rates";
  // fetch html data from iban website
  let res = await fetchData(url);
  if(!res.data){
    console.log("Invalid data Obj");
    return;
  }
  const html = res.data;
  let dataObj = new Object();
  // mount html page to the root element
  const $ = cheerio.load(html);

  let dataObj2 = new Object();
  const statsTable = $('.table.table-bordered.table-hover.downloads > tbody > tr');
  //loop through all table rows and get table data
  statsTable.each(function() {
    let title = $(this).find('td').text(); // get the text in all the td elements
    let newStr = title.split("\t"); // convert text (string) into an array
    newStr.shift(); // strip off empty array element at index 0
    formatStr(newStr, dataObj2); // format array string and store in an object
  });

  return dataObj2;
}

mainFunc().then((res) => {
    // start worker
    const worker = new Worker(workDir); 
    console.log("Sending crawled data to dbWorker...");
    // send formatted data to worker thread 
    worker.postMessage(res);
    // listen to message from worker thread
    worker.on("message", (message) => {
        console.log(message)
    });
});


function formatStr(arr, dataObj){
    // regex to match all the words before the first digit
    let regExp = /[^A-Z]*(^\D+)/ 
    let newArr = arr[0].split(regExp); // split array element 0 using the regExp rule
    dataObj[newArr[1]] = newArr[2]; // store object 
}