const PrinterService =
{

    mode:"BROWSER",


    setMode:function(mode)
    {

        this.mode=mode;

        let settings =
        loadPrinterSettings();


        settings.PrintMode=mode;


        savePrinterSettings(settings);

    },



    print:function(receipt)
    {


        if(this.mode==="BROWSER")
        {

            BrowserPrinter.print(receipt);

        }


        else if(this.mode==="ESCPOS")
        {

            ESCPosPrinter.print(receipt);

        }


    }


};