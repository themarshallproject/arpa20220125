import tabula
import pandas as pd

df = tabula.read_pdf("analysis/source_data/allocation/ARPA_Non-Entitlement_Allocations_Distributions_2022-05-13.pdf", pages=[5,6])[0]
tabula.convert_into("analysis/source_data/allocation/ARPA_Non-Entitlement_Allocations_Distributions_2022-05-13.pdf", "analysis/source_data/allocation/NEU_allocations_toclean.csv", output_format="csv", pages=[5,6])

df = pd.read_csv("analysis/source_data/allocation/NEU_allocations_toclean.csv")
df = df.loc[df['County'] == "Cuyahoga"]

df = df[['Entity Name', 'Total Allocation\r(4)']].rename(columns = {"Entity Name":"recipient", "Total Allocation\r(4)":"allocation"})

df["source"] = "ohio-gov"

df['allocation'] = df['allocation'].str.replace('^[^\d]*','', regex=True)
df['allocation'] = df['allocation'].str.replace(',','')
df['allocation'] = df['allocation'].astype(int)

df.to_csv("analysis/source_data/allocation/NEU_allocations.csv", index = False)