const SUPABASE_URL =
"https://ibmwrbpucbbflnxopfwm.supabase.co";


const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibXdyYnB1Y2JiZmxueG9wZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjczNjgsImV4cCI6MjA5ODI0MzM2OH0.hAf6u1Vb8Z45jC2kCLHI3pZvDk2GMNBWY6mfwcCbUts";



let statusTimer = null;



async function downloadItemClear()
{

let status =
document.getElementById("status");


status.innerHTML =
"Sending download request...";


const url =
SUPABASE_URL+
"/rest/v1/item_clear_download_requests";


const response =
await fetch(
url,
{
method:"POST",

headers:
{
apikey:SUPABASE_KEY,

Authorization:
"Bearer "+SUPABASE_KEY,

"Content-Type":
"application/json",

Prefer:
"return=representation"

},

body:JSON.stringify(
{
status:"Pending"
})

});


if(response.ok)
{

const data =
await response.json();


let requestID =
data[0].id;


status.innerHTML =
"Status : Pending";


checkDownloadStatus(requestID);


}
else
{

let errorText =
await response.text();


status.innerHTML =
"Error : "+errorText;

}


}




async function checkDownloadStatus(id)
{


if(statusTimer != null)
{
clearInterval(statusTimer);
}



statusTimer =
setInterval(
async function()
{


const url =
SUPABASE_URL+
"/rest/v1/item_clear_download_requests?id=eq."
+id+
"&select=status";



const response =
await fetch(
url,
{
headers:
{
apikey:SUPABASE_KEY,

Authorization:
"Bearer "+SUPABASE_KEY
}
});



if(response.ok)
{

const data =
await response.json();


if(data.length>0)
{


let currentStatus =
data[0].status;


document.getElementById("status").innerHTML =
"Status : "+currentStatus;



if(currentStatus=="Completed")
{

clearInterval(statusTimer);


document.getElementById("status").innerHTML =
"Status : Completed ✔";

}


}



}



},
3000);


}





async function searchItemClear()
{


let fromDate =
document.getElementById("dateFrom").value;


let toDate =
document.getElementById("dateTo").value;


let counter =
document.getElementById("counterNo").value;



let result =
document.getElementById("itemClearList");



if(fromDate=="" || toDate=="")
{

result.innerHTML =
"Please select date range";

return;

}



result.innerHTML =
"Loading...";



let url =
SUPABASE_URL+
"/rest/v1/item_clear_details"+
"?select=*"+
"&clear_datetime=gte."+fromDate+
"&clear_datetime=lte."+toDate+
"&order=clear_datetime.desc";



if(counter!="")
{

url +=
"&counter_no=eq."+counter;

}




const response =
await fetch(
url,
{
headers:
{
apikey:SUPABASE_KEY,

Authorization:
"Bearer "+SUPABASE_KEY
}

});



if(!response.ok)
{

let err =
await response.text();


result.innerHTML =
"Error : "+err;


return;

}



const data =
await response.json();



displayItemClear(data);



}






function formatDateTime(value)
{

if(!value)
return "-";


let d =
new Date(value);


if(!isNaN(d))
{

return d.toLocaleString(
"en-GB"
);

}


return value;

}






function displayItemClear(data)
{


let result =
document.getElementById("itemClearList");



if(data.length==0)
{

result.innerHTML =
"No item clear found";


return;

}




let html =
`

<table border="1" width="100%">

<tr>

<th>
Counter
</th>

<th>
Date Time
</th>

<th>
Bill No
</th>

<th>
Description
</th>

<th>
Qty
</th>

<th>
Price
</th>

</tr>

`;




data.forEach(row=>{


html +=
`

<tr>

<td>
${row.counter_no}
</td>


<td>
${formatDateTime(row.clear_datetime)}
</td>


<td>
${row.bill_no}
</td>


<td>
${row.description}
</td>


<td>
${row.qty}
</td>


<td>
${row.unit_price}
</td>


</tr>

`;



});



html +=
"</table>";



result.innerHTML =
html;



}





window.onload = function()
{

let today =
new Date();


let yyyy =
today.getFullYear();


let mm =
String(today.getMonth()+1).padStart(2,'0');


let dd =
String(today.getDate()).padStart(2,'0');



let currentDate =
yyyy+"-"+mm+"-"+dd;



document.getElementById("dateFrom").value =
currentDate;


document.getElementById("dateTo").value =
currentDate;


};