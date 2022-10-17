import pandas as pd

df = pd.read_excel('analysis/source_data/April-2022-Quarterly-and-Annual-Reporting-Data-through-March-31-2022.xlsx', 'Projects', skiprows=0, index_col=0)

df = df.loc[df['Recipient Name'] == "Independence, Missouri"]

df.to_csv("analysis/output_data/indep_data.csv", index=False)



