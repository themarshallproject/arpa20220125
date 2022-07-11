import pandas as pd
import numpy as np

import os
os.path.isdir('source_data')

df = pd.read_excel('source_data/SLFRF-2021.xlsx', 'Project Updated', skiprows=0, index_col=0)

#conditions: 
#police, PD = police
#gun, law enforcement, public safety, crime, criminal = le (law enforcement)
#body cameras, tasers, armor = equipment
#sheriff, officer = staff 
#jail, prison, correction, incarcerated, inmate, juvenile, custody, 

conditions = [(df['Project Description'].str.lower().str.contains('police')== True),
              (df['Project Description'].str.contains('PD')== True),
              (df['Project Description'].str.lower().str.contains('gun')== True),
              (df['Project Description'].str.lower().str.contains('law enforcement')== True), 
              (df['Project Description'].str.lower().str.contains('public safety')== True),
              (df['Project Description'].str.lower().str.contains('crime')== True),
              (df['Project Description'].str.lower().str.contains('criminal')== True),
              (df['Project Description'].str.lower().str.contains('body cameras')== True),
              (df['Project Description'].str.lower().str.contains('tasers')== True),
              (df['Project Description'].str.lower().str.contains('armor')== True),
              (df['Project Description'].str.lower().str.contains('sheriff')== True),
              (df['Project Description'].str.lower().str.contains('officer')== True),
              (df['Project Description'].str.lower().str.contains('jail')== True),
              (df['Project Description'].str.lower().str.contains('prison')== True),
              (df['Project Description'].str.lower().str.contains('correction')== True),
              (df['Project Description'].str.lower().str.contains('incarcerated')== True),
              (df['Project Description'].str.lower().str.contains('inmate')== True),
              (df['Project Description'].str.lower().str.contains('juvenile court')== True),
              (df['Project Description'].str.lower().str.contains('juvenile justice')== True),
              (df['Project Description'].str.lower().str.contains('custody')== True)]

choices = ["police", "police", "le", "le", "le", "le", "le" ,"equipment", "equipment", "equipment", "staff", "staff", "doc", "doc", "doc", "doc", "doc", "doc", "doc", "doc"]
df["le_cat"] = np.select(conditions, choices, default="other")
df["law_enforcement"] = np.where((df["le_cat"] != "other"), 1, 0)

recipients = df.groupby(["SLT Application ID", 'Recipient Name', "State/Territory", "law_enforcement", "Total Expenditures"])["Total Obligations"].sum().reset_index()
recipients_le = recipients[recipients["law_enforcement"]!=0].sort_values(by=['Total Obligations'], ascending = False)

tranche = pd.read_excel('SLFRF-2021.xlsx', 'Recipients Updated', skiprows=0, index_col=0)
result = pd.merge(recipients_le, tranche, on=["SLT Application ID","Recipient Name"])
result = result.rename(columns={result.columns[-1]: 'tranche'})

result['share_le']=result['Total Expenditures']/result['tranche']
result.sort_values(by='share_le', ascending = False)

result.to_csv("output_data/arpa_le.csv")
