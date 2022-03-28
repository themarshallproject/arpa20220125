import click
import requests
from time import sleep
import json
import os

@click.command()
@click.argument("docket_id")
def get_comments(docket_id):

    API_KEY_REG=os.getenv('API_KEY_REG')

    click.echo("REQUESTING by the docket ID")
    query_params = {
        "filter[docketId]": docket_id,
        "api_key": API_KEY_REG
    }
    response = requests.get("https://api.regulations.gov/v4/documents", params=query_params)

    data = response.json()

    click.echo("FIND the objectId")
    objectId=data['data'][0]['attributes']['objectId']
    click.echo(f'found {objectId}')

    click.echo("LOOP through the pages to get the links")
    links=[]
    for i in range (1, 5):
        query_params = {
            "filter[docketId]": docket_id,
            "filter[commentOnId]": objectId,
            "page[size]": 250,
            "page[number]": i,
            "sort": "lastModifiedDate,documentId",
            "api_key": API_KEY
        }
        response = requests.get("https://api.regulations.gov/v4/comments", params=query_params)
        data = response.json()
        for item in data['data']:
            links.append(item['links']['self'])

    click.echo("DOWNLOAD all the comments as jsons") 
    for link in links:
        query_params = {
            "api_key": API_KEY
        }
        response=requests.get(link, params=query_params)
        data = response.json()
        filename=link.split("0008-")[1]
        with open(f"output_data/comments/{filename}.json", 'w') as f:
            json.dump(data, f)
        sleep(7)

if __name__ == '__main__':
    get_comments()