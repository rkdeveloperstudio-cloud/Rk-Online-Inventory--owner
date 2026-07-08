console.log("Sales page loaded");


const SUPABASE_URL =
"https://ibmwrbpucbbflnxopfwm.supabase.co";


const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibXdyYnB1Y2JiZmxueG9wZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjczNjgsImV4cCI6MjA5ODI0MzM2OH0.hAf6u1Vb8Z45jC2kCLHI3pZvDk2GMNBWY6mfwcCbUts";


// =============================
// LOAD LAST SALES SUMMARY
// =============================

async function loadSalesSummary(){


    const url =
    `${SUPABASE_URL}/rest/v1/sales_summary?select=*&order=updated_at.desc&limit=1`;


    const response = await fetch(url,{

        headers:{
            apikey:SUPABASE_KEY,
            Authorization:"Bearer " + SUPABASE_KEY
        }

    });


    const data = await response.json();


    console.log("Sales Summary:",data);


    if(data.length === 0){

        document.getElementById("salesAmount").innerHTML =
        "No Data";

        return;

    }


    document.getElementById("salesAmount").innerHTML =
    Number(data[0].total_sales)
    .toLocaleString(
        "en-US",
        {
            minimumFractionDigits:2
        }
    );


    document.getElementById("updatedTime").innerHTML =
    "Last Updated : "
    + new Date(data[0].updated_at)
    .toLocaleString();


}



// =============================
// SEND REFRESH REQUEST
// =============================

async function refreshSales(){


    const loading =
    document.getElementById("loading");


    loading.style.display="block";


    const url =
    `${SUPABASE_URL}/rest/v1/sales_refresh_requests`;



    const response = await fetch(url,{

        method:"POST",

        headers:{

            apikey:SUPABASE_KEY,

            Authorization:
            "Bearer " + SUPABASE_KEY,

            "Content-Type":
            "application/json",

            Prefer:
            "return=representation"

        },


        body:JSON.stringify({

            status:"Pending"

        })

    });



    const requestData =
    await response.json();



    console.log(
        "Request:",
        requestData
    );



    if(!response.ok){

        alert("Request failed");

        loading.style.display="none";

        return;

    }



    const requestID =
    requestData[0].id;



    // wait for VB.NET completion

    await waitForCompletion(requestID);



    // reload latest amount

    await loadSalesSummary();



    loading.style.display="none";


}

async function waitForCompletion(id){


    while(true){


        const url =
        `${SUPABASE_URL}/rest/v1/sales_refresh_requests?id=eq.${id}&select=status`;



        const response =
        await fetch(url,{

            headers:{

                apikey:SUPABASE_KEY,

                Authorization:
                "Bearer " + SUPABASE_KEY

            }

        });



        const data =
        await response.json();



        console.log(
            "Status:",
            data
        );



        if(data.length > 0 &&
           data[0].status === "Completed")
        {

            break;

        }



        // wait 3 seconds

        await new Promise(
            resolve => setTimeout(resolve,3000)
        );


    }


}

// START

loadSalesSummary();