from os import link
import click 
import requests
from bs4 import BeautifulSoup
import pandas as pd

@click.command()
@click.argument("output_file", type=click.File('w'))
def treasury_scrape(output_file):
  
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

        click.echo(f'scraped {td_list[1]}', err=True)
        table_list.append(td_list)

    df = pd.DataFrame(table_list, columns = headers)

    for index,row in df.iterrows():
        if df["Recovery Plan"][index] is not None:
            df.loc[index,'Recovery_Plan_link'] = f'https://home.treasury.gov{df["Recovery Plan"][index]}'

    df.to_csv(output_file, index=False)

if __name__ == '__main__':
    treasury_scrape()


