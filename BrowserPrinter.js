const BrowserPrinter =
{

print:function(receipt)
{


let html="";


html+=
`
<h2>${receipt.store.name}</h2>

<p>
${receipt.store.address}
</p>

<hr>
`;


receipt.items.forEach(item=>{


html+=`

${item.description}
<br>
${item.qty} x ${item.price}
<br>
${item.amount}

<hr>

`;

});


html+=`

Subtotal :
${receipt.totals.subtotal}

<br>

VAT :
${receipt.totals.tax}

<br>

<b>
TOTAL :
${receipt.totals.total}
</b>

`;



let win =
window.open("","PRINT");


win.document.write(html);


win.print();


}

};