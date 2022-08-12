import pandas as pd
import click

@click.command()
@click.argument('input_filename')
@click.argument('output_filename')
def process(input_filename, output_filename):
    print("Hello World!")
    print(input_filename)
# @click.command()
# @click.argument('input_filename')
# def read_csv(input_filename):

# def export(output_filename):

if __name__ == '__main__':
    process()