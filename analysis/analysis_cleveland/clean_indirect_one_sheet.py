import pandas as pd

df = pd.read_csv("analysis/source_data/cleveland/arpa_cle_indirect.csv")

#df['Amount'] = df['Amount'].str.replace(',','')
df['Amount'] = df['Amount'].astype(float)

df.to_csv("analysis/source_data/cleveland/arpa_cle_indirect_clean.csv", index = False)