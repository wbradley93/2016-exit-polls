# 2016 Presidential Election Exit Poll Data

Scraped from CNN's election website, including all 28 states with sufficient polling data and national totals under 'state' `National`. Response data in `full_responses.json` consist of nested JSON objects structured as follows:

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

Sample size data in `full_samples.json` consist of nested JSON objects structured as follows:

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

Files with names beginning `20state_` contain only questions asked in at least 20 states. Credit to robflaherty's Raphael US map for that.
