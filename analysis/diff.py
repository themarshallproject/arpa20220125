import pandas as pd


df1 = pd.read_excel('source_data/SLFRF-2021.xlsx', 'Project Updated', skiprows=0, index_col=0)
df2 = pd.read_excel('source_data/arpaQ12022.xlsx', 'Projects', skiprows=0, index_col=0)

df = df1.merge(df2, how = 'outer' ,indicator=True).loc[lambda x : x['_merge']=='left_only']