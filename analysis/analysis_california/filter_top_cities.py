import pandas as pd

df = pd.read_csv("analysis/output_data/q1_cj_related_projects_to_vet.csv")

df1 = pd.read_csv("analysis/source_data/top_cities.csv")
cities = list(df1["top_cities"])

df = df[df['Recipient Name'].isin(cities)]

df.to_csv("analysis/output_data/cities_data.csv", index=False) 