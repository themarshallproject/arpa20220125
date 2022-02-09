import pandas as pd
import glob
from xml.sax import ContentHandler, parse


filenames = glob.glob("output_data/AL/*.xls")

class ExcelHandler(ContentHandler):
    def __init__(self):
        self.chars = [  ]
        self.cells = [  ]
        self.rows = [  ]
        self.tables = [  ]
    def characters(self, content):
        self.chars.append(content)
    def startElement(self, name, atts):
        if name=="Cell":
            self.chars = [  ]
        elif name=="Row":
            self.cells=[  ]
        elif name=="Table":
            self.rows = [  ]
    def endElement(self, name):
        if name=="Cell":
            self.cells.append(''.join(self.chars))
        elif name=="Row":
            self.rows.append(self.cells)
        elif name=="Table":
            self.tables.append(self.rows)

for file in filenames:
    excel_handler = ExcelHandler()
    parse(file, excel_handler)
    df = pd.DataFrame(excel_handler.tables[0][7:], columns=excel_handler.tables[0][6])
    df = df[df["Category"].notna()]
    df = df[df["Category"].str.contains("Category") == False]
    df = df[df["Cumulative Obligations"].str.contains("Total Cumulative Obligations") == False]
    df.drop(df.tail(1).index,inplace=True) 
    df.drop([86], inplace=True)
    name = file.split("AL/")[1]
    name = name.split('.xls')[0]
    name = name.split(',')[0]
    df['Territory'] = name
    df.to_excel(f'output_data/CLEAN/{name}.xls', index = False)


x = 'output_data/AL/Randolph County, Alabama Interim Report.xls'

parse(x, excelHandler)
df = pd.DataFrame(excelHandler.tables[0][7:], columns=excelHandler.tables[0][6])

df = df[df["Category"].notna()]
df = df[df["Category"].str.contains("Category") == False]
df = df[df["Cumulative Obligations"].str.contains("Total Cumulative Obligations") == False]
df.drop(df.tail(1).index,inplace=True)
df.drop([86], inplace=True)
name = x.split("AL/")[1]
name = name.split('.')[0]
name = name.split(',')[0]
df['Territory']= name
df.to_excel(f'output_data/NEW/{name}.xls', index = False)



