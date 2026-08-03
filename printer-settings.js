const PrinterSettings =
{
    PrintMode:"BROWSER",
    PaperWidth:58,
    PrinterName:""
};


function loadPrinterSettings()
{

    let saved =
    localStorage.getItem("printerSettings");


    if(saved)
    {
        return JSON.parse(saved);
    }


    return PrinterSettings;

}



function savePrinterSettings(settings)
{

    localStorage.setItem(
        "printerSettings",
        JSON.stringify(settings)
    );

}