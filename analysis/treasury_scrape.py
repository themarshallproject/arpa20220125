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

    
    #new_list =  []
    #for (i, link) in enumerate (df["Recovery Plan"]):
    #    print (i)
    #    print (link)
    #    print (df["Recovery Plan"][i]) 
    #    new_list.append(df["Recovery Plan"][i])
    #df1 = pd.DataFrame(new_list, columns = ['linkend']) 
    #df1['Recovery_Plan_link'] = f'https://home.treasury.gov{df1.linkend}'
    
    #df["Recovery_Plan"] =  f'https://home.treasury.gov{df["Recovery Plan"]}'
    df['Recovery_Plan'] = ('https://home.treasury.gov' + df['Recovery Plan'])
    
    for link in df['Recovery_Plan']:
        if math.isnan(link) == FALSE:
            pass
        else:
            print(requests.head(link)) 
    
    df.to_csv(output_file, index=False)

if __name__ == '__main__':
    treasury_scrape()


