import requests
from bs4 import BeautifulSoup
import re


def checkFight(fight_url):
    try:
        headers["Referer"] = fighter_url
        res = requests.get(fight_url, headers = headers)
        res.raise_for_status()
        doc = BeautifulSoup(res.text, "html.parser")
        stat_tables = doc.find_all(class_ = "b-fight-details__table js-fight-table")
        statistics = []
        for table in stat_tables:
            rows = table.find_all("tbody")
            new_table = []
            for row in rows:
                stats = row.find_all(class_ = "b-fight-details__table-text")
                #stringy = ""
                i = 0
                new_row = []
                fighter1 = []
                fighter2 = []
                while i < len(stats):
                    val1 = stats[i].text.strip()
                    val2 = stats[i+1].text.strip()
                    if re.match(r"^(.+)\s+of\s+(.+)$", val1):
                        val1 = f"{val1.split('of')[0].strip()}/{val1.split('of')[1].strip()}"
                    if re.match(r"^(.+)\s+of\s+(.+)$", val2):
                        val2 = f"{val2.split('of')[0].strip()}/{val2.split('of')[1].strip()}"
                    fighter1.append(val1)
                    fighter2.append(val2)
                    #stringy = stringy + "[" + val1 + ":" + val2 + "] "
                    i+=2
                new_row.append(fighter1)
                new_row.append(fighter2)    
                #print(stringy +"\n")
                new_table.append(new_row)
            statistics.append(new_table)
        print(statistics)
    except requests.exceptions.RequestException as e:
     print(f"Request failed: {e}")



name = input("Enter name: ")
fname, lname = name.split(' ')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}



url = f"http://ufcstats.com/statistics/fighters/search?query={fname}"
fighter_url = "http://google.com"
try:
    response = requests.get(url, headers = headers)
    response.raise_for_status()
    page = response.text
    doc = BeautifulSoup(page, "html.parser")
    rows = doc.find_all(class_ = "b-statistics__table-row")
    for row in rows:
        names = row.find_all(class_ = "b-link b-link_style_black")
        if len(names) != 0:
            if f"{names[0].text} {names[1].text}" == name:
                #print(f"Success: {names[0].text} {names[1].text} {names[0]['href']}")
                fighter_url = names[0]['href']
                break
    ##Will break if fighter DNE in DB
except requests.exceptions.RequestException as e:
     print(f"Request failed: {e}")

#### This portion finds the specific fighter's overview
headers['Referer'] = url
try:
    response = requests.get(fighter_url, headers = headers)
    response.raise_for_status()
    page = response.text
    doc = BeautifulSoup(page, "html.parser")
    fights = doc.find_all(class_ = "b-fight-details__table-row b-fight-details__table-row__hover js-fight-details-click")
    for fight in fights:
        opponent = fight.find_all(class_ = "b-link b-link_style_black")[1].text
        print(f"{opponent.strip()}: {fight['data-link']}")
        checkFight(fight['data-link'])
        
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")