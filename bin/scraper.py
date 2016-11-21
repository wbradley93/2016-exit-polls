'''
CNN 2016 Exit Poll Scraper
Author: Wes Bradley
Last modified: 21 Nov 2016

Scrapes relevant data from CNN site and builds into nested dictionaries by
state/question/response/presidential vote. Writes out two JSON objects of raw
data and sample sizes, and two javascript files of data and sample sizes
filtered for questions asked in >=20 states.
'''
from selenium import webdriver
from bs4 import BeautifulSoup
import time, json

#28 states (+national aggregates) covered in exit poll
states = ['National', 'Arizona', 'California', 'Colorado', 'Florida', 'Georgia', \
    'Illinois', 'Indiana', 'Iowa', 'Kentucky', 'Maine', 'Michigan', 'Minnesota', \
    'Missouri', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', \
    'North Carolina', 'Ohio', 'Oregon', 'Pennsylvania', 'South Carolina', 'Texas', \
    'Utah', 'Virginia', 'Washington', 'Wisconsin']

data = {}
samples = {}
driver = webdriver.PhantomJS()

for state in states:
    url = "http://edition.cnn.com/election/results/exit-polls/%s/president" % \
        state.lower().replace(" ", "-")

    driver.get(url)
    time.sleep(2) #allow javascript to render
    bs = BeautifulSoup(driver.page_source, "lxml")
    data[state] = {}
    samples[state] = {}

    #table = question
    for table in bs("div", "exit-poll-table"):
        question = table(class_="exit-poll__question")[0].string

        #some questions asked multiple times with different answers; appending
        #them to question string to get unique identifier that's easy to resplit
        for row in range(1,len(table("tr"))):
            question += '\' + table("tr")[row].contents[0].contents[1]

        #candidate (name, party) pairs for building out dicts later
        candidates = []
        for candidate in table("tr")[0]:
            if candidate.has_attr("data-lname"):
                c_name = candidate["data-lname"]
                c_party = candidate["data-party"]
                candidates.append((c_name, c_party))

        #the meaty part
        data[state][question] = {}
        #for each possible response to the given question
        for row in range(1,len(table("tr"))):
            #they don't make carving out the response itself a pretty thing
            response = table("tr")[row].contents[0].contents[1]
            data[state][question][response] = {}
            #percentage of overall respondents to the question
            data[state][question][response]['percent'] = table("tr")[row]("span")[0].string
            #each candidate's share of the given response
            for share in range(1,len(table("tr")[row].contents)):
                data[state][question][response][candidates[share-1][1]] = \
                    table("tr")[row].contents[share].string
        #sample size
        samples[state][question] = table(class_="exit-poll-table__metadata")[0].get_text()

driver.quit()
f = open('full_responses.json', 'w')
f.write(json.dumps(data))
f.close()
f = open('full_samples.json', 'w')
f.write(json.dumps(samples))
f.close()

#constructing a global question list/counter
questions = {}
for state in data:
    for question in data[state]:
        if question not in questions:
            questions[question] = 1
        else:
            questions[question] += 1

#preserve the ones with enough data to be interesting
twentyData = {}
twentyCounts = {}
for state in data:
    twentyData[state] = {}
    twentyCounts[state] = {}
    for question in data[state]:
        if questions[question] >= 20:
            twentyData[state][question] = data[state][question]
            twentyCounts[state][question] = samples[state][question]

f = open('20state_responses.js', 'w')
f.write("var responses = " + json.dumps(twentyData))
f.close()
f = open('20state_samples.js', 'w')
f.write("var samples = " + json.dumps(twentyCounts))
f.close()
