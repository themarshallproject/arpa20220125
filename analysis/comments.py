import click
import requests
import pandas as pd
from time import sleep
import os
from dotenv import load_dotenv 

@click.command()
@click.argument("output_file", type=click.File('w'))
def reports_clean(output_file):

    load_dotenv()

    API_KEY=os.getenv('API_KEY')

    #REQUESTING by the docket ID
    response=requests.get(f"https://api.regulations.gov/v4/documents?filter[docketId]=TREAS-DO-2021-0008&api_key={API_KEY}")
    data = response.json()

    #FIND the objectId
    data['data'][0]['attributes']['objectId']

    #LOOP through the pages to get the links 
    links=[]
    for i in range (1, 5):
        response = requests.get(f"https://api.regulations.gov/v4/comments?filter[commentOnId]=0900006484b07801&page[size]=250&page[number]={i}&sort=lastModifiedDate,documentId&api_key={API_KEY}")
        data = response.json()
        for item in data['data']:
            links.append(item['links']['self'])

    #RETRIEVE the agency name and the comment 
    agency = []
    comment= []
    for link in links:
        response=requests.get(f"{link}?api_key={API_KEY}")
        data = response.json()
        agency.append(data['data']['attributes']['govAgency'])
        comment.append(data['data']['attributes']['comment'])
        sleep(10)

    df = pd.DataFrame(
        {'agency': agency,
        'comment': comment
        })

    df.to_csv(output_file, index=False)

if __name__ == '__main__':
    reports_clean()