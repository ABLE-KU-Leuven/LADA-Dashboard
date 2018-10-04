# Uncertainty Dashboard

Our visualization proposes a reusable representation of prediction systems to guide decision makers to understand the implicit *uncertainty* that is present on *machine-learning* prediction algorithms.

In particular, for our case of study (*Academic Risk based on Historical Data)*. There are three main sources of *uncertainty*, the
**prediction model**, the **data consistency** and the **case completeness** of the historic dataset.

**Uncertainty Dashboard** is a proposed visualization technique where the risk to fail in an academic semester is predicted by the machine learning algorithm and is  presented to the users (professors and academics) in a straightforward way, so they can make an informed decision concerning the optimal student's academic load.

## Early Prototype

<img src="public/a.png">

<img src="public/b.jpg">

## Pointers to publications
### Case study report
http://www.ableproject.eu/project/reports-three-institutional-case-studies/

### Data collection and utilization
http://www.ableproject.eu/project/report-methods-and-tools-to-collect-and-utilise-data/

### Visualization and analysis
http://www.ableproject.eu/project/report-methods-and-tools-to-visualise-and-analyse-learning-analytics-data/

### Scientific publications 
Gutiérrez, F., Seipp, K., Ochoa, X., Chiluiza, K., De Laet, T., Verbert, K. (2018a) LADA: a Learning Analytics Dashboard for Academic Advising. Accepted for publication in Computers in Human Behavior  (IF 3.435). 15 pages

## How to

Be sure to install [meteor.js](https://www.meteor.com/install) in your machine, then simply:
```bash
git clone https://github.com/FranciscoGutierrez/uncertaintyDashboard.git
cd uncertaintyDashboard
meteor
```

URLs for testing:

```bash
// a
// http://localhost:3000/200909893?c=ICM00166,FIEC03046,FIEC01545
//
// b
// http://localhost:3000/200834711?c=ICM00166,FIEC03046,FIEC01545
```

# Technical Documentation

The following are useful scripts for the development/deployment of the dashboard.

## Dealing with database

``` Bash
# Going into the database and get some data
meteor mongo
show dbs
db.courses.find()
# Destroy database, reload project dependencies and stuff from scratch.
meteor reset
```
## Import Data
Basic **mongoimport** command.
``` Bash
mongoimport --db meteor --collection courses --file courses.json --host=127.0.0.1:3001
mongoimport --db meteor --collection studentscourses --file students_courses.json --host=127.0.0.1:3001
mongoimport --db meteor --collection students --file students.json --host=127.0.0.1:3001
```

## Python Converters
If data is on CSV this is an easy way to convert it to JSON, and then import.
### Option 1
``` Python
import csv
import json

csvfile = open('courses.csv', 'r')
jsonfile = open('courses.json', 'w')

fieldnames = ("alpha","beta","skewness","_id","name")
reader = csv.DictReader( csvfile, fieldnames)
for row in reader:
    json.dump(row, jsonfile)
    jsonfile.write('\n')
```
### Option 2
``` Python
import csvmapper
jsonfile = open('courses.json', 'w')
# parser instance
parser = csvmapper.CSVParser('courses.csv', hasHeader=True)
# conversion service
converter = csvmapper.JSONConverter(parser)
print converter.doConvert(pretty=False)
jsonfile.write(converter.doConvert(pretty=False))
```

## Communication

Clients use **WebSocket** as communication channel with the prediction server, when asking for a prediction the client uses the following format:

```json
[
  {
    "requestId": "5645f7f7ef0bde57344c84de",
    "student": [
      {
        "id": "5645f7f70a7cd6ab830e8722",
        "gpa": 7.0793,
        "performance": 0.6,
        "compliance": 3
      }
    ],
    "courses": [
      {
        "id": "5645f7f73077f65af76df45a",
        "compliance": 2
      },
      {
        "id": "5645f7f7fccab1b5dd662a4b",
        "compliance": 5
      },
      {
        "id": "5645f7f7e7b8050367ef5cff",
        "compliance": 5
      },
      {
        "id": "5645f7f70ea9b237c0039330",
        "compliance": 5
      }
    ],
    "data": [
      {
        "from": 2009,
        "to": 2015,
        "program": true,
        "sylabus": true,
        "evaluation": false,
        "instructors": true,
        "compliance": 2
      }
    ]
  }
]

```

To change the prediction server **URL** there is a special file named **websocket.js** at the client folder.
