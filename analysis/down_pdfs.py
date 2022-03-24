import click
import pandas as pd
import requests
from urllib.request import urlopen
import urllib.parse
import validators

@click.command()
@click.argument("links_file")
def down_pdfs(links_file):

    df = pd.read_csv(links_file)
    df = df.dropna(subset=['Recovery_Plan_link'])

    for url in df['Recovery_Plan_link']:
        if validators.url(url) == True:
            r = requests.get(url)
            if r.status_code == 200:
                try:
                    filename=url.rsplit('/', 1)[1]
                    open(f'output_data/pdfs/{filename}', 'wb').write(r.content)
                    click.echo(f'saved {filename}')
                except:
                    url = urllib.parse.urlsplit(url)
                    url = list(url)
                    url[2] = urllib.parse.quote(url[2])
                    url = urllib.parse.urlunsplit(url)
                    filename=url.rsplit('/', 1)[1]
                    open(f'output_data/pdfs/{filename}', 'wb').write(r.content)
            else:
                print(url)
        else:
            click.echo(f'{url} invalid')

if __name__ == '__main__':
    down_pdfs()