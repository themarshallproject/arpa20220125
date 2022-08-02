import numpy as np
import pandas as pd
import click



pd.set_option('display.max_rows', 500)
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)

@click.command()
@click.option('-f', '--format', 'format')
def process_data(format='xlsx'):
    # Read in data
    click.echo('Reading in source file', err=True)
    df = pd.read_excel('analysis/source_data/arpaQ12022.xlsx', 'Projects', skiprows=0, index_col=0)

    df_recipients = pd.read_excel('analysis/source_data/arpaQ12022.xlsx',\
                                'Recipients', skiprows=0, index_col=0)

    list_le = ['police','PD','gun','law enforcement','public safety','crime','criminal','body cameras','tasers','armor','sheriff','officer', 'violence', 'shotspotter']

    list_court = ['court','public defenders','prosecutors','juvenile court','juvenile justice']

    list_correction = ['jail','prison','correction','incarcerated','inmate','guards','custody', 'detention']

    df['law_enforcement'] = df['Project Description'].str.lower().str.contains('|'.join(list_le))== True
    df['court'] = df['Project Description'].str.lower().str.contains('|'.join(list_court))== True
    df['corrections'] = df['Project Description'].str.lower().str.contains('|'.join(list_correction))== True

    def find_cj_projects(row):
        if row['law_enforcement'] | row['court'] | row['corrections']:
            return True
        else:
            pass

    df['cj_related'] = df.apply(find_cj_projects, axis = 1)


    if format == 'xlsx':
        click.echo('Writing analysis/output_data/q1_cj_related_projects_to_vet.xlsx', err=True)
        df.to_excel('analysis/output_data/q1_cj_related_projects_to_vet.xlsx', index=False)
    elif format == 'csv':
        click.echo('Writing analysis/output_data/q1_cj_related_projects_to_vet.csv', err=True)
        df.to_csv('analysis/output_data/q1_cj_related_projects_to_vet.csv', index=False)
    else:
        click.echo('No valid output format specified, must be csv or xlsx', err=True)

if __name__ == '__main__':
    process_data()