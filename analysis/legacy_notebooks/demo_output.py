import click
import pandas as pd

@click.command()
@click.argument('dep1')
@click.argument('dep2')
@click.argument('outputfilename')
def process(dep1, dep2, outputfilename):
    print(dep1)
    print(dep2)
    df1 = pd.read_csv(dep1)
    df2 = pd.read_csv(dep2) 

    output_df = df1.join(df2)
    # .... other processing steps
    output_df.write_csv(outputfilename)       


    output_df.write_csv("/big/long/hardcoded_path.csv")


if __name__ == '__main__':
    process()