# Light Meter

## A simple utility allowing Amber Electirty and LIFX users to be more mindful of their energy usage during peak times and save money.

### How to use
---

For installation you'll need:
- NodeJS 8+
- Yarn or NPM
- Notepad/Visual Studio Code/some other text editor for configuration file

You'll need to create a new ```config.json``` file in the project directory (not included for security reasons). This is used to set and customise various options.

#### config.json Template
```
{
    "LIFX-token": "your-own-token",
    "postcode" : "3000",
    "light-selector": "all",
    "refresh-interval" : 60000,
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

```LIFX-token```: (string) Your personal LIFX API token. Refer to LIFX's own documenation for more information.\
```light-selector```: (string) LIFX API selector used to choose what light(s) to control. Refer to LIFX's documentation for more info.\
```postcode```: (string) The postcode the area you wish to monitor prices for.\
```refresh-interval```:  (number) The amount of times per-millisecond to check prices.\
```safeColor, warningColor, danger-color, extremeDangerColor```: (string) The colours for the light when energy is cheap, mild, expensive and very expensive respectively. Refer to LIFX's documentation for all supported formats.\
```warningRange, dangerRange, extremeDangerRange```: (number) The thresholds for each usage tier.
```lightBrightness```: (float) A value between 0.0 and 1.0 that represents the brightness of the light(s) controlled.\
```lightTransitionDuration```: (float) A value between 0.0 and 1.0 that represents the speed in which the lights(s) change colour or turn on.


Install the various depencies:\
```npm install``` - For npm users\
```yarn install``` for yarn users.

And to actually run:\
```node app```

(Once it's up and running, there's nothing more you need to do. I recomend running this on a raspberry pi to save power!)

### Why doesn't the price match what's on the app?
Speaking with Amber customer support (they're really good!), the current API provides the latest price within the 5 minute window the request was made (along with forecasts and a number of previous confirmed prices in 30 minute windows) while the app uses a weighted average of previous, current and forecasted prices to the arrive at the number you see on their app/website.

This utility is more meant to act as a general physical reminder to be aware of your energy usage (something I could of used when I cooked dinner in the air-fryer during a $7.50 period 😢).

***

## MIT License

Copyright (c) 2021 Corey Ralli

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