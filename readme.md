# 2016 Presidential Election Exit Poll Data

See a live visualization [here](https://wbradley93.github.io/2016-exit-polls/). Outlets in the national pool only released so many angles at the data, and Edison charges an ungodly amount for the raw numbers, so I tried to make the next best thing. Credit to [robflaherty's Raphael US map](https://github.com/robflaherty/us-map-raphael) for the map paths.

Scraper can be found at `bin/scraper.py`. Data is taken from CNN's election website, including all 28 states with sufficient polling data and national totals under the 'state' `National`. `bin/20states.js` contains only data for questions asked in at least 20 states (this is the data used in the live demo). Full response data in `bin/full_responses.json` consist of nested JSON objects structured as follows:

```
{
  State 1:
    {Question 1:
      {Response 1:
        {'percent':Percent of total responses to Question 1,
         'D':Percent of respondents who voted for Clinton,
         'R':Percent of respondents who voted for Trump,
         'LB':Percent of respondents who voted for Johnson,
         'GR':Percent of respondents who voted for Stein,
         'O':Percent of respondents who voted for another candidate or did not respond},
       Response 2:
        {'percent':Percent of total responses to Question 1,
         ...
        },
       ...
      },
    {Question 2:
     ...
  },
  State 2:
  ...
}
```

Sample size data in `bin/full_samples.json` consist of nested JSON objects structured as follows:

```
{
  State 1:
    {Question 1: 'x respondents',
     Question 2: 'x respondents',
     ...
     },
  State 2:
  ...
}
```
