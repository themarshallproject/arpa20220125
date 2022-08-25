import pandas as pd
import click

@click.command()
@click.argument('input_filename')
@click.argument('output_filename')
def process(input_filename, output_filename):
    df = read_json(input_filename)
    df_ranked = rank_data(df)
    export(df_ranked, output_filename)

def read_json(input_filename):
    df = pd.read_json(input_filename)
    return df

def rank_data(df):
    grouped_df = df.groupby(["Expenditure Category Group", "Expenditure Category"])["Total Cumulative Obligations"].sum().reset_index()
    return grouped_df

def export(df_grouped, output_filename):
    df_grouped.to_csv(output_filename, index=False)
    print("export obligation grouped by category")

if __name__ == '__main__':
    process()