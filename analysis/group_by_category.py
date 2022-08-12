import pandas as pd
import click

@click.command()
@click.argument('input_filename')
@click.argument('output_filename')
def process(input_filename, output_filename):
    print("Hello World!")
    print(input_filename)

    df = read_csv(input_filename)
    # print("column names", df.columns)

    df_grouped = group_data(df)
    # print("grouped data column names", df_grouped.columns)

    export(df_grouped, output_filename)

def read_csv(input_filename):
    xl = pd.ExcelFile(input_filename)
    # print("sheet names", xl.sheet_names)
    df = xl.parse("Projects")  # read a specific sheet to DataFrame
    return df

def group_data(df):
    grouped_df = df.groupby(["Expenditure Category Group", "Expenditure Category"])["Total Cumulative Obligations"].sum().reset_index()
    return grouped_df

def export(df_grouped, output_filename):
    df_grouped.to_csv(output_filename, index=False)
    print("export obligation grouped by category")

if __name__ == '__main__':
    process()