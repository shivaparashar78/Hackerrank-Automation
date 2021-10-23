//node Hackerrank_Automate.js --url=https://www.hackerrank.com --config=config.json

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

(async function() {
    // start the browser
    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });

    // get the tabs (there is only one tab)
    let pages = await browser.pages();
    let page = pages[0];

    // open the url
    await page.goto(args.url);

    // wait and then click on login on page1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    // wait and then click on login on page2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    // type userid
    //wait for 2 sec
    await page.waitForTimeout(2000);
        
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']" , configJSO.userId ,{delay:100});


    // type password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", configJSO.password, { delay: 20 });

    // press click on page3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    // click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    // click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    await page.waitForSelector("a[data-attr1='Last']");
    let numberOfPages = await page.$eval("a[data-attr1='Last']", function(alast){
        let countOfPages = parseInt(alast.getAttribute("data-page"));
        return countOfPages;
    })

    for(let i = 0; i < numberOfPages - 1; i++){
        await page.waitForSelector("a.backbone.block-center");
        let contestUrls = await page.$$eval("a.backbone.block-center", function(atags){
            let urls = [];
    
            for(let i = 0; i < atags.length; i++){
                let url = atags[i].getAttribute('href');
                urls.push(url);
            }
            return urls;
        });
        
        for (let i = 0; i < contestUrls.length; i++) {
            let cpage = await browser.newPage();
            
            page.waitForTimeout(2000);
            await saveModerator(args.url+contestUrls[i], cpage, configJSO.moderator);
    
            await cpage.close();
            await page.waitForTimeout(2000);
        }

        await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");
    }
})();

async function saveModerator(url, cpage, moderator) {
    await cpage.bringToFront();
    await cpage.goto(url);

    await cpage.waitFor(3000);

    // click on moderators tab
    await cpage.waitForSelector("li[data-tab='moderators']");
    await cpage.click("li[data-tab='moderators']");

      //add all moderators in one test
      for(let i = 0 ; i < configJSO.moderators.length ; i++){
        await  cpage.waitForSelector("input#moderator");
        await  cpage.type("input#moderator" , configJSO.moderators[i] , {delay:100});
        await  cpage.keyboard.press("Enter");
    }
    // // type in moderator
    // await cpage.waitForSelector("input#moderator");
    // await cpage.type("input#moderator", moderator, { delay: 20 });

    await cpage.keyboard.press("Enter");
};







//Hello world
//So , What this project does?
//It automates on hacekrarank to  add multiple modeartors in multiple contests
//Let's see how it works