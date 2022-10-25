import pandas as pd

df_counties = pd.read_csv("analysis/source_data/allocation/fiscalrecoveryfunds_countyfunding_2021.05.10-1a.csv", engine='python',encoding='latin1')
df_counties = df_counties.loc[df_counties['State'] == "Ohio"]
df_counties = df_counties.loc[df_counties['County'] == "Cuyahoga County"]
df_counties = df_counties[['County', 'Allocation']].rename(columns = {"County":"recipient", "Allocation":"allocation"})
df_counties["source"] = "treasury"
df_counties['allocation'] = (df_counties['allocation'].str.strip('$'))
df_counties['allocation'] = df_counties['allocation'].str.replace(',','')
df_counties['allocation'] = df_counties['allocation'].str.replace('.00','')
df_counties['allocation'] = df_counties['allocation'].astype(int)

df_counties.to_csv("analysis/source_data/allocation/cuyahoga_county_allocation.csv", index = False)