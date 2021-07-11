const nconf = require('nconf');
const fetch = require('node-fetch');

let interval;

nconf   .env()
        .file({ file: './config.json' });

const LIFX_ON = nconf.get("LIFXSupport") ?? false;
const IFTTT_ON = nconf.get("IFTTTSupport") ?? false;

const POSTCODE = nconf.get('postcode');
const LIGHT_SELECTOR = nconf.get('lightSelector');
const LIFX_TOKEN = nconf.get('LIFXToken');

const IFTTT_KEY = nconf.get('IFTTTMakerKey');
const IFTTT_POWER_ENABLED = nconf.get('IFTTTPowerChangeEnabled') ?? false;
const IFTTT_COLOR_ENABLED = nconf.get('IFTTTColorChangeEnabled') ?? false;
const IFTTT_POWER_ON_THRESHOLD = nconf.get('IFTTTPowerOnThreshold') ?? 0;
const IFTTT_POWER_OFF_THRESHOLD = nconf.get('IFTTTPowerOffThreshold') ?? 3;

console.log("Power on Threshold: " + IFTTT_POWER_ON_THRESHOLD);
console.log("Power off Threshold: " + IFTTT_POWER_OFF_THRESHOLD);

if (LIFX_ON) {
    if (typeof LIFX_TOKEN == "undefined")
        throw new Error("No 'LIFXToken' property in config.json file or enviroment variables.");
    
    if (typeof POSTCODE == 'undefined')
        throw new Error("No 'postcode' property in config.json file");
    if (POSTCODE == "" || typeof POSTCODE != 'string')
        throw new Error("Empty or non-string 'postcode' property in config.json file or enviroment variables.");

    if (typeof LIGHT_SELECTOR == 'undefined')
        throw new Error("No 'light-selector' property in config.json file");
    if (LIGHT_SELECTOR == "" || typeof LIGHT_SELECTOR != 'string')
        throw new Error("Empty or non-string 'light-selector' property in config.json file or enviroment variables.");
}

if (IFTTT_ON) {
    if (typeof IFTTT_KEY == "undefined")
        throw new Error("No 'IFTTTMakerKey property in config.json file or enviroment variables");
}

if (!IFTTT_ON && !LIFX_ON) {
    throw new Error('No smart device service connected! Check README file on how to turn on LIFX and/or IFTTT support');
}

const SAFE_COLOR = nconf.get('safeColor') ?? "#1C7C54";
const WARNING_COLOR = nconf.get('warningColor') ?? "#F9CB40";
const DANGER_COLOR = nconf.get('dangerColor') ?? "#F04A00";
const EXTREME_DANGER_COLOR = nconf.get('extremeDangerColor') ?? "#FF101F";

const COLORS = [ SAFE_COLOR, WARNING_COLOR, DANGER_COLOR, EXTREME_DANGER_COLOR ];

const LIGHT_TRANS_DURATION = parseFloat(nconf.get('lightTransitionDuration')) ?? 1.0
const LIGHT_BRIGHTNESS = parseFloat(nconf.get('lightBrightness')) ?? 1.0

const REFRESH_INTERVAL = parseInt(nconf.get("refreshInterval")) ?? 60000

const WARNING_RANGE = parseInt(nconf.get('warningRange')) ?? 20;
const DANGER_RANGE = parseInt(nconf.get('dangerRange')) ?? 30;
const EXTREME_DANGER_RANGE = parseInt(nconf.get('extremeDangerRange')) ?? 40;

setLightBasedOnPriceAsync()
.then(() => {
    interval = setInterval(() => {
        setLightBasedOnPriceAsync();
    }, REFRESH_INTERVAL)

    console.log("Set-up is complete. You don't need to do anything else!")
})
.catch((ex) => {
    console.log(ex);
})

// Functions
async function setLightBasedOnPriceAsync() {
    try {
        const price = await getLatestPriceRangeAsync();

        if (LIFX_ON) {
            await setLightColorAsync(COLORS[price.range]);
        }

        if (IFTTT_ON) {
            await activateIFTTTWebhookAsync(price.range, price.current);

            console.log("IFTTT Webhook Complete!");
        }
    }
    catch (ex) {
        throw new Error(ex);
    }
}

async function getLatestPriceRangeAsync() {
    try {
        const prices = await fetchPricesFromServerAsync();

        const latestPrice = grabLatestPrice(prices.variablePrices);

        let range = 0;

        let calculatedPrice = parseFloat(prices.staticPrices.totalfixedKWHPrice) + (parseFloat(prices.staticPrices.lossFactor) * parseFloat(latestPrice.wholesaleKWHPrice))
        calculatedPrice = Math.round(calculatedPrice);

        console.log("The calculated usage price as of: " + new Date() +  " is " + calculatedPrice + ' cents per kWh');

        if (calculatedPrice >= WARNING_RANGE && calculatedPrice < DANGER_RANGE)
            range =  1; // Medium
        else if (calculatedPrice >= DANGER_RANGE && calculatedPrice < EXTREME_DANGER_RANGE)
            range = 2; // High
        else
            range = 3; // Extreme

        return { range, current: latestPrice }
    }
    catch(ex) {
        throw new Error('Something went wrong');
    }
}

async function activateIFTTTWebhookAsync(range, price) {
    let actionsToPerform = [];

    if (IFTTT_COLOR_ENABLED)
        actionsToPerform.push("price_change");

    if (IFTTT_POWER_ENABLED) {
        if (price == IFTTT_POWER_ON_THRESHOLD) {
            actionsToPerform.push("power_on");
        } else if (price == IFTTT_POWER_OFF_THRESHOLD) {
            actionsToPerform.push("power_off");
        }
    }

    for (let a in actionsToPerform) {
        const url = `https://maker.ifttt.com/trigger/${actionsToPerform[a]}/with/key/${IFTTT_KEY}`;

        console.log(url);

        const response = await fetch(url, {
            headers: {
                'Content-Type' : 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                value1: COLORS[range],
                value2: price,
                value3: range
            })
        });

        if (response.status != 200)
            throw new Error("Something went wrong while")
    }
}

async function setLightColorAsync(color) {
    try {
        const response = await fetch(`https://api.lifx.com/v1/lights/${LIGHT_SELECTOR}/state`, {
            headers: {
                'Authorization' : 'Bearer ' + LIFX_TOKEN,
                'Content-Type' : 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({
                power: 'on',
                color,
                brightness: LIGHT_BRIGHTNESS,
                duration: LIGHT_TRANS_DURATION
            })
        });

        const responeJSON = await response.json();

        if (response.status != 200 && response.status != 207) {
            throw new Error("Somthing went wrong while making request");
        }

        if (responeJSON.results[0]?.status == 'timed_out')
            throw new Error("Light could not be contacted! Try running the server again!");
    }
    catch (ex) {
        console.log(ex);

        throw new Error(ex);
    }
}

async function fetchPricesFromServerAsync() {
    try {
        const body = {
            "postcode" : nconf.get('postcode')
        }
    
        const response = await fetch('https://api.amberelectric.com.au/prices/listprices', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type' : 'application/json' }
        });
    
        const prices = await response.json();

        return {
            staticPrices: prices?.data?.staticPrices?.E1,
            variablePrices: prices?.data?.variablePricesAndRenewables
        }
    }
    catch (ex) {
        throw new Error('Something went wrong: ' + ex);
    }
}

function grabLatestPrice(prices) {
    // Grab the latest period
    let latest = prices.filter((item, index) => (item.latestPeriod))

    if (latest.length == 0) {
        let knownPrice;
        
        // Grab the last known price instead
        for (let p of prices) {
            if (p.periodType == 'FORECAST')
                break;
            
            knownPrice = p;
        }

        if (knownPrice)
            return knownPrice;

        return 0
    }

    return latest[0];
}