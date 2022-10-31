import pandas as pd

#CLEANING THE DIRECT CJ SPENDING DATA
df_init = pd.read_csv("analysis/source_data/cleveland/cuyahoga_arpa_projects_to_vet.csv")

df_init = df_init[df_init['Vet'].str.contains("cj")==True]

df_init = df_init[["Recipient Name", "Total Cumulative Obligations", "Project Description", \
    "Focus" ]].rename(columns = {
     "Recipient Name": "recipient",
     "Project Description": "Project description",
     "Total Cumulative Obligations": "Amount",
     "Focus": "Focus" })

df_init["source"] = "direct"

df_init['Amount'] = df_init['Amount'].fillna(0)

df_init['Amount'] = df_init['Amount'].astype(float)

#CLEANING THE INDIRECT CJ SPENDING DATA

df_add = pd.read_csv("analysis/source_data/cleveland/cle_indirect_multiple.csv")

df_add = df_add[["recipient", "Amount", "Project description", "Focus"]]

df_add["source"] = "indirect"

df_add['Amount'] = df_add['Amount'].astype(float)

#CONCAT two files that have the same structure 

df_all = pd.concat([df_init, df_add])

df_all.to_csv("analysis/output_data/cle_cj_all_spending.csv", index=False) 
