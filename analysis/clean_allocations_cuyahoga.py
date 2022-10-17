import tabula
import pandas as pd

df = tabula.read_pdf("analysis/source_data/ARPA_Non-Entitlement_Allocations_Distributions_2022-05-13.pdf", pages=[5,6])[0]
tabula.convert_into("analysis/source_data/ARPA_Non-Entitlement_Allocations_Distributions_2022-05-13.pdf", "analysis/output_data/NEU_allocations.csv", output_format="csv", pages=[5,6])

df = pd.read_csv("analysis/output_data/NEU_allocations.csv")
df = df.loc[df['County'] == "Cuyahoga"]

df = df[['Entity Name', 'Total Allocation\r(4)']].rename(columns = {"Entity_Name":"Recipient", "Total Allocation\r(4)":"Total_allocation"})

df.to_csv("analysis/output_data/NEU_allocations.csv", index = False)
