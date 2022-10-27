import pandas as pd

df = pd.concat(pd.read_excel('analysis/source_data/cleveland/arpa_cle_additional.xlsx', sheet_name=None), ignore_index=True)

df['Amount'] = df['Amount'].str.replace(',','')
df['Amount'] = df['Amount'].astype(float)

df.to_csv("analysis/source_data/cleveland/additional_cle.csv", index = False)