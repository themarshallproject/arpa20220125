import numpy as np
import pandas as pd

pd.set_option('display.max_rows', 500)
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)

# Read in data
df = pd.read_excel('source_data/arpaQ12022.xlsx', 'Projects', skiprows=0, index_col=0)

df_recipients = pd.read_excel('source_data/arpaQ12022.xlsx',\
                              'Recipients', skiprows=0, index_col=0)

list_le = ["police","PD","gun","law enforcement","public safety","crime","criminal","body cameras","tasers","armor","sheriff","officer", "violence", "shotspotter"]

list_court = ["court","public defenders","prosecutors","juvenile court","juvenile justice"]

list_correction = ["jail","prison","correction","incarcerated","inmate","guards","custody", "detention"]

df["law_enforcement"] = df["Project Description"].str.lower().str.contains("|".join(list_le))== True
df["court"] = df["Project Description"].str.lower().str.contains("|".join(list_court))== True
df["corrections"] = df["Project Description"].str.lower().str.contains("|".join(list_correction))== True

def find_cj_projects(row):
    if row["law_enforcement"] | row["court"] | row["corrections"]:
        return True
    else:
        pass

df["cj_related"] = df.apply(find_cj_projects, axis = 1)

df.to_excel("output_data/q1_cj_related_projects_to_vet.xlsx", index=False)