console.log("Inventory PWA Loaded - " + new Date().toLocaleString());

// ===============================
// OPEN BILLING SUMMARY REPORT
// ===============================

document.addEventListener("DOMContentLoaded", function(){

    const reportBtn = document.getElementById("reportBtn");

    console.log("Report Button:", reportBtn);

    if(reportBtn)
    {
        reportBtn.onclick = function()
        {
            console.log("REPORT CLICKED");

            window.location.href = "billing-summary.html";
        };
    }

});


const SUPABASE_URL = "https://ibmwrbpucbbflnxopfwm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibXdyYnB1Y2JiZmxueG9wZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjczNjgsImV4cCI6MjA5ODI0MzM2OH0.hAf6u1Vb8Z45jC2kCLHI3pZvDk2GMNBWY6mfwcCbUts";


const TAX_RATE = 5;

// Printer paper width
let PAPER_WIDTH =
Number(localStorage.getItem("printerWidth")) || 58;


function getPrintableWidth()
{
    return PAPER_WIDTH === 58 ? 48 : 72;
}


function getPrintLeft()
{
    return PAPER_WIDTH === 58 ? 5 : 4;
}


function getPrintRight()
{
    return getPrintLeft() + getPrintableWidth();
}


function getPrintCenter()
{
    return getPrintLeft() + (getPrintableWidth() / 2);
}

let cart = [];

let lastBill = null;


let codeReader;

let scannerRunning=false;




// ===============================
// SUPABASE REQUEST
// ===============================


async function supabaseRequest(url)
{

    const response = await fetch(url,
    {
        headers:
        {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Content-Type":"application/json"
        }
    });


    if(!response.ok)
    {
        console.log(await response.text());
        return [];
    }


    return await response.json();

}





// ===============================
// BARCODE SEARCH
// ===============================


async function searchBarcode()
{

    let barcode =
    document.getElementById("barcodeInput").value.trim();


    if(barcode === "")
        return;



    let url =
    `${SUPABASE_URL}/rest/v1/products?select=*&barcode=eq.${barcode}`;



    let products =
    await supabaseRequest(url);



    if(products.length > 0)
    {

        addToCart(products[0]);

        document.getElementById("barcodeInput").value="";

    }
    else
    {

        showResults([]);

    }



}







// ===============================
// DESCRIPTION SEARCH
// ===============================


async function searchDescription()
{

    let text =
    document.getElementById("searchInput").value.trim();



    if(text.length < 2)
        return;



    let search =
encodeURIComponent(text);


let url =
`${SUPABASE_URL}/rest/v1/products?select=*&description=ilike.*${search}*&limit=50`;


    let products =
    await supabaseRequest(url);



    showResults(products);


}









// ===============================
// SHOW RESULT PANEL
// ===============================


function showResults(products)
{


    let panel =
    document.getElementById("resultPanel");


    let result =
    document.getElementById("results");



    result.innerHTML="";



    if(products.length===0)
    {

        result.innerHTML =
        `
        <div class="product">
        No product found
        </div>
        `;


        panel.classList.add("show");
        panel.classList.remove("collapsed");

        return;

    }



    products.forEach(product =>
    {


        let div =
        document.createElement("div");


        div.className="results-item";



        div.innerHTML=
        `

        <div>

        <b>${product.description}</b>
        <br>

        Barcode: ${product.barcode}

        <br>

        AED ${product.price}

        </div>


        <button>
        ADD
        </button>

        `;



        div.querySelector("button")
        .onclick=function()
        {

            addToCart(product);

        };



        result.appendChild(div);



    });



    panel.classList.add("show");

    panel.classList.remove("collapsed");



}









// ===============================
// ADD TO CART
// ===============================


function addToCart(product)
{


    let existing =
    cart.find(x =>
    x.barcode === product.barcode);



    if(existing)
    {

        existing.qty++;

    }
    else
    {

        cart.push(
        {

            barcode:product.barcode,

            product_id:product.product_id,

            description:product.description,

            price:Number(product.price),

            qty:1

        });

    }



    renderCart();


    hideResults();


    document.getElementById("barcodeInput")
    .focus();


}









// ===============================
// RENDER CART
// ===============================


function renderCart()
{


    let cartDiv =
    document.getElementById("cart");



    cartDiv.innerHTML="";



    cart.forEach((item,index)=>
    {


        let total =
        item.qty * item.price;



        let row =
        document.createElement("div");

        row.className="cart-row";



        row.innerHTML=
        `

        <span>
        ${item.description}
        </span>


        <span class="qty-control">

<button onclick="changeQty(${index},-1)">
−
</button>

<span class="qty-number">
${item.qty}
</span>

<button onclick="changeQty(${index},1)">
+
</button>

</span>


        <span>
        ${item.price.toFixed(2)}
        </span>


        <span>
        ${total.toFixed(2)}
        </span>


        `;



        cartDiv.appendChild(row);



    });



    calculateTotal();


}








// ===============================
// CHANGE QUANTITY
// ===============================


function changeQty(index,value)
{


    cart[index].qty += value;



    if(cart[index].qty<=0)
    {

        cart.splice(index,1);

    }



    renderCart();


}









// ===============================
// CALCULATE TOTAL
// ===============================


function calculateTotal()
{


    let subtotal = 0;



    cart.forEach(item =>
    {

        subtotal +=
        item.qty * item.price;

    });



    let tax =
    subtotal * TAX_RATE / 100;



    let grand =
    subtotal + tax;



    document.querySelector(
    ".total-line:nth-child(1) b")
    .innerText =
    subtotal.toFixed(2);



    document.querySelector(
    ".total-line:nth-child(2) b")
    .innerText =
    tax.toFixed(2);



    document.querySelector(
    ".grand b")
    .innerText =
    grand.toFixed(2);



}








// ===============================
// HIDE RESULT PANEL
// ===============================


function hideResults()
{


    let panel =
    document.getElementById("resultPanel");


    panel.classList.remove("show");

    panel.classList.add("collapsed");


}








// ===============================
// BUTTON EVENTS
// ===============================


document
.getElementById("barcodeBtn")
.onclick =
searchBarcode;



document
.getElementById("searchBtn")
.onclick =
searchDescription;





document
.getElementById("barcodeInput")
.addEventListener(
"keypress",
function(e)
{

    if(e.key==="Enter")
    {
        searchBarcode();
    }

});





document
.getElementById("searchInput")
.addEventListener(
"keypress",
function(e)
{

    if(e.key==="Enter")
    {
        searchDescription();
    }

});


// ===============================
// SAVE BILL
// ===============================


async function saveBill()
{

   if(cart.length === 0)
{
    showToast("Cart is empty");
    return false;
}



    let subtotal = 0;


    cart.forEach(item =>
    {

        subtotal += item.qty * item.price;

    });



    let tax =
    subtotal * TAX_RATE / 100;


    let grandTotal =
    subtotal + tax;



    let invoiceNo =
    "INV" + Date.now();





    let saleMaster =
    {

        invoice_no: invoiceNo,

        sale_date: new Date().toLocaleString("sv-SE"),

        subtotal: subtotal,

        tax_amount: tax,

        grand_total: grandTotal

    };





    let response =
    await fetch(
    `${SUPABASE_URL}/rest/v1/sales_master`,
    {

        method:"POST",

        headers:
        {

            "apikey":SUPABASE_KEY,

            "Authorization":
            "Bearer " + SUPABASE_KEY,

            "Content-Type":
            "application/json",

            "Prefer":
            "return=representation"

        },


        body:
        JSON.stringify(saleMaster)

    });



    if(!response.ok)
    {

        console.log(
        await response.text()
        );

       showToast("Save failed");

return false;

    }





    let saved =
    await response.json();



    let saleID =
    saved[0].id;





  await saveBillDetails(saleID);



lastBill =
{
    invoice_no: invoiceNo,

    items:[...cart],

    subtotal: subtotal,

    tax: tax,

    total: grandTotal
};

localStorage.setItem(
"lastInvoice",
invoiceNo
);

showToast(
"Bill Saved : " + invoiceNo
);


return true;


}


// ===============================
// SAVE DETAILS
// ===============================


async function saveBillDetails(saleID)
{


    let details =
    cart.map(item =>
    {


        return {

            sale_id:saleID,

            product_id:
            item.product_id,


            barcode:
            item.barcode,


            description:
            item.description,


            qty:
            item.qty,


            price:
            item.price,


            amount:
            item.qty *
            item.price

        };


    });






    await fetch(
    `${SUPABASE_URL}/rest/v1/sales_details`,
    {


        method:"POST",


        headers:
        {

            "apikey":SUPABASE_KEY,


            "Authorization":
            "Bearer "+SUPABASE_KEY,


            "Content-Type":
            "application/json"


        },


        body:
        JSON.stringify(details)


    });


}



function clearBill()
{

    cart=[];

    renderCart();

}




// ===============================
// PRINT BILL USING BROWSER PRINT
// ===============================


document
.getElementById("printBtn")
.onclick =
async function()
{

    let saved =
    await saveBill();


    if(saved)
    {

        let receipt =
        createReceiptData();


        await printReceipt(receipt);


        // CLEAR AFTER PRINT
        clearBill();


        document
        .getElementById("barcodeInput")
        .focus();

    }

};



document
.getElementById("reprintBtn")
.onclick =
reprintLastBill;



// ===============================
// LAST BILL REPRINT
// ===============================


async function reprintLastBill()
{

    let invoice =
    localStorage.getItem("lastInvoice");


    if(!invoice)
    {
        showToast("No previous bill");
        return;
    }



    // GET MASTER

    let masterUrl =
    `${SUPABASE_URL}/rest/v1/sales_master?select=*&invoice_no=eq.${invoice}`;


    let master =
    await supabaseRequest(masterUrl);



    if(master.length===0)
    {
        showToast("Bill not found");
        return;
    }



    let saleID =
    master[0].id;



    // GET DETAILS

    let detailUrl =
    `${SUPABASE_URL}/rest/v1/sales_details?select=*&sale_id=eq.${saleID}`;


    let details =
    await supabaseRequest(detailUrl);



    if(details.length===0)
    {
        showToast("Bill items not found");
        return;
    }



    await printOldBill(
    master[0],
    details
);


}


async function printOldBill(master,details)
{





const { jsPDF } = window.jspdf;

let pdf = new jsPDF({
    orientation:"portrait",
    unit:"mm",
    format:[
        PAPER_WIDTH,
        getReceiptHeight({
            items:details
        })
    ]
});

let y = 8;

// Title
pdf.setFont("helvetica", "bold");
pdf.setFontSize(
    PAPER_WIDTH === 58 ? 8 : 9
);

pdf.text(
    "AL QARAT SHOPPING CENTER",
    getPrintCenter(),
    y,
    {align:"center"}
);

y += 5;

pdf.setFont("helvetica", "normal");
pdf.setFontSize(
PAPER_WIDTH === 58 ? 7 : 8
);

pdf.text(
    "Abu Dhabi, UAE",
    getPrintCenter(),
    y,
    {align:"center"}
);

y += 4;

pdf.text(
    "TRN : 100547377000003",
    getPrintCenter(),
    y,
    {align:"center"}
);

y += 4;

pdf.text(
    "Tel : 02 4911949",
    getPrintCenter(),
    y,
    {align:"center"}
);
y += 4;

pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);

y += 5;

pdf.text(
    "Invoice : " + master.invoice_no,
    getPrintLeft(),
    y
);
y += 4;

pdf.text(
    "Date : " + new Date(master.sale_date).toLocaleString(),
    getPrintLeft(),
    y
);

y += 4;

pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);

y += 5;

pdf.setFont("helvetica", "bold");
pdf.text(
    "Item",
    getPrintLeft(),
    y
);

pdf.text(
    "Total",
    getPrintRight(),
    y,
    {align:"right"}
);

y += 3;

pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);

y += 4;

pdf.setFont("helvetica", "normal");

details.forEach(item =>
{

    let lines =
    pdf.splitTextToSize(
        item.description,
        getPrintableWidth() - 16
    );

    pdf.text(
        lines,
        getPrintLeft(),
        y
    );

    y += lines.length * 4;

    pdf.text(
        item.qty + " x " + Number(item.price).toFixed(2),
        getPrintLeft() + 1,
        y
    );

    pdf.text(
        Number(item.amount).toFixed(2),
        getPrintRight(),
        y,
        {
            align:"right"
        }
    );

    y += 6;

});


pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);


y += 5;

pdf.text(
    "Subtotal",
    getPrintLeft(),
    y
);
pdf.text(
    Number(master.subtotal).toFixed(2),
    getPrintRight(),
    y,
    {align:"right"}
);

y += 5;

pdf.text(
    "VAT 5%",
    getPrintLeft(),
    y
);
pdf.text(
    Number(master.tax_amount).toFixed(2),
    getPrintRight(),
    y,
    {align:"right"}
);

y += 5;

pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);

y += 5;

pdf.setFont("helvetica", "bold");
pdf.setFontSize(
PAPER_WIDTH === 58 ? 8 : 10
);

pdf.text(
    "TOTAL",
    getPrintLeft(),
    y
);
pdf.text(
    Number(master.grand_total).toFixed(2),
    getPrintRight(),
    y,
    {align:"right"}
);

y += 6;

pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);

y += 6;

pdf.setFontSize(
PAPER_WIDTH === 58 ? 7 : 8
);
pdf.setFont("helvetica", "normal");

const totalQty =
    details.reduce((sum, item) => sum + Number(item.qty), 0);

pdf.text(
    "Items : " + totalQty,
    getPrintLeft(),
    y
);
y += 6;

pdf.text(
    "Thank You",
    getPrintCenter(),
    y,
    {align:"center"}
);

y += 4;

pdf.text(
    "Visit Again",
    getPrintCenter(),
    y,
    {align:"center"}
);
await printPDF(pdf);
}

// ===============================
// CAMERA SCANNER
// ===============================


async function openScanner()
{

    document
    .getElementById("scannerModal")
    .classList.add("active");


    const video =
    document.getElementById("scannerVideo");


    codeReader =
    new ZXing.BrowserBarcodeReader();


    scannerRunning=true;


    codeReader.decodeFromVideoDevice(
        null,
        video,
        async function(result,error)
        {

            if(result && scannerRunning)
            {

                let barcode=result.text;


                scannerRunning=false;


                closeScanner();


                await scanAddToCart(barcode);

            }

        }
    );

}



function closeScanner()
{


    scannerRunning=false;


    if(codeReader)
    {

        codeReader.reset();

    }


    document
    .getElementById("scannerModal")
    .classList.remove("active");


}





document
.getElementById("scanBtn")
.onclick =
openScanner;



document
.getElementById("closeScanner")
.onclick =
closeScanner;




// ===============================
// SCANNER DIRECT ADD TO CART
// ===============================


async function scanAddToCart(barcode)
{


    let url =
    `${SUPABASE_URL}/rest/v1/products?select=*&barcode=eq.${barcode}`;



    let products =
    await supabaseRequest(url);



    if(products.length > 0)
    {

        addToCart(products[0]);


    }
    else
    {

        showToast(
        "Product not found : " + barcode
        );


    }



}

document
.getElementById("oldBillsBtn")
.onclick=function()
{
    clearOldBillSearch();

    document
    .getElementById("oldBillsPanel")
    .classList.add("active");
};

document
.getElementById("closeOldBills")
.onclick=function()
{
    clearOldBillSearch();

    document
    .getElementById("oldBillsPanel")
    .classList.remove("active");
};

async function searchOldBills()
{


let invoice =
document
.getElementById("oldInvoiceSearch")
.value.trim();



let fromDate =
document
.getElementById("billFromDate")
.value;



let toDate =
document
.getElementById("billToDate")
.value;



let minAmount =
document
.getElementById("amountFrom")
.value;



let maxAmount =
document
.getElementById("amountTo")
.value;



let url =
`${SUPABASE_URL}/rest/v1/sales_master?select=*`;




// Invoice filter

if(invoice !== "")
{

url +=
`&invoice_no=ilike.*${invoice}*`;

}




// Date filter

if(fromDate !== "")
{

url +=
`&sale_date=gte.${fromDate} 00:00:00`;

}



if(toDate !== "")
{

url +=
`&sale_date=lte.${toDate} 23:59:59`;

}




// Amount filter

if(minAmount !== "")
{

url +=
`&grand_total=gte.${minAmount}`;

}



if(maxAmount !== "")
{

url +=
`&grand_total=lte.${maxAmount}`;

}




url +=
`&order=created_at.desc`;



let bills =
await supabaseRequest(url);



document.getElementById("oldBillsPanel").classList.remove("active");

document.getElementById("oldBillResultPage").classList.add("active");

showOldBillCards(bills);
clearOldBillSearch();
}






function showOldBillCards(bills)
{
    const div = document.getElementById("oldBillResults");

    div.innerHTML = "";

    if (bills.length === 0)
    {
        div.innerHTML = "<h3 style='text-align:center'>No Bills Found</h3>";
        return;
    }

    bills.forEach(bill =>
    {
        const card = document.createElement("div");

        card.className = "old-bill-item";

        card.innerHTML = `
            <div class="old-bill-info">
                <b>Invoice :</b> ${bill.invoice_no}<br>
                <b>Date :</b> ${new Date(bill.sale_date).toLocaleString()}<br>
                <b>Total :</b> AED ${Number(bill.grand_total).toFixed(2)}
            </div>

            <button>Select</button>
        `;

        card.querySelector("button").onclick = function ()
        {
            document.getElementById("oldBillResultPage").classList.remove("active");

            loadOldBill(bill.id);
        };

        div.appendChild(card);
    });
}



document
.getElementById("findOldBillBtn")
.onclick=
searchOldBills;


async function loadOldBill(id)
{


let master =
await supabaseRequest(
`${SUPABASE_URL}/rest/v1/sales_master?select=*&id=eq.${id}`
);



let details =
await supabaseRequest(
`${SUPABASE_URL}/rest/v1/sales_details?select=*&sale_id=eq.${id}`
);



let receipt =
{

store:
{
name:"AL QARAT SHOPPING CENTER",
address:"Abu Dhabi, UAE",
trn:"100547377000003",
phone:"02 4911949"
},


invoice:
{
number:master[0].invoice_no,

date:new Date(master[0].sale_date)
.toLocaleString()
},


items:

details.map(item=>
({

description:item.description,

qty:Number(item.qty),

price:Number(item.price),

amount:Number(item.amount)

})),



totals:
{

subtotal:Number(master[0].subtotal),

tax:Number(master[0].tax_amount),

total:Number(master[0].grand_total)

}


};



await printReceipt(receipt);

}


document.getElementById("closeResultPage").onclick = function ()
{
    document.getElementById("oldBillResultPage").classList.remove("active");
};


let home =
document.getElementById("homeBtn");

if(home)
{
    home.onclick=function()
    {
        window.location.href="./index.html";
    };
}




const printerSelect =
document.getElementById("printerWidth");


if(printerSelect)
{

    printerSelect.value = PAPER_WIDTH;


  printerSelect.onchange = function()
{
    PAPER_WIDTH = Number(this.value);

    localStorage.setItem(
        "printerWidth",
        PAPER_WIDTH
    );

    showToast(
        "Printer set to "
        + PAPER_WIDTH +
        "mm (Printable area "
        + getPrintableWidth()
        + "mm)"
    );
};

}


async function printPDF(pdf)
{
    const blob = pdf.output("blob");

    const url = URL.createObjectURL(blob);


    const printWindow = window.open(
        url,
        "_blank"
    );


    if(!printWindow)
    {
        showToast("Please allow popup for printing");
        return;
    }


    printWindow.onload = function()
    {
        printWindow.focus();
        printWindow.print();
    };


}

function createReceiptData()
{

    let subtotal = 0;


    cart.forEach(item =>
    {
        subtotal += item.qty * item.price;
    });


    let tax =
    subtotal * TAX_RATE / 100;


    let total =
    subtotal + tax;



    return {

        store:
        {
            name:"AL QARAT SHOPPING CENTER",
            address:"Abu Dhabi, UAE",
            trn:"100547377000003",
            phone:"02 4911949"
        },


        invoice:
        {
            number:lastBill.invoice_no,
            date:new Date().toLocaleString()
        },


        items:

        cart.map(item =>
        ({

            description:item.description,

            qty:Number(item.qty),

            price:Number(item.price),

            amount:
            Number(item.qty * item.price)

        })),


        totals:
        {

            subtotal:subtotal,

            tax:tax,

            total:total

        }


    };

}




async function printReceipt(receipt)
{

const { jsPDF } = window.jspdf;


let pdf = new jsPDF({

    orientation:"portrait",

    unit:"mm",

    format:[
PAPER_WIDTH,
getReceiptHeight(receipt)
]

});


let y = 8;



// HEADER

pdf.setFont(
"helvetica",
"bold"
);


pdf.setFontSize(
    PAPER_WIDTH === 58 ? 8 : 10
);


let title =
pdf.splitTextToSize(
receipt.store.name,
getPrintableWidth()
);

pdf.text(
title,
getPrintCenter(),
y,
{
align:"center"
});

y += title.length * 4;


pdf.setFont(
"helvetica",
"normal"
);


pdf.setFontSize(
PAPER_WIDTH === 58 ? 7 : 8
);


pdf.text(
receipt.store.address,
getPrintCenter(),
y,
{
align:"center"
}
);


y+=4;


pdf.text(
"TRN : "+receipt.store.trn,
getPrintCenter(),
y,
{
align:"center"
}
);


y+=4;


pdf.text(
"Tel : "+receipt.store.phone,
getPrintCenter(),
y,
{
align:"center"
}
);



y+=5;



pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);


y+=5;



// INVOICE


pdf.text(
"Invoice : "+receipt.invoice.number,
getPrintLeft(),
y
);



y+=4;


pdf.text(
"Date : "+receipt.invoice.date,
getPrintLeft(),
y
);



y+=5;


pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);


// HEADER ITEM


y+=5;


pdf.setFont(
"helvetica",
"bold"
);


pdf.text(
"Item",
getPrintLeft(),
y
);



pdf.text(
"Total",
getPrintRight(),
y,
{
align:"right"
}
);



y+=3;


pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);


y+=5;



pdf.setFont(
"helvetica",
"normal"
);



// ITEMS


receipt.items.forEach(item =>
{

    let lines =
    pdf.splitTextToSize(
        item.description,
        getPrintableWidth() - 16
    );

    pdf.text(
        lines,
        getPrintLeft(),
        y
    );

    y += lines.length * 4;

    pdf.text(
        `${item.qty} x ${item.price.toFixed(2)}`,
        getPrintLeft() + 1,
        y
    );

    pdf.text(
        Number(item.amount).toFixed(2),
        getPrintRight(),
        y,
        {
            align:"right"
        }
    );

    y += 6;

});


// TOTALS


pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);


y+=5;



pdf.text(
"Subtotal",
getPrintLeft(),
y
);


pdf.text(
receipt.totals.subtotal.toFixed(2),
getPrintRight(),
y,
{
align:"right"
}
);



y+=5;


pdf.text(
"VAT 5%",
getPrintLeft(),
y
);


pdf.text(
receipt.totals.tax.toFixed(2),
getPrintRight(),
y,
{
align:"right"
}
);



y+=5;


pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);


y+=5;



pdf.setFont(
"helvetica",
"bold"
);


pdf.setFontSize(
PAPER_WIDTH === 58 ? 8 : 10
);


pdf.text(
"TOTAL",
getPrintLeft(),
y
);


pdf.text(
receipt.totals.total.toFixed(2),
getPrintRight(),
y,
{
align:"right"
}
);


y+=7;



pdf.line(
getPrintLeft(),
y,
getPrintRight(),
y
);


y+=6;


pdf.setFontSize(
PAPER_WIDTH === 58 ? 7 : 8
);


pdf.text(
"Thank You",
getPrintCenter(),
y,
{
align:"center"
}
);


y+=5;


pdf.text(
"Visit Again",
getPrintCenter(),
y,
{
align:"center"
}
);



await printPDF(pdf);


}






let printMode =
document.getElementById("printMode");


if(printMode)
{

let settings =
loadPrinterSettings();


printMode.value =
settings.PrintMode;



printMode.onchange=function()
{

PrinterService.setMode(
this.value
);


showToast(
"Print Mode : "+this.value
);


};


}




function getReceiptHeight(receipt)
{
    let height = 75;

    receipt.items.forEach(item =>
    {
        let maxChars = PAPER_WIDTH === 58 ? 22 : 36;

        let lines = Math.ceil(
            item.description.length / maxChars
        );

        height += (lines * 4) + 8;
    });

    height += 40;

    return height;
}



function showToast(message,type="success")
{

    let toast =
    document.getElementById("posToast");


    toast.innerText = message;


    toast.className =
    "pos-toast show "+type;


    setTimeout(()=>{

        toast.className="pos-toast";

    },2500);

}


function clearOldBillSearch()
{
    document.getElementById("oldInvoiceSearch").value = "";

    document.getElementById("billFromDate").value = "";

    document.getElementById("billToDate").value = "";

    document.getElementById("amountFrom").value = "";

    document.getElementById("amountTo").value = "";
}
