import pandas as pd

#CLEANING THE DIRECT CJ SPENDING DATA
df_dir = pd.read_csv("analysis/source_data/cleveland/cuyahoga_arpa_projects_vetted.csv")

df_dir = df_dir[df_dir['Vet'].str.contains("cj")==True]

df_dir = df_dir[["Recipient Name", "Total Cumulative Obligations", "Project Description", \
    "Focus" ]].rename(columns = {
     "Recipient Name": "recipient",
     "Project Description": "Project description",
     "Total Cumulative Obligations": "Amount",
     "Focus": "Focus" })

df_dir["source"] = "direct"

df_dir['Amount'] = df_dir['Amount'].fillna(0)

df_dir['Amount'] = df_dir['Amount'].astype(float)

#CLEANING THE INDIRECT CJ SPENDING DATA

df_indir = pd.read_csv("analysis/source_data/cleveland/cle_indirect_multiple.csv")

df_indir = df_indir[["recipient", "Amount", "Project description", "Focus"]]

df_indir["source"] = "indirect"

df_indir['Amount'] = df_indir['Amount'].astype(float)

#CONCAT two files that have the same structure 

df_all = pd.concat([df_dir, df_indir])

df_all.to_csv("analysis/output_data/cle_cj_all_spending.csv", index=False) 
