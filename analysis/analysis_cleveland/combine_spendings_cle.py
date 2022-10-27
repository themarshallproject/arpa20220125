import pandas as pd

#CLEANING THE INITIAL CJ SPENDING DATA
df_init = pd.read_csv("analysis/source_data/cleveland/cuyahoga_arpa_projects_to_vet.csv")

df_init = df_init[df_init['Vet'].str.contains("cj")==True]

df_init = df_init[["Recipient Name", "Total Cumulative Obligations", "Project Description", \
    "Focus" ]].rename(columns = {
     "Recipient Name": "recipient",
     "Project Description": "Project description",
     "Total Cumulative Obligations": "Amount",
     "Focus": "Focus" })

df_init["source"] = "initial"

df_init['Amount'] = df_init['Amount'].fillna(0)

df_init['Amount'] = df_init['Amount'].astype(float)

#CLEANING THE ADDITIONAL CJ SPENDING DATA

df_add = pd.read_csv("analysis/source_data/cleveland/arpa_cle_additional.csv")

df_add = df_add[["recipient", "Amount", "Project description", "Focus"]]

df_add["source"] = "additional"

#df_add['Amount'] = df_add['Amount'].str.replace('.00','')
#df_add['Amount'] = df_add['Amount'].fillna(0)
df_add['Amount'] = df_add['Amount'].astype(float)
df_add.info()

#CONCAT two files that have the same structure 

df_all = pd.concat([df_init, df_add])

df_all.to_csv("analysis/output_data/cle_cj_spending_data.csv", index=False) 
