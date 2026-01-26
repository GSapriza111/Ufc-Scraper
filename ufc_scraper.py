import requests
from bs4 import BeautifulSoup
import re

headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

def checkFight(fight_url, name, fighter_url):
    try:
        headers["Referer"] = fighter_url
        res = requests.get(fight_url, headers = headers)
        res.raise_for_status()
        doc = BeautifulSoup(res.text, "html.parser")
        stat_tables = doc.find_all(class_ = "b-fight-details__table js-fight-table")
        statistics = []
        
        #Get fighters, event, and result
        event = doc.find(class_ = "b-content__title").text.strip()
        fighterA, fighterB = doc.find_all(class_ = "b-link b-fight-details__person-link")
        fighterA = fighterA.text.strip()
        fighterB = fighterB.text.strip()

        fighterA_S, fighterB_S = doc.find_all(class_ = "b-fight-details__person")
        if fighterA_S.find('i').text.strip() == "W":
            winner = fighterA
        elif fighterB_S.find('i').text.strip() == "W":
            winner = fighterB
        else:
            winner = "DRAW/NC"

        gen_stats = doc.find(class_ = "b-fight-details__content")
        method = gen_stats.find(class_ = "b-fight-details__text-item_first").find("i", class_ = None).text.strip()
        rd = gen_stats.find(class_ = "b-fight-details__text-item").text.strip()[-1]




        statistics.append([fighterA, fighterB, event, winner, method, rd])
        


        for table in stat_tables:
            rows = table.find_all("tbody")
            new_table = []
            for row in rows:
                stats = row.find_all(class_ = "b-fight-details__table-text")
                i = 0
                fighter1 = []
                fighter2 = []
                while i < len(stats):
                    val1 = stats[i].text.strip()
                    val2 = stats[i+1].text.strip()

                    #### get rid of reduntant/calculable percentages

                    if re.match(r".*%", val1) or re.match(r".*%", val2):
                        i+=2
                        continue

                        

                    #### Make into fractions so simpler representations
                    if re.match(r"^(.+)\s+of\s+(.+)$", val1):
                        val1 = f"{val1.split('of')[0].strip()}/{val1.split('of')[1].strip()}"
                    if re.match(r"^(.+)\s+of\s+(.+)$", val2):
                        val2 = f"{val2.split('of')[0].strip()}/{val2.split('of')[1].strip()}"

                    fighter1.append(val1)
                    fighter2.append(val2)
                    i+=2
                new_table.append(fighter1)
                new_table.append(fighter2)

            statistics.append(new_table)
        return statistics
    except requests.exceptions.RequestException as e:
     print(f"Request failed: {e}")


def startScript():
    
    name = input("Enter name: ")
    fname, lname = name.split(' ')



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
        history = []
        for fight in fights:
            opponent = fight.find_all(class_ = "b-link b-link_style_black")[1].text
            print("----------------------------------")
            print(f"{opponent.strip()}: {fight['data-link']}")
            results = checkFight(fight['data-link'], name, fighter_url)
            print(results)
            history.append(results)
            print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        return history
    ######## ADD SOMETHING LATER TO ADD RESULTS TO DB


    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")


if __name__ == "__main__":
    print(startScript())