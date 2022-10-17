import csv
import pandas as pd

df = pd.read_csv("analysis/output_data/q1_cj_related_projects_to_vet.csv")

df1 = pd.read_csv("analysis/source_data/cle_arpa.csv")
cle = list(df1["cle_arpa"])

df = df.loc[df["State/Territory"] == "Ohio"]
df = df[df['Recipient Name'].isin(cle)]

df.to_csv("analysis/output_data/cle_data.csv", index=False) 