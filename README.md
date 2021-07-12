# Light Meter

## A simple utility allowing [Amber Electric](https://www.amber.com.au/) users to be more mindful of their energy usage during peak times and save money. Supports [LIFX Lights](https://www.lifx.com.au/) directly and other smart lights and smart plugs through [IFTTT Webhooks](https://ifttt.com/maker_webhooks).

### How to use
---

For installation you'll need:
- NodeJS 8+
- Yarn or NPM
- Notepad/Visual Studio Code/some other text editor for configuration file

If running locally, you'll need to create a new ```config.json``` or ```.env``` file in the project directory (not included for security reasons). This is used to set and customise various options. Server-side it's recomended to set these as enviroment variables instead.

#### config.json Template
```
{
    "LIFXToken": "your-own-token",
    "LIFXSupport" : true,
    "IFTTTSupport" : true,
    "IFTTTColorChangeEnabled" : true,
    "IFTTTPowerChangeEnabled" : true,
    "IFTTTMakerKey": "your-key-here",
    "IFTTTPowerOffRange" : 3,
    "IFTTTPowerOnRange" : 0,
    "postcode" : "3000",
    "lightSelector": "all",
    "refreshInterval" : 60000,
    "safeColor" : "#1C7C54",
    "warningColor" : "#F9CB40",
    "dangerColor" : "#F04A00",
    "extremeDangerColor" : "#FF101F",
    "lightBrightness" : 1.0,
    "warningRange" : 20,
    "dangerRange" : 30,
    "extremeDangerRange" : 40,
    "lightTransitionDuration" : 1.0
}
```

```LIFXToken```: _(string) (required)_ Your personal LIFX API token. Refer to LIFX's own [documenation](https://api.developer.lifx.com/docs/authentication) for more information.\
```LIFXSupport```: _(boolean) (optional) (default: false)_. If true, controls lights through LIFX's own servers.\
```IFTTTSupport``` : _(boolean) (optional) (default: false)_. If true, sends Webhook requests to IFTTT. Refer to [documentation](https://ifttt.com/maker_webhooks) for more details.\
```IFTTTColorChangeEnabled```: _(boolean) (optional) (default: false)_ If true, sends a "price_change" action through IFTTT Webhooks when price changes.\
```IFTTTPowerChangeEnabled```: _(boolean) (optional) (default: false)_ If true, sends "power_on" or "power_off" actions through IFTTT Webhooks when price range changes to IFTTTPowerOnRange and IFTTTPowerOffRange respectively.\
```IFTTTPowerOffRange, IFTTTPowerOnRange``` _(number) (optional)_ The energy range to IFTTT activate power off and power on events respectively. 0 = Normal, 1 = Warning, 2 = Danger, 3 = Extreme Danger. (defaults: IFTTTPowerOffRange: 3, IFTTTPowerOnRange: 0)\
```lightSelector```: _(string) (required)_ LIFX API selector used to choose what light(s) to control. Refer to LIFX's [documentation](https://api.developer.lifx.com/docs/selectors) for more info.\
```postcode```: (string) (required) The postcode the area you wish to monitor prices for.\
```refreshInterval```:  _(number) (optional)_ The amount of times per-millisecond to check prices. (default: 1000)\
```safeColor, warningColor, danger-color, extremeDangerColor```: _(string) (optional) (defaults: safeColor: "#1C7C54", warningColor: "#F04A00", dangerColor: "#F04A00", extremeDangerColor: "#FF101F")_ The colours (in CSS Hex format) for the light when energy is cheap, mild, expensive and very expensive respectively. CSS Hex is recomended for IFTTT use, if using LIFX it can be any of it's supported [color formats](https://api.developer.lifx.com/docs/colors).\
```warningRange, dangerRange, extremeDangerRange```: _(number) (optional) (defaults: warningRange: 20, dangerRange: 30, extremeDangerRange: 40)_ The thresholds for each usage tier.\
```lightBrightness```: _(float) (optional) (default: 1.0)_ A value between 0.0 and 1.0 that represents the brightness of the light(s) controlled.\
```lightTransitionDuration```: _(float) (optional) (default: 1.0)_ A value between 0.0 and 1.0 that represents the speed in which the lights(s) change colour or turn on.


Install the various depencies:\
```npm install``` - For npm users\
```yarn install``` for yarn users.

And to actually run:\
```node app```

(Once it's up and running, there's nothing more you need to do. I reccomend running this on a raspberry pi to save power!)

### Setting up IFTTT Webhooks
While the process for connecting individual devices differs, the 'If' portion is the same:

1. Visit https://ifttt.com/maker_webhooks to turn on Webhooks.
2. Grab and copy your maker key into your config.json file/enviroment variable (you can find this in your IFTTT Webhook documenation page).
3. Create webhook applets, listening for 'price_change', 'power_off', 'power_on' events (all 3 events are optional).

All events come with the following values:\
Value1 - The color associated with the current price range.\
Value2 - The current price.\
Value3 - The current price range.

### Why doesn't the price match what's on the app?
Light-Meter currently uses the public-facing older API that provides the latest price within the 5 minute window the request was made along with forecasts and a number of previously confirmed prices in 30 minute windows, while the app uses a weighted average of previous, current and forecasted prices to the arrive at the number you see on their app/website. Light-Meter uses the current 5 minute window price, calculating with the formula:

```Fixed kWh Price + (loss factor * wholesale kWh price within the past 5 minutes)```

Light-Meter will be updated to use the newer, customer-facing API soon.

This utility is more meant to act as a general physical reminder to be aware of your energy usage (something I could of used when I cooked dinner in the air-fryer during a $7.50 period 😢).

***

## MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
