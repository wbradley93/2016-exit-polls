# 2016 Presidential Election Exit Poll Data

Scraped from CNN's election website. Response data in `responses.json` consists of nested JSON objects structured as follows:

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

National totals are included under 'state' `National`. Sample sizes in `responses.json` consists of nested JSON objects structured as follows:

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
