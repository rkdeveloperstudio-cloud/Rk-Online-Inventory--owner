console.log("Billing Summary Loaded");


const SUPABASE_URL = "https://ibmwrbpucbbflnxopfwm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibXdyYnB1Y2JiZmxueG9wZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjczNjgsImV4cCI6MjA5ODI0MzM2OH0.hAf6u1Vb8Z45jC2kCLHI3pZvDk2GMNBWY6mfwcCbUts";



let pendingBills=[];

let detailData=[];



// ============================
// SUPABASE GET
// ============================


async function supabaseRequest(url)
{

    let response =
    await fetch(
        url,
        {
            headers:
            {
                "apikey":SUPABASE_KEY,

                "Authorization":
                "Bearer "+SUPABASE_KEY
            }
        }
    );


    if(!response.ok)
    {
        console.log(await response.text());
        return [];
    }


    return await response.json();

}



// ============================
// LOAD SUMMARY
// ============================

async function loadSummary()
{


let url =
`${SUPABASE_URL}/rest/v1/sales_master`
+
`?select=*`
+
`&reconciled=eq.false`
+
`&order=sale_date.asc`;



pendingBills =
await supabaseRequest(url);



if(pendingBills.length===0)
{

document.getElementById("reportPeriod")
.innerText="No Pending Bills";


return;

}



let first =
new Date(
pendingBills[0].sale_date
);



let last =
new Date(
pendingBills[pendingBills.length-1].sale_date
);



document.getElementById("reportPeriod")
.innerText =
first.toLocaleString()
+
" - "
+
last.toLocaleString();



document.getElementById("totalBills")
.innerText =
pendingBills.length;



let total=0;


pendingBills.forEach(x=>
{

total += Number(x.grand_total);

});



document.getElementById("totalSales")
.innerText =
"AED "
+
total.toFixed(2);



}



// ============================
// LOAD DETAILS
// ============================

async function loadDetails()
{


if(pendingBills.length===0)
{
showToast("No pending bills");
return;
}



let ids =
pendingBills.map(x=>x.id);



let url =

`${SUPABASE_URL}/rest/v1/sales_details`
+
`?select=*`
+
`&sale_id=in.(${ids.join(",")})`;



let details =
await supabaseRequest(url);



let items={};



details.forEach(item=>
{


let key =
item.description;



if(!items[key])
{

items[key]=
{

barcode:item.barcode || "",

description:item.description,

qty:0,

amount:0

};

}



items[key].qty +=
Number(item.qty);



items[key].amount +=
Number(item.amount);



});




detailData =
Object.values(items);



showDetails();



}




// ============================
// SHOW HTML TABLE
// ============================

function showDetails()
{


let body =
document.getElementById("detailBody");


body.innerHTML="";



detailData.forEach(item=>
{


body.innerHTML +=
`
<tr>

<td>${item.barcode}</td>

<td>${item.description}</td>

<td>${item.qty}</td>

<td>
AED ${item.amount.toFixed(2)}
</td>

</tr>
`;

});



document
.getElementById("detailBox")
.style.display="block";


}



// ============================
// GENERATE PDF
// ============================

async function generatePDF()
{


const {jsPDF}=window.jspdf;



let pdf =
new jsPDF(
{
orientation:"portrait",
unit:"mm",
format:"a4"
});



let width =
pdf.internal.pageSize.width;



let total=0;



pendingBills.forEach(x=>
{
total += Number(x.grand_total);
});




//
// HEADER
//

pdf.setFillColor(
35,
35,
35
);


pdf.roundedRect(
15,
10,
180,
35,
5,
5,
"F"
);



pdf.setTextColor(
255,
255,
255
);



pdf.setFontSize(18);

pdf.setFont(
"helvetica",
"bold"
);



pdf.text(
"RK BILLING SYSTEM",
width/2,
22,
{
align:"center"
}
);



pdf.setFontSize(12);



pdf.text(
"SALES RECONCILIATION REPORT",
width/2,
31,
{
align:"center"
}
);



pdf.setFontSize(9);


pdf.text(
"Daily Closing Report",
width/2,
38,
{
align:"center"
}
);



pdf.setTextColor(
0,
0,
0
);



let y=60;



//
// SUMMARY
//


pdf.setFontSize(13);


pdf.setFont(
"helvetica",
"bold"
);


pdf.text(
"Sales Summary",
20,
y
);


y+=10;


pdf.setFont(
"helvetica",
"normal"
);



pdf.text(
"From : "+
new Date(
pendingBills[0].sale_date
)
.toLocaleString(),
20,
y
);



y+=7;



pdf.text(
"To : "+
new Date(
pendingBills[pendingBills.length-1].sale_date
)
.toLocaleString(),
20,
y
);



y+=7;



pdf.text(
"Total Bills : "+
pendingBills.length,
20,
y
);



y+=7;



pdf.text(
"Grand Total : AED "+
total.toFixed(2),
20,
y
);



y+=15;




//
// TABLE
//


pdf.autoTable({

startY:y,


head:
[

[
"Barcode",
"Description",
"Qty",
"Amount"
]

],


body:

detailData.map(item=>
[
item.barcode,
item.description,
item.qty,
"AED "+item.amount.toFixed(2)
]),



theme:"grid",



styles:
{

fontSize:9,

cellPadding:4

},



headStyles:
{

fillColor:
[35,35,35],

textColor:
255,

halign:"center",

fontStyle:"bold"

},



columnStyles:
{

0:
{
cellWidth:35,
halign:"center"
},


1:
{
cellWidth:75
},


2:
{
cellWidth:20,
halign:"center"
},


3:
{
cellWidth:40,
halign:"right"
}

}



});





let finalY =
pdf.lastAutoTable.finalY + 15;




//
// TOTAL BOX
//

pdf.setFillColor(
230,
230,
230
);


pdf.roundedRect(
15,
finalY,
180,
18,
3,
3,
"F"
);



pdf.setTextColor(
0,
0,
0
);



pdf.setFont(
"helvetica",
"bold"
);



pdf.setFontSize(13);



pdf.text(
"TOTAL SALES : AED "+total.toFixed(2),
width/2,
finalY+12,
{
align:"center"
}
);





finalY+=35;



//
// FOOTER
//

pdf.setFillColor(
35,
35,
35
);



pdf.roundedRect(
15,
finalY,
180,
25,
4,
4,
"F"
);



pdf.setTextColor(
255,
255,
255
);



pdf.setFontSize(11);



pdf.text(
"RECONCILIATION COMPLETED",
width/2,
finalY+10,
{
align:"center"
}
);



pdf.setFontSize(9);


pdf.text(
"Generated by RK Billing System",
width/2,
finalY+18,
{
align:"center"
}
);




pdf.save(
"Sales_Reconciliation.pdf"
);


}




// ============================
// UPDATE RECONCILED
// ============================


async function markReconciled()
{

    let ids = pendingBills.map(x=>x.id);

    console.log("Updating IDs:",ids);


    let response = await fetch(

        `${SUPABASE_URL}/rest/v1/sales_master?id=in.(${ids.join(",")})`,

        {
            method:"PATCH",

            headers:
            {
                "apikey":SUPABASE_KEY,

                "Authorization":
                "Bearer "+SUPABASE_KEY,

                "Content-Type":"application/json",

                "Prefer":"return=representation"
            },

            body:JSON.stringify(
            {
                reconciled:true
            })
        }

    );


    let result = await response.text();


    console.log(
        "Status:",
        response.status
    );


    console.log(
        "Result:",
        result
    );


    if(response.ok)
    {

        showToast(
            "Reconciliation Completed"
        );


        setTimeout(function()
        {
            location.reload();

        },1500);

    }
    else
    {

        showToast(
            "Update Failed",
            "error"
        );

    }

}

// ============================
// BUTTONS
// ============================


document
.getElementById("detailBtn")
.onclick =
loadDetails;



document
.getElementById("reconcileBtn")
.onclick =
async function()
{

    if(detailData.length===0)
    {
        await loadDetails();
    }


    showConfirm(
        "Do you want to generate PDF and complete reconciliation?",
        async function()
        {
            console.log("RECONCILIATION CONFIRMED");


            // 1. Generate PDF
            await generatePDF();


            // 2. Update Supabase
            await markReconciled();


        }
    );

};


// ============================
// START
// ============================


window.onload =
function()
{

    loadSummary();

};



document
.getElementById("backBtn")
.onclick=function()
{
    window.location.replace("./pos.html");
};





function showToast(message,type="success")
{

    let toast =
    document.getElementById("posToast");


    toast.innerText = message;


    toast.className =
    "pos-toast show "+type;


    setTimeout(()=>{

        toast.className =
        "pos-toast";

    },2500);

}




function showConfirm(message, callback)
{

    let modal = document.createElement("div");


    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background =
    "rgba(0,0,0,0.45)";

    modal.style.backdropFilter =
    "blur(8px)";

    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";

    modal.style.zIndex = "9999";



    modal.innerHTML =

`
<div class="confirm-card">


    <div class="confirm-icon">
        ✓
    </div>


    <h2>
        Reconciliation
    </h2>


    <p>
        ${message}
    </p>



    <div class="confirm-buttons">


        <button id="cancelConfirm"
        class="cancel-btn">
            Cancel
        </button>



        <button id="okConfirm"
        class="confirm-btn">
            Confirm
        </button>


    </div>


</div>



<style>


.confirm-card
{

width:340px;

padding:30px;

border-radius:25px;


background:
linear-gradient(
135deg,
rgba(255,255,255,0.25),
rgba(255,255,255,0.10)
);


backdrop-filter:
blur(20px);


-webkit-backdrop-filter:
blur(20px);



border:
1px solid rgba(255,255,255,0.3);



box-shadow:
0 20px 40px rgba(0,0,0,0.35);



text-align:center;


font-family:
'Segoe UI',
Arial;


color:white;


animation:
popup .25s ease;

}



@keyframes popup
{

from
{
transform:scale(.8);
opacity:0;
}

to
{
transform:scale(1);
opacity:1;
}

}




.confirm-icon
{

width:70px;

height:70px;

margin:auto;

border-radius:50%;


display:flex;

align-items:center;

justify-content:center;



font-size:35px;


color:white;



background:
linear-gradient(
135deg,
#00c6ff,
#0072ff
);



box-shadow:
0 8px 20px rgba(0,114,255,.5);


}



.confirm-card h2
{

margin-top:20px;

font-size:24px;

}



.confirm-card p
{

font-size:15px;

line-height:1.6;


color:white;


}



.confirm-buttons
{

display:flex;

gap:15px;

justify-content:center;

margin-top:25px;

}



.confirm-buttons button
{

padding:12px 25px;

border:none;

border-radius:30px;

font-size:15px;

cursor:pointer;


transition:.25s;


}



.cancel-btn
{

background:
linear-gradient(
135deg,
#757575,
#424242
);


color:white;


}



.confirm-btn
{

background:
linear-gradient(
135deg,
#00c853,
#009624
);


color:white;


}



.confirm-buttons button:hover
{

transform:
translateY(-3px);


box-shadow:
0 8px 20px rgba(0,0,0,.35);


}


</style>

`;



document.body.appendChild(modal);




document
.getElementById("cancelConfirm")
.onclick=function()
{

console.log(
"RECONCILIATION CANCELLED"
);


modal.remove();

};





document
.getElementById("okConfirm")
.onclick=function()
{

modal.remove();


callback();


};


}