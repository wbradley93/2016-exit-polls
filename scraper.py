from selenium import webdriver
from bs4 import BeautifulSoup
import time, json

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
    time.sleep(2)
    bs = BeautifulSoup(driver.page_source, "lxml")
    data[state] = {}
    samples[state] = {}

    for table in bs("div", "exit-poll-table"):
        candidates = []
        question = table(class_="exit-poll__question")[0].string
        for row in range(1,len(table("tr"))):
            question += "/" + table("tr")[row].contents[0].contents[1]
        data[state][question] = {}
        for candidate in table("tr")[0]:
            if candidate.has_attr("data-lname"):
                c_name = candidate["data-lname"]
                c_party = candidate["data-party"]
                candidates.append((c_name, c_party))
        for row in range(1,len(table("tr"))):
            response = table("tr")[row].contents[0].contents[1]
            data[state][question][response] = {}
            data[state][question][response]['percent'] = table("tr")[row]("span")[0].string
            for share in range(1,len(table("tr")[row].contents)):
                data[state][question][response][candidates[share-1][1]] = \
                    table("tr")[row].contents[share].string
        samples[state][question] = table(class_="exit-poll-table__metadata")[0].get_text()

driver.quit()
f = open('responses', 'w')
f.write(json.dumps(data))
f.close()
f = open('samples', 'w')
f.write(json.dumps(samples))
f.close()
