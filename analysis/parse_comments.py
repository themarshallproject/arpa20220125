import click
import glob
import json
from bs4 import BeautifulSoup
import pandas as pd

@click.command()
@click.argument("output", type=click.File('w'))
def parse_comments(output):

    agency = []
    author = []
    comment= []
    url=[]
    
    files = glob.glob("output_data/comments/*.json")
    for file in files:
        f=open(file)
        data = json.load(f)
        #click.echo(data['data']['attributes']['govAgency'])
        agency.append(data['data']['attributes']['govAgency'])
        #click.echo(data['data']['attributes']['title'])
        title = data['data']['attributes']['title'].replace("Comment from ", "")
        author.append(title) 
        text = (data['data']['attributes']['comment'])
        try:
            soup = BeautifulSoup(text, features="html.parser")
            comment.append(soup.get_text())
        except:
            comment.append(text)
        link = data['data']['links']['self']
        link=link.split('comments/')[1]
        link=f'https://www.regulations.gov/comment/{link}'
        #click.echo(link)
        url.append(link)

    df = pd.DataFrame(
    {'agency': agency,
     'author': author,
     'comment': comment,
     'url': url 
    })

    df.to_csv(output, index=False)

if __name__ == '__main__':
    parse_comments()