//node 1_Hackerrank.js --url="https://www.hackerrank.com/" --config="config.json"
const minimist = require("minimist");
const puppeteer = require("puppeteer");
const fs = require("fs");
const args = minimist(process.argv);
let configJson = fs.readFileSync(args.config , "utf-8");
let config = JSON.parse(configJson);


(async function(){
    let  browser = await puppeteer.launch(
        {
            headless : false,
            args:["--start-maximized"], //handle screen
            defaultViewport: null   //manage height , width
        }
    );
    const page = (await browser.pages())[0]
    await page.goto(args.url);
    
    //wait for 2 sec
    await page.waitFor(2000);

    //wait & then click on loginpage1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    //wait for 2 sec
    await page.waitForTimeout(2000);

    //wait & then click on login
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    //wait for 2 sec
    await page.waitForTimeout(2000);
        
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']" , config.userId ,{delay:100});

    await page.waitForSelector("input[type='password']");
    await page.type("input[type='password']" , config.password ,{delay:100});
        
    await page.keyboard.press("Enter");

    //press on Contests
    await page.waitForTimeout(2000);

    await page.waitForSelector("a[href='/contests']");
    await page.click("a[href='/contests']");
      
    await page.waitForTimeout(2000);

    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center" , function(atags){
        let urls = [];         //href of atags 
        for(let i = 0 ; i < atags.length ; i++){
            let url = atags[i].getAttribute("href");
            urls.push(url);
        }
        return urls;
    })       //contest urls
    for(let i = 0 ; i < curls.length ; i++){
        let ctab = await browser.newPage();
        await ctab.bringToFront();
        await ctab.goto(args.url + curls[i]);
        
        await ctab.waitFor(2000);
        await ctab.waitForSelector("li[data-tab='moderators']");
        await ctab.click("li[data-tab='moderators']");
    
        
        await ctab.waitFor(2000);
    
        //add all moderators in one test
        for(let i = 0 ; i < config.moderators.length ; i++){
            await  ctab.waitForSelector("input#moderator");
            await  ctab.type("input#moderator" , config.moderators[i] , {delay:100});
            await  ctab.keyboard.press("Enter");
        }
        await ctab.close();
        await ctab.waitFor(2000);
    }
})();



