## reads in the data we processed earlier that extracts CJ-related projects by keyword
## filter to Ohio
## then match the receipient nae with our hand-compiled names for Cuyahoga county cities/towns
## for more vetting on Google Sheet
## https://docs.google.com/spreadsheets/d/10A3xUicxV0yoEtRXz85z_nqDwzy_TbMqh_XD9qLNTok/edit#gid=912893235
import csv
import pandas as pd

df = pd.read_csv("analysis/output_data/q1_cj_related_projects_to_vet.csv")

df1 = pd.read_csv("analysis/source_data/cle_arpa.csv")
cle = list(df1["cle_arpa"])

df = df.loc[df["State/Territory"] == "Ohio"]
df = df[df['Recipient Name'].isin(cle)]

df.to_csv("analysis/output_data/cuyahoga_arpa_projects_to_vet.csv", index=False) 