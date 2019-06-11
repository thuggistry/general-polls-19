from bs4 import BeautifulSoup
import requests
import pandas as pd
import json

def read_data():
    df = pd.read_csv('data/data.csv')
    df = df.to_json(orient='records')
    return df

def extract_data():
    url = 'https://timesofindia.indiatimes.com/elections/results'
    response = requests.get(url.strip()).text
    soup = BeautifulSoup(response, 'lxml')
    test = soup.find("div", property="id:stateBody")
    return json.dumps(test)