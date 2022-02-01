import click 
import requests
from bs4 import BeautifulSoup
import pandas as pd

@click.command()
def combine():
  
  response = requests.get("https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/state-and-local-fiscal-recovery-funds/recovery-plan-performance-reports-2021")
  soup = BeautifulSoup(response.text, 'html.parser')
  
  table = soup.find_all('table')[0]
  
  ths = table.find_all('th')
  headers=['Index']
  for th in ths[1:]:
    headers.append(th.text.strip())

  tbody = table.find('tbody')
  trs = tbody.find_all('tr')
  table_list = []
  for tr in trs:
    tds = tr.find_all('td')
    td_list = []
    for (i, td) in enumerate (tds):
        if (i == 5):
            td_list.append(td.find('a')['href'])
        elif (i== 7):
            try:
                td_list.append(td.find('a')['href'])
            except:
                pass
        else:
            td_list.append(td.text)
    table_list.append(td_list)

    df = pd.DataFrame(table_list, columns = headers)
    df['Recovery Plan'] = ('https://home.treasury.gov' + df['Recovery Plan'])
    df.to_csv('output.csv', index=False)

if __name__ == '__main__':
    combine()


