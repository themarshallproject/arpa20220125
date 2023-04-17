import pandas as pd
import click
import json

@click.command()
@click.argument('input_filename')
@click.argument('output_filename')
def process(input_filename, output_filename):
    df = read_csv(input_filename)
    filtered_data = filter_data(df)
    export(filtered_data, output_filename)

def read_csv(input_filename):
    f = open(input_filename)
    data = json.load(f)['data']['requests']
    df = pd.DataFrame(data)
    return df

def filter_data(df):
    filtered_data = df[df['wtf'] == True]
    return filtered_data

def export(filtered_data, output_filename):
    filtered_data.to_json(output_filename, orient='records')
    print("export filter graphics data")

if __name__ == '__main__':
    process()