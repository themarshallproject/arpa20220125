import pandas as pd

df = pd.concat(pd.read_excel('analysis/source_data/cleveland/arpa_cle_indirect.xlsx', sheet_name=None), ignore_index=True)

df['Amount'] = df['Amount'].astype(float)

df.to_csv("analysis/source_data/cleveland/cle_indirect_multiple.csv", index = False)