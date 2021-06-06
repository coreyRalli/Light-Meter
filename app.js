const nconf = require('nconf');
const fetch = require('node-fetch');

if (process.env.NODE_ENV !== 'production') {
    console.log(require('dotenv').config())
}

let interval;

nconf.argv()
    .env()
    .file({ file: './config.json' });

const SAFE_COLOR = nconf.get('safeColor') ?? "#1C7C54";
const WARNING_COLOR = nconf.get('warningColor') ?? "#F9CB40";
const DANGER_COLOR = nconf.get('dangerColor') ?? "#F04A00";
const EXTREME_DANGER_COLOR = nconf.get('extremeDangerColor') ?? "#FF101F";

const COLORS = [ SAFE_COLOR, WARNING_COLOR, DANGER_COLOR, EXTREME_DANGER_COLOR ];

const LIGHT_TRANS_DURATION = nconf.get('lightTransitionDuration') ?? 1.0
const LIGHT_BRIGHTNESS = nconf.get('lightBrightness') ?? 1.0

const REFRESH_INTERVAL = nconf.get("refreshInterval") ?? 60000

const WARNING_RANGE = nconf.get('warningRange') ?? 20;
const DANGER_RANGE = nconf.get('dangerRange') ?? 30;
const EXTREME_DANGER_RANGE = nconf.get('extremeDangerRange') ?? 40;

const POSTCODE = nconf.get('postcode');
if (typeof POSTCODE == 'undefined')
        throw new Error("No 'postcode' property in config.json file");
if (POSTCODE == "" || typeof POSTCODE != 'string')
        throw new Error("Empty or non-string 'postcode' property in config.json file");

const LIGHT_SELECTOR = nconf.get('lightSelector');

if (typeof LIGHT_SELECTOR == 'undefined')
        throw new Error("No 'light-selector' property in config.json file");
if (LIGHT_SELECTOR == "" || typeof LIGHT_SELECTOR != 'string')
        throw new Error("Empty or non-string 'light-selector' property in config.json file");


setLightBasedOnPriceAsync()
.then(() => {
    interval = setInterval(() => {
        setLightBasedOnPriceAsync()
    }, REFRESH_INTERVAL)

    console.log("Set-up is complete. You don't need to do anything else!")
})
.catch((ex) => {
    console.log(ex)
})

// Functions
async function setLightBasedOnPriceAsync() {
    try {
        const price = await getLatestPriceRangeAsync();
        
        await setLightColorAsync(COLORS[price]);
    }
    catch (ex) {
        throw new Error(ex);
    }
}

function getColorForLight(range) {
    if (range == 0)
        return SAFE_COLOR;
    if (range == 1)
        return WARNING_COLOR;
    if (range == 2)
        return DANGER_COLOR;

    return EXTREME_DANGER_COLOR;
}

async function getLatestPriceRangeAsync() {
    try {
        const prices = await fetchPricesFromServerAsync();

        const latestPrice = grabLatestPrice(prices.variablePrices);

        let calculatedPrice = parseFloat(prices.staticPrices.totalfixedKWHPrice) + (parseFloat(prices.staticPrices.lossFactor) * parseFloat(latestPrice.wholesaleKWHPrice))
        calculatedPrice = Math.floor(calculatedPrice);

        console.log("The calculated usage price as of: " + new Date() +  " is " + calculatedPrice + ' cents per kWh');

        if (calculatedPrice < WARNING_RANGE)
            return 0 // Normal
        else if (calculatedPrice >= WARNING_RANGE && calculatedPrice < DANGER_RANGE)
            return 1 // Medium
        else if (calculatedPrice >= DANGER_RANGE && calculatedPrice < EXTREME_DANGER_RANGE)
            return 2 // High
        else
            return 3 // Extreme
    }
    catch(ex) {
        throw new Error('Something went wrong');
    }
}

async function setLightColorAsync(color) {
    try {
        const response = await fetch("https://api.lifx.com/v1/lights/" + LIGHT_SELECTOR + "/state", {
            headers: {
                'Authorization' : 'Bearer ' + nconf.get('LIFX-token'),
                'Content-Type' : 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({
                power: 'on',
                color: color,
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