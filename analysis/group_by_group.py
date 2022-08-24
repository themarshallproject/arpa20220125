import pandas as pd
import click

@click.command()
@click.argument('input_filename')
@click.argument('output_filename')
def process(input_filename, output_filename):
    df = read_csv(input_filename)
    df_grouped = group_data(df)
    export(df_grouped, output_filename)

def read_csv(input_filename):
    xl = pd.ExcelFile(input_filename)
    df = xl.parse("Projects")  # read a specific sheet to DataFrame
    return df

def group_data(df):
    df_grouped = df.groupby(["Expenditure Category Group"]).agg({"Total Cumulative Obligations":'sum', "Project Name": 'size'}).reset_index()
    df_grouped["Obligations, %"] =  100 * (df_grouped['Total Cumulative Obligations']/df_grouped['Total Cumulative Obligations'].sum().round(2))
    df_grouped['Expenditure Category Group'] = df_grouped['Expenditure Category Group'].str[2:]
    df_grouped = df_grouped[df_grouped["Total Cumulative Obligations"]!= 0]
    df_grouped = df_grouped.rename(columns={"Expenditure Category Group": "Expenditure group", "Total Cumulative Obligations": "Obligations, $", 'Project Name': 'Number of projects'})
    df_grouped["Expenditure group"] = df_grouped['Expenditure group'].str.lower()
    df_grouped["Expenditure group"] = df_grouped['Expenditure group'].str.capitalize()
    df_grouped["Expenditure group"] = df_grouped["Expenditure group"].replace("Public health-negative economic impact: public sector capacity", "Public sector capacity*")
    df_grouped = df_grouped[["Expenditure group", "Obligations, %", "Obligations, $", "Number of projects"]]
    df_grouped = df_grouped.sort_values(by='Obligations, %', ascending=False)
    return df_grouped

def export(df_grouped, output_filename):
    df_grouped.to_csv(output_filename, index=False)
    print("export obligation grouped by group")

if __name__ == '__main__':
    process()