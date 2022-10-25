import pandas as pd

df = pd.read_csv("analysis/source_data/selection/Ohio_CC_ARPA_additional.csv")

df['Amount'] = df['Amount'].str.replace(',','')
df['Amount'] = df['Amount'].astype(float)

df.to_csv("analysis/source_data/allocation/additional.csv", index = False)