import pandas as pd
import json

# Load the dataset
file_path = 'Crime_Data_from_2020_to_Present.csv'
print(f"Loading {file_path}...")
# Read only necessary columns to save memory
usecols = ['DATE OCC', 'AREA NAME', 'Crm Cd Desc', 'LAT', 'LON']
df = pd.read_csv(file_path, usecols=usecols)

# Convert DATE OCC to datetime
df['DATE OCC'] = pd.to_datetime(df['DATE OCC'])
df['Month'] = df['DATE OCC'].dt.to_period('M').astype(str)

print("Processing data...")

# 1. Overall trend over time (Monthly counts)
monthly_counts = df['Month'].value_counts().sort_index().to_dict()

# 2. Top 5 Crime Types
top_crimes = df['Crm Cd Desc'].value_counts().head(5).index.tolist()
crime_type_counts = df[df['Crm Cd Desc'].isin(top_crimes)].groupby(['Month', 'Crm Cd Desc']).size().unstack(fill_value=0).to_dict(orient='index')

# 3. Top 5 Areas
top_areas = df['AREA NAME'].value_counts().head(5).index.tolist()
area_counts = df[df['AREA NAME'].isin(top_areas)].groupby(['Month', 'AREA NAME']).size().unstack(fill_value=0).to_dict(orient='index')

# 4. Sample for Map (1000 random points)
# Filter out 0,0 coordinates
map_sample = df[(df['LAT'] != 0) & (df['LON'] != 0)].sample(n=2000, random_state=42)[['LAT', 'LON', 'Crm Cd Desc', 'AREA NAME']].to_dict(orient='records')

# Construct the final JSON structure
data = {
    "monthly_counts": monthly_counts,
    "top_crimes": top_crimes,
    "crime_type_counts": crime_type_counts,
    "top_areas": top_areas,
    "area_counts": area_counts,
    "map_sample": map_sample
}

output_file = 'crime_data_processed.json'
with open(output_file, 'w') as f:
    json.dump(data, f)

print(f"Data processed and saved to {output_file}")
