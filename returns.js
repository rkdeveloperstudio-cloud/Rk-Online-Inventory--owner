const SUPABASE_URL =
"https://ibmwrbpucbbflnxopfwm.supabase.co";


const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibXdyYnB1Y2JiZmxueG9wZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjczNjgsImV4cCI6MjA5ODI0MzM2OH0.hAf6u1Vb8Z45jC2kCLHI3pZvDk2GMNBWY6mfwcCbUts";



let statusTimer = null;



async function downloadReturns()
{


let status =
document.getElementById("status");



status.innerHTML =
"Sending download request...";



const url =
SUPABASE_URL+
"/rest/v1/return_download_requests";



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


console.log(errorText);


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
"/rest/v1/return_download_requests?id=eq."
+id+
"&select=status";



const response =
await fetch(
url,
{

method:"GET",


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



if(currentStatus=="Processing")
{

document.getElementById("status").innerHTML =
"Status : Processing...";

}



}


}


},
3000);


}


async function searchReturns()
{


let fromDate =
document.getElementById("dateFrom").value;


let toDate =
document.getElementById("dateTo").value;


let counter =
document.getElementById("counterNo").value;



let result =
document.getElementById("returnList");



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
"/rest/v1/sales_return_details"+
"?select=*"+
"&bill_date=gte."+fromDate+
"&bill_date=lte."+toDate+
"&order=bill_date.desc";



if(counter!="")
{

url +=
"&counter_no=eq."+counter;

}




const response =
await fetch(
url,
{

method:"GET",

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



displayReturns(data);



}



function formatTime(value)
{
    if (!value)
        return "-";

    const d = new Date(value);

    // If it's a valid datetime, return only the time
    if (!isNaN(d))
    {
        return d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    // If it's already just a time string (e.g. "13:45:22"), return it
    return value;
}




function displayReturns(data)
{


let result =
document.getElementById("returnList");



if(data.length==0)
{

result.innerHTML =
"No return sales found";

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
Bill No
</th>

<th>
Date
</th>

<th>
Time
</th>

<th>
Amt
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
${row.bill_no}
</td>


<td>
${row.bill_date}
</td>


<td>
${formatTime(row.bill_time)}
</td>


<td>
${row.amount}
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

    let today = new Date();

    let yyyy = today.getFullYear();

    let mm = String(today.getMonth() + 1).padStart(2,'0');

    let dd = String(today.getDate()).padStart(2,'0');


    let currentDate =
        yyyy + "-" + mm + "-" + dd;


    document.getElementById("dateFrom").value =
        currentDate;


    document.getElementById("dateTo").value =
        currentDate;


};