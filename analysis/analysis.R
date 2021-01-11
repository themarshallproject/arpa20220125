# Analysis script. <Add your explanation here>.

print("This is the R script speaking. Hello, world!")

# Read in the test data, put there by the Makefile:
df = read.csv("analysis/source_data/input.csv")

# Copy it into the output data folder
write.csv(df, "analysis/output_data/output.csv", row.names=FALSE)

