import pandas as pd 
#FILTERING and CLEANING df_cities for Ohio 
df_cities = pd.read_csv("analysis/source_data/allocation/fiscalrecoveryfunds-metrocitiesfunding1-CSV.csv")
df_cities = df_cities.loc[df_cities['State'] == "Ohio"]
df_cities = df_cities[['City', 'Allocation']].rename(columns = {"City":"recipient", "Allocation":"allocation"})
df_cities["source"] = "treasury"
df_cities['allocation'] = (df_cities['allocation'].str.strip('$'))
df_cities['allocation'] = df_cities['allocation'].str.replace(',','')
df_cities['allocation'] = df_cities['allocation'].str.replace('.00','')
df_cities['allocation'] = df_cities['allocation'].astype(int)

df_cities.to_csv("analysis/source_data/allocation/cuyahoga_cities_allocation.csv", index = False)