console.log(
    "Inventory PWA Loaded - " +
    new Date().toLocaleString()
);


const SUPABASE_URL =
"https://ibmwrbpucbbflnxopfwm.supabase.co";


const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibXdyYnB1Y2JiZmxueG9wZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjczNjgsImV4cCI6MjA5ODI0MzM2OH0.hAf6u1Vb8Z45jC2kCLHI3pZvDk2GMNBWY6mfwcCbUts";


const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


let supplierLookup = {};
let categoryLookup = {};


function updateReportStatus(message)
{
    document.getElementById("reportStatus").innerHTML =
    message;
}



document.addEventListener("DOMContentLoaded", function () {


    document
        .getElementById("btnLoad")
        .addEventListener("click", loadReport);


    document
        .getElementById("selectAll")
        .addEventListener("change", selectAll);


    document
        .getElementById("btnPdf")
        .addEventListener("click", generatePDF);



    loadSuppliers();
    loadCategories();


});




async function loadReport(){


    let purchaseFrom =
    document.getElementById("purchaseFrom").value;


    let purchaseTo =
    document.getElementById("purchaseTo").value;


    let salesFrom =
    document.getElementById("salesFrom").value;


    let salesTo =
    document.getElementById("salesTo").value;


let supplierName =
document.getElementById("supplierSearch").value;

let categoryName =
document.getElementById("categorySearch").value;



let supplierId =
supplierLookup[supplierName] || 0;



let categoryId =
categoryLookup[categoryName] || 0;


    let minQty =
    document.getElementById("minQty").value || 0;


    let stockFilter =
    document.getElementById("stockFilter").value || null;



    if(
        purchaseFrom==="" ||
        purchaseTo==="" ||
        salesFrom==="" ||
        salesTo===""
    ){

        alert("Please select all dates");
        return;

    }



    try{


        document.getElementById("loading").style.display="block";


        updateReportStatus(
            "⏳ PENDING - Sending request..."
        );



        let request =
        {

            purchase_from:purchaseFrom,

            purchase_to:purchaseTo,

            sales_from:salesFrom,

            sales_to:salesTo,


            supplier_id:Number(supplierId),


            category_id:Number(categoryId),


            min_qty:Number(minQty),


            stock_filter:
            stockFilter === "" ?
            null :
            Number(stockFilter),


            status:"PENDING"

        };




        let response =
        await fetch(

        SUPABASE_URL +
        "/rest/v1/report_requests",

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
            JSON.stringify(request)

        });



        let data =
        await response.json();



        console.log(
            "REQUEST RESPONSE:",
            data
        );



        if(!data || data.length===0)
        {

            updateReportStatus(
                "❌ Request creation failed"
            );

            return;

        }



        let requestID =
        data[0].id;



        console.log(
            "Report Request ID:",
            requestID
        );



        updateReportStatus(
            "⏳ PENDING - Waiting for server..."
        );



        checkReportStatus(requestID);



    }
    catch(error)
    {


        console.log(
            "LOAD REPORT ERROR:",
            error
        );


        updateReportStatus(
            "❌ ERROR : " + error.message
        );


    }
    finally
    {


        document.getElementById("loading").style.display="none";


    }


}




async function checkReportStatus(requestId)
{


let timer =
setInterval(async()=>{


    try
    {


        let {data,error}=

        await supabaseClient

        .from("report_requests")

        .select("status")

        .eq("id",requestId)

        .single();





        if(error)
        {


            console.log(
                "STATUS ERROR:",
                error
            );


            updateReportStatus(
                "❌ Cannot read status"
            );


            return;

        }





        console.log(
            "REPORT STATUS:",
            data.status
        );





        if(data.status==="PENDING")
        {

            updateReportStatus(
                "⏳ PENDING - Waiting..."
            );

        }





        if(data.status==="PROCESSING")
        {


            updateReportStatus(
                "⚙ PROCESSING - Generating report..."
            );


        }





        if(data.status==="COMPLETED")
        {


            updateReportStatus(
                "✅ COMPLETED "
            );



            clearInterval(timer);



            await loadReportResult(requestId);



        }





        if(data.status==="ERROR")
        {


            updateReportStatus(
                "❌ ERROR - Report failed"
            );



            clearInterval(timer);


        }



    }
    catch(error)
    {


        console.log(
            "STATUS CHECK ERROR:",
            error
        );


    }



},3000);



}



async function loadReportResult(requestId)
{


let {data,error}=

await supabaseClient
.from("report_result_rows")
.select("*")
.eq("request_id",requestId);



console.log("REPORT DATA:",data);
console.log("REPORT ERROR:",error);



if(error)
{
updateReportStatus(
"❌ ERROR : Cannot load report data"
);

console.log(error);

return;
}

displayReport(data);


}





function displayReport(data){

    let table =
    document.getElementById("productTable");


    table.innerHTML="";


    let total =
        data.length;


    let loaded = 0;


    document.getElementById("countStatus").innerHTML =
        "Loaded: 0 / " + total;



    data.forEach(item=>{


        loaded++;


        table.innerHTML += `

        <tr>


        <td>

        <input
        type="checkbox"
        class="rowSelect"
        data-productid="${item.product_id}"
        data-description="${item.description}"
        data-stock="${item.stock_in_hand}">

        </td>


        <td>
        ${item.supplier ?? ""}
        </td>


        <td>
        ${item.description ?? ""}
        </td>


        <td>
        ${item.stock_in_hand ?? 0}
        </td>


        <td>
        ${item.sale_qty ?? 0}
        </td>


        <td>
        <input
        type="number"
        class="reorder"
        placeholder="Enter Qty">
        </td>


        </tr>

        `;



        document.getElementById("countStatus").innerHTML =
        "Loaded: " + loaded + " / " + total;


    });


}





function selectAll() {


    let checked =
        document.getElementById("selectAll").checked;



    document
        .querySelectorAll(
            "#productTable .rowSelect"
        )
        .forEach(x => {


            x.checked = checked;


        });


}


async function loadSuppliers(){

    try{

        let response =
        await fetch(
        SUPABASE_URL +
        "/rest/v1/suppliers?select=*",
        {
            headers:{
                "apikey":SUPABASE_KEY,
                "Authorization":
                "Bearer " + SUPABASE_KEY
            }
        });


        let data =
        await response.json();


        let list =
        document.getElementById("supplierList");


        data.forEach(item=>{


            supplierLookup[item.supplier_name] =
            item.supplier_id;


            let option =
            document.createElement("option");


            option.value =
            item.supplier_name;


            list.appendChild(option);


        });


    }
    catch(error){

        console.log(
        "Supplier Load Error",
        error);

    }

}


async function loadCategories(){

    try{

        let response =
        await fetch(
        SUPABASE_URL +
        "/rest/v1/categories?select=*",
        {
            headers:{
                "apikey":SUPABASE_KEY,
                "Authorization":
                "Bearer " + SUPABASE_KEY
            }
        });


        let data =
        await response.json();



        let list =
        document.getElementById("categoryList");



        data.forEach(item=>{


            categoryLookup[
            item.group_description
            ] =
            item.group_id;



            let option =
            document.createElement("option");


            option.value =
            item.group_description;


            list.appendChild(option);


        });



    }
    catch(error){

        console.log(
        "Category Load Error",
        error);

    }

}


async function shareSelected() {


    let selected =
        document.querySelectorAll(
            ".rowSelect:checked"
        );



    if (selected.length === 0) {
        alert(
            "Please select products"
        );

        return;
    }



    let message =
        "Inventory Reorder List\n\n";



    selected.forEach(row => {


        let tr =
            row.closest("tr");



        let description =
            row.dataset.description;



        let stock =
            row.dataset.stock;



        let reorder =
            Number(row.querySelector(".reorder").value);


         {

            message +=
                description
                +
                "\nStock : "
                +
                stock
                +
                "\nReorder Qty : "
                +
                reorder
                +
                "\n\n";

        }


    });



    if (message === "RK Inventory Reorder List\n\n") {

        alert(
            "Please enter reorder quantity"
        );

        return;

    }



    if (navigator.share) {

        await navigator.share({

            title:
                "RK Inventory Reorder",

            text:
                message

        });


    }
    else {

        window.open(
            "https://wa.me/?text="
            +
            encodeURIComponent(message),
            "_blank"
        );

    }


}

async function generatePDF() {


    let rows = [];


    document
        .querySelectorAll("#productTable tr")
        .forEach(row => {


            let checkbox =
                row.querySelector(".rowSelect");


            if (
                checkbox &&
                checkbox.checked
            ) {


                let cells =
                    row.querySelectorAll("td");


                let reorder =
                    row.querySelector(".reorder").value;



                rows.push({

                    supplier:
                        cells[1].innerText,

                    description:
                        cells[2].innerText,

                    qty:
                        reorder

                });


            }


        });



    if (rows.length === 0) {

        alert(
            "Please select items"
        );

        return;

    }

    let grouped = {};


    rows.forEach(item => {


        if (!grouped[item.supplier]) {
            grouped[item.supplier] = [];
        }


        grouped[item.supplier].push([

            item.description,
            item.qty

        ]);


    });


    const { jsPDF } =
        window.jspdf;



    let doc =
        new jsPDF();



    doc.text(
        "RK INVENTORY REORDER LIST",
        14,
        15
    );



    let y = 30;






    for (let supplier in grouped) {


        doc.text(
            supplier,
            14,
            y
        );


        y += 5;



        doc.autoTable({

            startY: y,


            head: [

                [
                    "Description",
                    "Reorder Qty"
                ]

            ],


            body:
                grouped[supplier]

        });



        y =
            doc.lastAutoTable.finalY + 15;



    }




    let pdfBlob =
        doc.output("blob");



    let pdfFile =
        new File(
            [
                pdfBlob
            ],
            "Reorder_List.pdf",
            {
                type: "application/pdf"
            }
        );




    if (
        navigator.canShare &&
        navigator.canShare(
            {
                files: [
                    pdfFile
                ]
            })
    ) {


        await navigator.share({

            files: [
                pdfFile
            ],

            title:
                "RK Inventory Reorder",

            text:
                "Reorder List"

        });


    }
    else {


        doc.save(
            "Reorder_List.pdf"
        );


    }


}